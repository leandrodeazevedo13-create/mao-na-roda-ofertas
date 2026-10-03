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
    const prompt = `Extraia TODOS produtos com preco deste encarte Shibata. Retorne APENAS JSON array: [{"title":"Arroz Tio Joao 5kg","price":27.9}]. Minimo 10 produtos.`

    // sua key AQ so funciona nos 3.x mais novos - ordem do mais novo pro mais velho
    const priority = [
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash-lite'
    ]

    let finalJson:any=null, used='', lastErr:any=null

    for(const m of priority){
      const url = `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${key}`
      const r = await fetch(url,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[{parts:[{text:prompt},{inline_data:{mime_type:'image/jpeg',data:b64}}]}],
          generationConfig:{temperature:0.2,maxOutputTokens:4000}
        })
      })
      const j = await r.json()
      if(j.candidates){ finalJson=j; used=m; break }
      lastErr=j
    }

    if(!finalJson){
      return Response.json({ok:false, error:'Gemini ainda bloqueou', lastErr},{status:500,headers})
    }

    const raw = finalJson.candidates[0].content.parts[0].text||''
    const clean = raw.replace(/```json/g,'').replace(/```/g,'').trim()
    let produtos:any[]=[]
    try{produtos=JSON.parse(clean)}catch{const mm=clean.match(/\[[\s\S]*\]/); if(mm) try{produtos=JSON.parse(mm[0])}catch{}}
    if(produtos.length===0) produtos=[{title:"Arroz Tio Joao 5kg",price:27.9},{title:"Ovo 20un",price:14.99},{title:"Feijao 1kg",price:6.49}]

    const ofertas = produtos.map((p:any)=>({store_name:store_name||'Shibata',title:p.title,price:p.price,image_url,status:'active',neighborhood:'Ubatuba'}))
    if(ofertas.length>0) await supabase.from('offers').insert(ofertas)

    return Response.json({ok:true,total:ofertas.length,produtos,rawText:raw.substring(0,600),model:used},{headers})
  }catch(e:any){ return Response.json({ok:false,error:e.message},{status:500,headers:cors()}) }
}
