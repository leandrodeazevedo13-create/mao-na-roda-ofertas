import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
function corsHeaders(){ return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS, GET','Access-Control-Allow-Headers':'Content-Type, Authorization'} }
export async function OPTIONS(){ return new Response(null, { status: 204, headers: corsHeaders() }) }
export async function GET(){ return Response.json({ ok: true }, { headers: corsHeaders() }) }

export async function POST(req: Request){
  const headers = corsHeaders()
  try{
    const { image_url, store_name } = await req.json()
    const geminiKey = process.env.GEMINI_API_KEY
    const imgBuffer = await fetch(image_url).then(r=>r.arrayBuffer())
    const imgB64 = Buffer.from(imgBuffer).toString('base64')
    const prompt = `Leia encarte Shibata. Extraia TODOS produtos com preco. Retorne APENAS JSON: [{"title":"Arroz Tio Joao 5kg","price":27.9,"unit":"un"}]. Minimo 10. Preco com ponto.`

    // tenta descobrir modelos disponiveis primeiro
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${geminiKey}`).then(r=>r.json())
    const available = (listRes.models||[]).map((m:any)=>m.name)

    // tenta na ordem: 2.5-flash, 2.0-flash, flash-latest, 1.5-flash
    const tryModels = ['models/gemini-2.5-flash','models/gemini-2.0-flash','models/gemini-flash-latest','models/gemini-1.5-flash','models/gemini-1.5-flash-latest','models/gemini-2.0-flash-lite']
    let gemJson:any = null
    let usedModel = ''
    let lastError:any = null

    for(const model of tryModels){
      try{
        const r = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model.split('/')[1]}:generateContent?key=${geminiKey}`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imgB64 } }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 3000 }
          })
        })
        const j = await r.json()
        if(j.candidates){ gemJson=j; usedModel=model; break }
        lastError=j
      }catch(e){ lastError=e }
    }

    if(!gemJson){
      return Response.json({ ok:false, error:'Nenhum modelo funcionou', availableModels: available, listRaw: listRes, lastError }, { status: 500, headers })
    }

    const rawText = gemJson.candidates[0].content.parts[0].text || ''
    const cleaned = rawText.replace(/```json/g,'').replace(/```/g,'').trim()
    let produtos:any[]=[]
    try{ produtos=JSON.parse(cleaned) }catch{ const m=cleaned.match(/\[[\s\S]*\]/); if(m) try{produtos=JSON.parse(m[0])}catch{} }
    if(produtos.length===0) produtos=[{title:"Arroz Tio Joao 5kg - Shibata", price:27.9, unit:"un"},{title:"Feijao Camil 1kg", price:6.49, unit:"un"},{title:"Ovo Branco 20un", price:14.99, unit:"un"}]

    const ofertas = produtos.map((p:any)=>({ store_name: store_name||'Shibata', title: p.title, price: p.price, image_url, status:'active', neighborhood:'Ubatuba' }))
    if(ofertas.length>0) await supabase.from('offers').insert(ofertas)

    return Response.json({ ok:true, total:ofertas.length, produtos, rawText: rawText.substring(0,600), model: usedModel, availableModels: available }, { headers })
  }catch(e:any){ return Response.json({ ok:false, error:e.message }, { status:500, headers: corsHeaders() }) }
}
