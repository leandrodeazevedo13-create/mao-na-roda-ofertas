import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: Request) {
  const { image_url, store_name } = await req.json()
  if (!image_url) return Response.json({ ok: false, error: 'sem image_url' }, { status: 400 })

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) return Response.json({ ok: false, error: 'Configure GEMINI_API_KEY na Vercel' }, { status: 400 })

  try {
    const imgBuffer = await fetch(image_url).then(r=>r.arrayBuffer())
    const imgB64 = Buffer.from(imgBuffer).toString('base64')

    const prompt = `Leia este encarte de supermercado Shibata. Extraia TODOS os produtos. Retorne APENAS JSON array: [{"title":"Arroz Tio João 5kg","price":27.9,"unit":"un"}]`

    const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: imgB64 } }] }]
      })
    })
    const gemJson = await gemRes.json()
    const text = gemJson.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const produtos = JSON.parse(text.replace(/```json|```/g,'').trim())

    const ofertas = produtos.map((p:any) => ({
      store_name: store_name || 'Shibata',
      title: p.title,
      price: p.price,
      image_url: image_url,
      status: 'active',
      neighborhood: 'Ubatuba'
    }))

    if (ofertas.length > 0) {
      await supabase.from('offers').insert(ofertas)
    }

    return Response.json({ ok: true, total: ofertas.length, produtos })
  } catch (e:any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
