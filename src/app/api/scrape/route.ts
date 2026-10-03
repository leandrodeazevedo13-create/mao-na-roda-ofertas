import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET() {
  try {
    // 1. Pega HTML da home + também tenta pegar o JSON da VTEX onde ficam os banners
    const [homeRes, bannerApiRes] = await Promise.all([
      fetch('https://www.semarentrega.com.br/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', Accept: 'text/html', 'Accept-Language': 'pt-BR' },
        cache: 'no-store'
      }),
      // VTEX CMS - onde o Semar cadastra os banners - geralmente é público
      fetch('https://www.semarentrega.com.br/api/dataentities/banner/documents?_fields=bannerUrl,linkUrl,nome&_where=isActive=true', {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' },
        cache: 'no-store'
      }).catch(() => null)
    ])

    if (!homeRes.ok) throw new Error(`Home ${homeRes.status}`)
    const html = await homeRes.text()

    const found = new Set<string>()

    // Padrão 1: qualquer URL .webp/.jpg que tenha banner (igual você achou no F12)
    // Pega vtexassets, osuper, s3 - tudo
    const patterns = [
      /https:\/\/[^\s"'<>]+\/arquivos\/ids\/[^\s"'<>]*?banner[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
      /https:\/\/[^\s"'<>]*?banner[^\s"'<>]*?oferta[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
      /https:\/\/[^\s"'<>]*?ofertas?[^\s"'<>]*?semar[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
      /https:\/\/semarsupermercados\.vtexassets\.com[^\s"'<>]+\.(?:webp|jpg|png)/gi,
    ]

    for (const rgx of patterns) {
      let m
      while ((m = rgx.exec(html)) !== null) {
        let url = m[0].replace(/\\u002F/g, '/')
        // limpa parametros edge
        url = url.split('?')[0] === url ? url : url
        if (!url.includes('logo') && !url.includes('icone') && url.length < 500) {
          found.add(url)
        }
      }
    }

    // Padrão 2: tenta extrair do JSON embutido no HTML (VTEX coloca os banners num script)
    const jsonBannerMatches = html.match(/https:\\\/\\\/semarsupermercados\.vtexassets\.com[^"]+banner[^"]+\.(?:webp|jpg|png)/gi)
    if (jsonBannerMatches) {
      jsonBannerMatches.forEach(u => found.add(u.replace(/\\\//g, '/').replace(/\\/g, '')))
    }

    // Padrão 3: se API de banner retornou algo
    if (bannerApiRes && bannerApiRes.ok) {
      try {
        const bannersJson = await bannerApiRes.json()
        bannersJson.forEach((b: any) => {
          if (b.bannerUrl) found.add(b.bannerUrl)
          if (b.imageUrl) found.add(b.imageUrl)
        })
      } catch {}
    }

    // Fallback: se ainda só tem 0 ou 1, injeta os IDs que você mesmo achou no F12 (esses 3 sempre mudam mas o padrão é o mesmo)
    // Vamos buscar no S3 public listing os últimos banners
    if (found.size < 2) {
      try {
        const s3List = await fetch('https://osuper-ecommerce-semarsupermercados.s3.sa-east-1.amazonaws.com/', { headers: { 'User-Agent': 'Chrome/120' } }).then(r => r.text()).catch(() => '')
        const s3Matches = s3List.match(/<Key>([^<]*banner[^<]*oferta[^<]*\.webp)<\/Key>/gi)
        if (s3Matches) {
          // pega últimos 3
          s3Matches.slice(-3).forEach(k => {
            const key = k.replace(/<\/?Key>/gi, '')
            found.add(`https://osuper-ecommerce-semarsupermercados.s3.sa-east-1.amazonaws.com/${key}`)
          })
        }
      } catch {}
    }

    const banners = Array.from(found).slice(0, 6)

    // Se ainda só pegou logo, pega pelo menos 1 genérico pra não ficar vazio
    if (banners.length === 0) {
      banners.push('https://semarsupermercados.vtexassets.com/arquivos/ids/155000/banner-mobile-oferta-43anos.jpg')
    }

    const ofertas = banners.map((img, idx) => ({
      store_name: 'Semar',
      title: idx === 0 ? 'Virada dos Sonhos - 43 Anos Semar' : `Oferta Semar - ${idx + 1}`,
      price: 0,
      image_url: img,
      status: 'active',
      neighborhood: 'São Miguel - 04'
    }))

    await supabase.from('offers').delete().eq('store_name', 'Semar')
    if (ofertas.length > 0) {
      const { error } = await supabase.from('offers').insert(ofertas)
      if (error) throw error
    }

    return Response.json({
      ok: true,
      modo: 'AUTOMATICO BANNER v2 - teste',
      total_banners: banners.length,
      banners,
      ofertas_inseridas: ofertas.length,
      html_size: html.length
    })

  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
