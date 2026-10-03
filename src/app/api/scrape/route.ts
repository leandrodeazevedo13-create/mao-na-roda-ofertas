import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET() {
  try {
    const res = await fetch('https://www.semarentrega.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      },
      cache: 'no-store'
    })
    if (!res.ok) throw new Error(`Home retornou ${res.status}`)
    const html = await res.text()

    const bannerRegex = /https:\/\/[^"']*?(?:banner[^"']*oferta|ofertas[^"']*semar|ofetas[^"']*whatsapp)[^"']*?\.webp[^"']*/gi
    const genericBannerRegex = /https:\/\/[^"']*\/arquivos\/[^"']*?banner[^"']*?\.(?:webp|jpg|png)[^"']*/gi

    const found = new Set<string>()
    let match
    while ((match = bannerRegex.exec(html)) !== null) {
      found.add(match[0].replace(/\\u002F/g, '/').replace(/\\"/g, ''))
    }
    while ((match = genericBannerRegex.exec(html)) !== null) {
      const url = match[0]
      if (url.toLowerCase().includes('oferta') || url.toLowerCase().includes('virada') || url.toLowerCase().includes('semana') || url.toLowerCase().includes('maluca') || url.toLowerCase().includes('43anos') || url.toLowerCase().includes('aniversario')) {
        found.add(url.replace(/\\u002F/g, '/'))
      }
    }

    const banners = Array.from(found).slice(0, 6)
    if (banners.length === 0) {
      const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
      if (ogMatch) banners.push(ogMatch[1])
    }

    // SEM coluna description - só colunas que existem no seu banco
    const ofertas = banners.map((img, idx) => ({
      store_name: 'Semar',
      title: idx === 0 ? 'Virada dos Sonhos - 43 Anos Semar (Banner Oficial)' : `Oferta Semar - Banner ${idx + 1}`,
      price: 0,
      image_url: img,
      status: 'active',
      neighborhood: 'São Miguel - 04'
    }))

    if (ofertas.length > 0) {
      await supabase.from('offers').delete().eq('store_name', 'Semar')
      const { error } = await supabase.from('offers').insert(ofertas)
      if (error) throw error
    }

    return Response.json({
      ok: true,
      modo: 'AUTOMATICO BANNER - permitido',
      total_banners: banners.length,
      banners,
      ofertas_inseridas: ofertas.length
    })

  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
