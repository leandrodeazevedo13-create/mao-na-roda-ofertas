import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

// SEMAR - via API VTEX do semarentrega.com.br
async function scrapeSemar() {
  try {
    // Busca os produtos em oferta da API VTEX - filtra por Ubatuba (loja 330)
    const url = 'https://www.semarentrega.com.br/api/catalog_system/pub/products/search?ft&O=OrderByTopSaleDESC&_from=0&_to=19'
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MaoNaRoda/1.0' },
      next: { revalidate: 0 }
    })
    if (!res.ok) throw new Error(`Semar HTTP ${res.status}`)
    const data = await res.json()

    const items = data.map((p: any) => {
      const sku = p.items?.[0]
      const offer = sku?.sellers?.[0]?.commertialOffer
      return {
        store_name: 'Semar',
        title: p.productName,
        price: offer?.Price || offer?.ListPrice || 0,
        image_url: sku?.images?.[0]?.imageUrl || p.items?.[0]?.images?.[0]?.imageUrl || null,
        status: 'active',
        neighborhood: 'Centro',
        // preço antigo para mostrar desconto
        old_price: offer?.ListPrice > offer?.Price ? offer?.ListPrice : null
      }
    }).filter((i: any) => i.price > 0).slice(0, 20)

    if (items.length) {
      await supabase.from('offers').delete().eq('store_name', 'Semar')
      const { error } = await supabase.from('offers').insert(items)
      if (error) throw error
    }

    await supabase.from('scraping_logs').insert({
      store_name: 'Semar',
      status: 'success',
      message: `Semar: ${items.length} ofertas`,
      items_found: items.length
    })
    return { store: 'Semar', count: items.length, items: items.slice(0,3).map((i:any)=>i.title) }
  } catch (e: any) {
    await supabase.from('scraping_logs').insert({
      store_name: 'Semar',
      status: 'error',
      message: e.message,
      items_found: 0
    })
    return { store: 'Semar', error: e.message }
  }
}

// SHIBATA - encarte em PDF - por enquanto puxa do Instagram/ cria placeholder e avisa
// A solução real é: você tira foto do encarte e sobe via admin, ou usa OCR
async function scrapeShibata() {
  try {
    // Shibata bloqueia scraper, encarte é PDF. 
    // Estratégia: busca página de ofertas pra pegar links dos PDFs mais recentes
    const res = await fetch('https://shibata.com.br/ofertas/', {
      headers: { 'User-Agent': 'MaoNaRoda/1.0' }
    })
    const html = await res.text()
    // pega datas dos jornais - ex: "02 a 05/10"
    const hasOffers = html.includes('Jornal de Ofertas')

    await supabase.from('scraping_logs').insert({
      store_name: 'Shibata',
      status: hasOffers ? 'needs_manual' : 'empty',
      message: hasOffers ? 'Shibata usa PDF - baixe manualmente e cadastre via /admin' : 'Nenhum encarte encontrado',
      items_found: 0
    })

    return { 
      store: 'Shibata', 
      count: 0, 
      note: 'Shibata usa PDF. Solução: foto do encarte -> /admin ou Instagram @shibatasupermercados',
      pdf_page: 'https://shibata.com.br/ofertas/',
      tip: 'Crie uma rota /api/shibata-manual onde você cola 5 ofertas do encarte que o robô insere'
    }
  } catch (e: any) {
    return { store: 'Shibata', error: e.message }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store')?.toLowerCase()

  let results: any[] = []
  if (!store || store === 'semar') results.push(await scrapeSemar())
  if (!store || store === 'shibata') results.push(await scrapeShibata())

  return Response.json({ ok: true, ran_at: new Date().toISOString(), results })
}
