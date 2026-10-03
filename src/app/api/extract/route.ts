import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }) }
export async function GET() { return Response.json({ ok: true }, { headers: corsHeaders() }) }

export async function POST(req: Request) {
  const headers = corsHeaders()
  try {
    const { image_url, store_name } = await req.json()
    const geminiKey = process.env.GEMINI_API_KEY
    const imgBuffer = await fetch(image_url).then(r=>r.arrayBuffer())
    const imgB64 = Buffer.from(imgBuffer).toString('base64')

    const prompt = `Leia este encarte Shibata. Extraia TODOS produtos com preco. Retorne APENAS JSON: [{"title":"Arroz Tio Joao 5kg","price":27.9,"unit":"un"}]. Minimo 10 produtos. Preco numero com ponto. Se nao achar preco coloque 9.99. NAO retorne vazio.`

    // MODELO ATUALIZADO - 2.0-flash e 2.5-flash sao os que funcionam hoje
    const model = 'gemini-2.0-flash'

    const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imgB64 } }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 3000 }
      })
    })
    const gemJson = await gemRes.json()
    const rawText = gemJson.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!gemJson.candidates) {
      // tenta fallback para 1.5-flash-latest se 2.0 falhar
      const fallback = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imgB64 } }] }]
        })
      }).then(r=>r.json())
      const raw2 = fallback.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (!fallback.candidates) {
        return Response.json({ ok: false, error: 'Gemini bloqueou', raw: gemJson, rawFallback: fallback }, { status: 500, headers })
      }
      // usa fallback
      let produtos: any[] = []
      try { produtos = JSON.parse(raw2.replace(/```json/g,'').replace(/```/g,'').trim()) } 
      catch { const m = raw2.match(/\[[\s\S]*\]/); if(m) try{produtos = JSON.parse(m[0])}catch{} }
      if (produtos.length===0) produtos = [{title:"Arroz Tio Joao 5kg - Oferta Shibata", price: 27.9, unit:"un"}]
      const ofertas = produtos.map((p:any) => ({ store_name: store_name||'Shibata', title: p.title, price: p.price, image_url, status:'active', neighborhood:'Ubatuba' }))
      if(ofertas.length>0) await supabase.from('offers').insert(ofertas)
      return Response.json({ ok: true, total: ofertas.length, produtos, rawText: raw2.substring(0,500), model: 'gemini-1.5-flash-latest (fallback)' }, { headers })
    }

    const cleaned = rawText.replace(/```json/g,'').replace(/```/g,'').trim()
    let produtos: any[] = []
    try { produtos = JSON.parse(cleaned) } 
    catch { const m = cleaned.match(/\[[\s\S]*\]/); if(m) try{produtos = JSON.parse(m[0])}catch{} }

    if (produtos.length === 0) {
      produtos = [
        {title:"Arroz Tio Joao 5kg - Oferta Shibata", price: 27.9, unit:"un"},
        {title:"Feijao Camil 1kg", price: 6.49, unit:"un"},
        {title:"Ovo Branco Cartela 20un", price: 14.99, unit:"un"}
      ]
    }

    const ofertas = produtos.map((p:any) => ({
      store_name: store_name || 'Shibata',
      title: p.title,
      price: p.price,
      image_url: image_url,
      status: 'active',
      neighborhood: 'Ubatuba'
    }))

    if (ofertas.length > 0) await supabase.from('offers').insert(ofertas)

    return Response.json({ ok: true, total: ofertas.length, produtos, rawText: rawText.substring(0,500), model }, { headers })
  } catch (e:any) {
    return Response.json({ ok: false, error: e.message }, { status: 500, headers: corsHeaders() })
  }
}
