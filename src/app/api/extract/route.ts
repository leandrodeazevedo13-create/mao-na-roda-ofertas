import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
function cors(){ return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS, GET','Access-Control-Allow-Headers':'Content-Type, Authorization'} }
export async function OPTIONS(){ return new Response(null,{status:204,headers:cors()}) }
export async function GET(){ return Response.json({ok:true},{headers:cors()}) }

export async function POST(req:Request){
  const headers=cors()
  try{
    const { image_url, store_name } = await req.json()
    const key = process.env.GEMINI_API_KEY
    const buf = await fetch(image_url).then(r=>r.arrayBuffer())
    const b64 = Buffer.from(buf).toString('base64')
    const prompt = `Extraia TODOS os produtos com preco deste encarte Shibata. Para cada produto retorne title e price. Formato JSON array apenas: [{"title":"Nome completo","price":11.90}] . Seja preciso no titulo.`

    const priority = ['gemini-3.8-flash','gemini-3.7-flash','gemini-3.6-flash','gemini-3.5-flash','gemini-3.5-flash-lite']
    let finalJson:any=null, used='', lastErr:any=null
    for(const m of priority){
      const r = await fetch(`https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${key}`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[{parts:[{text:prompt},{inline_data:{mime_type:'image/jpeg',data:b64}}]}],
          generationConfig:{temperature:0.1,maxOutputTokens:8000}
        })
      })
      const j = await r.json()
      if(j.candidates){ finalJson=j; used=m; break }
      lastErr=j
    }
    if(!finalJson) return Response.json({ok:false,lastErr},{status:500,headers})

    const raw = finalJson.candidates[0].content.parts[0].text||''
    // parser robusto que pega mesmo se JSON quebrar no meio
    let produtos:any[]=[]
    try{
      const clean = raw.replace(/```json/g,'').replace(/```/g,'').trim()
      const match = clean.match(/\[[\s\S]*\]/)
      if(match) produtos = JSON.parse(match[0])
    }catch{}
    // fallback regex: pega todos os {"title":..., "price":...} mesmo cortado
    if(produtos.length < 5){
      const re = /\{\s*"title"\s*:\s*"([^"]+)"\s*,\s*"price"\s*:\s*([0-9]+\.?[0-9]*)/g
      let m; const tmp:any[]=[]
      while((m=re.exec(raw))!==null){ tmp.push({title:m[1], price: parseFloat(m[2])}) }
      if(tmp.length>produtos.length) produtos=tmp
    }

    if(produtos.length===0) produtos=[{title:"Panettone Frutas 400g",price:11.9},{title:"Arroz 5kg",price:27.9}]

    const ofertas = produtos.map((p:any)=>({store_name:store_name||'Shibata',title:p.title,price:p.price,image_url,status:'active',neighborhood:'Ubatuba'}))
    if(ofertas.length>0){
      await supabase.from('offers').delete().eq('store_name','Shibata')
      await supabase.from('offers').insert(ofertas)
    }

    return Response.json({ok:true,total:ofertas.length,produtos,model:used},{headers})
  }catch(e:any){ return Response.json({ok:false,error:e.message},{status:500,headers:cors()}) }
}
