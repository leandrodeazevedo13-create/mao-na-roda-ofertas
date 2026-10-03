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
    // pede bbox 0-1000 para recorte
    const prompt = `Neste encarte de supermercado, extraia TODOS produtos. Para cada, retorne title, price e bbox da foto do produto no encarte no formato [ymin, xmin, ymax, xmax] 0 a 1000. Formato JSON: [{"title":"Desinfetante Suprema 2L","price":4.49,"bbox":[100,200,300,400]}] Minimo 10.`

    const priority = ['gemini-3.8-flash','gemini-3.7-flash','gemini-3.6-flash','gemini-3.5-flash']
    let finalJson:any=null, used=''
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
    }
    if(!finalJson) return Response.json({ok:false},{status:500,headers})

    const raw = finalJson.candidates[0].content.parts[0].text||''
    let produtos:any[]=[]
    try{
      const m = raw.match(/\[[\s\S]*\]/)
      if(m) produtos = JSON.parse(m[0])
    }catch{}
    // fallback regex com bbox
    if(produtos.length < 3){
      const re = /"title"\s*:\s*"([^"]+)"[^}]*"price"\s*:\s*([0-9.]+)[^}]*"bbox"\s*:\s*\[([^\]]+)\]/g
      let mm; const tmp:any[]=[]
      while((mm=re.exec(raw))!==null){
        const bbox = mm[3].split(',').map((x:string)=>parseInt(x.trim()))
        tmp.push({title:mm[1], price: parseFloat(mm[2]), bbox})
      }
      if(tmp.length>0) produtos=tmp
    }

    const ofertas = produtos.map((p:any)=>({
      store_name: store_name||'Shibata',
      title: p.title,
      price: p.price,
      image_url,
      bbox: p.bbox||null,
      status:'active',
      neighborhood:'Ubatuba'
    }))

    if(ofertas.length>0){
      await supabase.from('offers').delete().eq('image_url', image_url)
      await supabase.from('offers').insert(ofertas)
    }

    return Response.json({ok:true,total:ofertas.length,produtos,model:used},{headers})
  }catch(e:any){ return Response.json({ok:false,error:e.message},{status:500,headers:cors()}) }
}
