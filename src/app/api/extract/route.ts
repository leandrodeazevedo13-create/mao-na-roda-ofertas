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

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

export async function GET() {
  return Response.json({ ok: true, help: 'POST com image_url' }, { headers: corsHeaders() })
}

export async function POST(req: Request) {
  const headers = corsHeaders()
  try {
    const { image_url, store_name } = await req.json()
    if (!image_url) return Response.json({ ok: false, error: 'sem image_url' }, { status: 400, headers })

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) return Response.json({ ok: false, error: 'Configure GEMINI_API_KEY na Vercel' }, { status: 400, headers })

    const imgBuffer = await fetch(image_url).then(r=>r.arrayBuffer())
    const imgB64 = Buffer.from(imgBuffer).toString('base64')

    const prompt = `Leia este encarte de supermercado Shibata. Extraia TODOS os produtos. Retorne APENAS JSON array: [{"title":"Arroz Tio João 5kg","price":27.9,"unit":"un"}]. Se não achar preço, coloque 0.`

    const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imgB64 } }] }]
      })
    })
    const gemJson = await gemRes.json()
    if (!gemJson.candidates) {
      return Response.json({ ok: false, error: 'Gemini bloqueou', raw: gemJson }, { status: 500, headers })
    }
    const text = gemJson.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const cleaned = text.replace(/```json|```/g,'').trim()
    let produtos: any[] = []
    try { produtos = JSON.parse(cleaned) } catch { produtos = JSON.parse(cleaned.match(/\[.*\]/s)?.[0] || '[]') }

    const ofertas = produtos.map((p:any) => ({
      store_name: store_name || 'Shibata',
      title: p.title,
      price: p.price,
      image_url: image_url,
      status: 'active',
      neighborhood: 'Ubatuba'
    }))

    if (ofertas.length > 0) {
      const { error } = await supabase.from('offers').insert(ofertas)
      if (error) throw error
    }

    return Response.json({ ok: true, total: ofertas.length, produtos }, { headers })
  } catch (e:any) {
    return Response.json({ ok: false, error: e.message }, { status: 500, headers: corsHeaders() })
  }
}
