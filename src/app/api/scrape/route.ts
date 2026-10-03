import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// AUTOMÁTICO PERMITIDO: pega os banners de oferta da home pública do Semar
// Não usa API bloqueada, só lê o HTML público igual o navegador
export async function GET() {
  try {
    // Pega HTML da home - igual você abre no Chrome
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

    // Procura por todos os banners de oferta que você achou no F12
    // Padrões que você mesma encontrou: banner-mobile-oferta, ofertas-semar, ofetas-no-whatsapp
    const bannerRegex = /https:\/\/[^"']*?(?:banner[^"']*oferta|ofertas[^"']*semar|ofetas[^"']*whatsapp)[^"']*?\.webp[^"']*/gi
    
    // Também pega qualquer imagem de banner da VTEX
    const genericBannerRegex = /https:\/\/[^"']*\/arquivos\/[^"']*?banner[^"']*?\.(?:webp|jpg|png)[^"']*/gi

    const found = new Set<string>()
    let match

    while ((match = bannerRegex.exec(html)) !== null) {
      found.add(match[0].replace(/\\u002F/g, '/').replace(/\\"/g, ''))
    }
    while ((match = genericBannerRegex.exec(html)) !== null) {
      // só banners que parecem oferta (tem 43 anos, virada, oferta maluca, fim de semana)
      const url = match[0]
      if (url.toLowerCase().includes('oferta') || url.toLowerCase().includes('virada') || url.toLowerCase().includes('semana') || url.toLowerCase().includes('maluca')) {
        found.add(url.replace(/\\u002F/g, '/'))
      }
    }

    const banners = Array.from(found).slice(0, 6) // pega até 6 banners

    if (banners.length === 0) {
      // fallback: tenta pegar og:image ou banner principal da home
      const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
      if (ogMatch) banners.push(ogMatch[1])
    }

    // Transforma cada banner em uma "oferta" no seu banco
    // Como o preço está DENTRO da imagem, a gente salva a imagem inteira
    const ofertas = banners.map((img, idx) => ({
      store_name: 'Semar',
      title: idx === 0 ? 'Virada dos Sonhos - 43 Anos Semar (Banner Oficial)' : `Oferta Semar - Banner ${idx + 1}`,
      price: 0, // preço está dentro da imagem, usuário vê na imagem
      image_url: img,
      status: 'active',
      neighborhood: 'São Miguel - 04',
      description: 'Banner oficial capturado automaticamente da home'
    }))

    if (ofertas.length > 0) {
      await supabase.from('offers').delete().eq('store_name', 'Semar')
      const { error } = await supabase.from('offers').insert(ofertas)
      if (error) throw error
    }

    await supabase.from('scraping_logs').insert({
      store_name: 'Semar',
      status: 'success',
      message: `Banners automáticos: ${ofertas.length} imagens capturadas`,
      items_found: ofertas.length
    })

    return Response.json({
      ok: true,
      modo: 'AUTOMATICO BANNER - permitido',
      explica: 'Lê HTML público da home e extrai URLs de banner .webp que você achou no F12',
      total_banners: banners.length,
      banners,
      ofertas_inseridas: ofertas.length
    })

  } catch (e: any) {
    await supabase.from('scraping_logs').insert({
      store_name: 'Semar',
      status: 'error',
      message: e.message,
      items_found: 0
    })
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
