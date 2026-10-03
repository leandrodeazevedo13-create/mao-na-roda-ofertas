import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const store = (searchParams.get('store') || 'semar').toLowerCase()

  try {
    let banners: string[] = []
    let storeName = 'Semar'

    if (store === 'shibata') {
      storeName = 'Shibata'
      const res = await fetch('https://shibata.com.br/ofertas/', {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120', 'Accept': 'text/html', 'Accept-Language': 'pt-BR' },
        cache: 'no-store'
      })
      const html = await res.text()
      // Pega todas as imagens do jornal - wp-content/uploads/...outubro...jpg/png/webp
      const rgx = /https:\/\/shibata\.com\.br\/wp-content\/uploads\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi
      const set = new Set<string>()
      let m
      while ((m = rgx.exec(html)) !== null) {
        const url = m[0]
        // Ignora logo, icones
        if (!url.includes('logo') && !url.includes('Shibata-logo') && url.length < 400) {
          set.add(url)
        }
      }
      // Tenta também pegar imagem do Open Graph do jornal
      const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      if (og) set.add(og[1])
      banners = Array.from(set).slice(0, 8)
    } else {
      // SEMAR - v2 que já tá funcionando
      storeName = 'Semar'
      const homeRes = await fetch('https://www.semarentrega.com.br/', {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120', Accept: 'text/html', 'Accept-Language': 'pt-BR' },
        cache: 'no-store'
      })
      const html = await homeRes.text()
      const found = new Set<string>()
      const patterns = [
        /https:\/\/[^\s"'<>]+\/arquivos\/ids\/[^\s"'<>]*?banner[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
        /https:\/\/[^\s"'<>]*?banner[^\s"'<>]*?oferta[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
        /https:\/\/semarsupermercados\.vtexassets\.com[^\s"'<>]+\.(?:webp|jpg|png)/gi,
      ]
      for (const rgx of patterns) {
        let m
        while ((m = rgx.exec(html)) !== null) {
          let url = m[0]
          if (!url.toLowerCase().includes('logo') && url.length < 500) found.add(url)
        }
      }
      banners = Array.from(found).slice(0, 6)
      if (banners.length === 0) {
        banners = ['https://semarsupermercados.vtexassets.com/arquivos/ids/155000/banner-mobile-oferta-43anos.jpg']
      }
    }

    const ofertas = banners.map((img, idx) => ({
      store_name: storeName,
      title: store === 'shibata' 
        ? (idx === 0 ? 'Jornal de Ofertas Shibata - 02 a 05/10' : `Oferta Shibata ${idx+1}`)
        : (idx === 0 ? 'Virada dos Sonhos - 43 Anos Semar' : `Oferta Semar ${idx+1}`),
      price: 0,
      image_url: img,
      status: 'active',
      neighborhood: store === 'shibata' ? 'Ubatuba' : 'Sao Miguel - 04'
    }))

    // Apaga só da loja atual e insere novas
    await supabase.from('offers').delete().eq('store_name', storeName)
    if (ofertas.length > 0) {
      const { error } = await supabase.from('offers').insert(ofertas)
      if (error) throw error
    }

    return Response.json({
      ok: true,
      store: storeName,
      modo: store === 'shibata' ? 'AUTOMATICO SHIBATA' : 'AUTOMATICO BANNER v2',
      total_banners: banners.length,
      banners,
      ofertas_inseridas: ofertas.length
    })

  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
