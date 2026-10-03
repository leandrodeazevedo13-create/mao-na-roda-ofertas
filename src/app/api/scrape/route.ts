import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// BOT LEITOR - pega a imagem do jornal e quebra em produtos individuais usando IA
export async function POST(req: Request) {
  const { image_url, store_name } = await req.json()

  if (!image_url) return Response.json({ ok: false, error: 'sem image_url' }, { status: 400 })

  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  let produtos: any[] = []

  // Tenta Gemini Vision (grátis e ótimo pra encarte) ou OpenAI Vision
  try {
    if (geminiKey) {
      const prompt = `Você é um leitor de encartes de supermercado. Analise esta imagem de jornal de ofertas do Shibata.
      Extraia TODOS os produtos visíveis. Para cada um retorne JSON com: title (nome curto), price (apenas numero ex: 4.99), unit (kg, un, L), category.
      Ignore cabeçalho e rodapé. Retorne APENAS JSON array puro, sem markdown. Ex: [{"title":"Arroz Tio João 5kg","price":27.9,"unit":"un","category":"alimentos"}]`

      const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: await fetch(image_url).then(r=>r.arrayBuffer()).then(b=>Buffer.from(b).toString('base64')) } }
            ]
          }]
        })
      })
      const gemJson = await gemRes.json()
      const text = gemJson.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
      const cleaned = text.replace(/```json|```/g,'').trim()
      produtos = JSON.parse(cleaned)
    } else if (openaiKey) {
      const imgB64 = await fetch(image_url).then(r=>r.arrayBuffer()).then(b=>Buffer.from(b).toString('base64'))
      const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Leia este encarte de supermercado e extraia todos os produtos em JSON array com title, price (numero), unit. Retorne só JSON.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imgB64}` } }
            ]
          }],
          max_tokens: 2000
        })
      })
      const oaiJson = await oaiRes.json()
      const content = oaiJson.choices?.[0]?.message?.content || '[]'
      produtos = JSON.parse(content.replace(/```json|```/g,'').trim())
    } else {
      return Response.json({ ok: false, error: 'Configure GEMINI_API_KEY ou OPENAI_API_KEY na Vercel' }, { status: 400 })
    }
  } catch (e: any) {
    return Response.json({ ok: false, error: 'IA falhou: ' + e.message, raw: e }, { status: 500 })
  }

  // Insere como ofertas individuais bonitinhas
  const ofertas = produtos.map((p: any) => ({
    store_name: store_name || 'Shibata',
    title: p.title,
    price: p.price,
    image_url: image_url, // depois vamos recortar, por enquanto usa a pagina inteira mas com crop via CSS
    status: 'active',
    neighborhood: 'Ubatuba',
    description: `${p.unit || ''} ${p.category || ''}`.trim()
  }))

  if (ofertas.length > 0) {
    const { error } = await supabase.from('offers').insert(ofertas)
    if (error) throw error
  }

  return Response.json({ ok: true, total: ofertas.length, produtos })
}

export async function GET() {
  return Response.json({ ok: true, help: 'POST { image_url, store_name } com GEMINI_API_KEY configurado' })
}
