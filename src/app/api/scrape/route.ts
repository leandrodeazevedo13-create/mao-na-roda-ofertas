import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const storeParam = (searchParams.get('store') || 'all').toLowerCase()

  const scrapeShibata = async () => {
    const res = await fetch('https://shibata.com.br/ofertas/', {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120', Accept: 'text/html' },
      cache: 'no-store'
    })
    const html = await res.text()
    const rgx = /https:\/\/shibata\.com\.br\/wp-content\/uploads\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi
    const set = new Set<string>()
    let m
    while ((m = rgx.exec(html)) !== null) {
      const url = m[0]
      // FILTRO: tira favicon e miniaturas 150x150 e 300x300 - só deixa jornal grande
      if (url.includes('favicon')) continue
      if (url.includes('150x150')) continue
      if (url.includes('300x300')) continue
      // só pega campanha do jornal (igual da sua print: campanha-688-cluster-10)
      if (!url.includes('campanha-') && !url.includes('jornal') && !url.includes('ofertas')) continue
      // só imagem grande
      if (url.includes('-768x') || url.includes('-1024x') || url.includes('-1200x') || url.includes('-1006') || url.match(/\.jpe?g$/)) {
         // deixa passar se for grande, mas evita duplicata pequena
         const base = url.replace(/-\d+x\d+\.(jpg|png)$/, '.jpg').replace(/-150x150.*/, '').replace(/-300x300.*/, '')
         // truque: só adiciona se não for miniatura
         if (!url.includes('150x') && !url.includes('300x')) set.add(url)
      } else {
        set.add(url)
      }
    }
    // Pega só as 4 páginas principais (evita duplicata de mesmo arquivo em tamanhos diferentes)
    // Mantém só a versão maior de cada página
    const unique = new Map<string, string>()
    for (const u of set) {
      const key = u.replace(/-\d+x\d+\.(jpg|jpeg|png)/, '').replace(/\.(jpg|jpeg|png).*$/, '')
      // se já existe, mantém a maior (com mais caracteres ou com 1200)
      if (!unique.has(key) || u.includes('1200') || u.length > (unique.get(key)?.length || 0)) {
        unique.set(key, u)
      }
    }
    return Array.from(unique.values()).slice(0, 4)
  }

  const scrapeSemar = async () => {
    const homeRes = await fetch('https://www.semarentrega.com.br/', {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120', Accept: 'text/html' },
      cache: 'no-store'
    })
    const html = await homeRes.text()
    const found = new Set<string>()
    const patterns = [
      /https:\/\/[^\s"'<>]+\/arquivos\/ids\/[^\s"'<>]*?banner[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
      /https:\/\/[^\s"'<>]*?banner[^\s"'<>]*?oferta[^\s"'<>]*?\.(?:webp|jpg|png)/gi,
    ]
    for (const rgx of patterns) {
      let m
      while ((m = rgx.exec(html)) !== null) {
        let url = m[0]
        if (!url.toLowerCase().includes('logo') && url.length < 500) found.add(url)
      }
    }
    let banners = Array.from(found).slice(0, 3)
    if (banners.length === 0) banners = ['https://semarsupermercados.vtexassets.com/arquivos/ids/155000/banner-mobile-oferta-43anos.jpg']
    return banners
  }

  try {
    let allBanners: { store: string, urls: string[] }[] = []

    if (storeParam === 'all' || storeParam === 'shibata') {
      const shibataBanners = await scrapeShibata()
      allBanners.push({ store: 'Shibata', urls: shibataBanners })
    }
    if (storeParam === 'all' || storeParam === 'semar') {
      const semarBanners = await scrapeSemar()
      allBanners.push({ store: 'Semar', urls: semarBanners })
    }

    // Insere sem apagar a outra loja
    let totalInseridas = 0
    for (const g of allBanners) {
      await supabase.from('offers').delete().eq('store_name', g.store)
      const ofertas = g.urls.map((img, idx) => ({
        store_name: g.store,
        title: g.store === 'Shibata' ? `Jornal de Ofertas Shibata - Pág ${idx+1} - 02 a 05/10` : 'Virada dos Sonhos - 43 Anos Semar',
        price: 0,
        image_url: img,
        status: 'active',
        neighborhood: g.store === 'Shibata' ? 'Ubatuba' : 'São Miguel - 04'
      }))
      if (ofertas.length > 0) {
        const { error } = await supabase.from('offers').insert(ofertas)
        if (error) throw error
        totalInseridas += ofertas.length
      }
    }

    return Response.json({
      ok: true,
      modo: 'AUTOMATICO MULTI - Semar + Shibata',
      lojas: allBanners.map(b => ({ store: b.store, total: b.urls.length, banners: b.urls })),
      total_inseridas: totalInseridas
    })

  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
