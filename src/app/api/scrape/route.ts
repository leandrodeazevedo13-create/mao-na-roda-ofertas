import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

// CONFIG dos mercados - você troca a URL real de cada um
const STORES = [
  { slug: 'california', name: 'California', url: 'https://www.california.com.br/ofertas', selector: '.product-card' },
  { slug: 'semar', name: 'Semar', url: 'https://www.semar.com.br/ofertas', selector: '.produto' },
  { slug: 'covabra', name: 'Covabra', url: 'https://www.covabra.com.br/ofertas', selector: '.item' },
  { slug: 'peixao', name: 'Peixão', url: 'https://www.peixao.com.br', selector: '.offer' },
]

async function log(store: string, status: string, message: string, count = 0) {
  await supabase.from('scraping_logs').insert({
    store_slug: store,
    status,
    message,
    items_found: count
  })
}

export async function scrapeStore(store: typeof STORES[0]) {
  try {
    console.log(`[ROBO] Iniciando ${store.name}...`)
    const res = await fetch(store.url, { 
      headers: { 'User-Agent': 'MaoNaRoda-Bot/1.0 (Ubatuba)' },
      next: { revalidate: 0 }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    const html = await res.text()
    const $ = cheerio.load(html)
    
    const items: any[] = []
    $(store.selector).slice(0, 20).each((_, el) => {
      const title = $(el).find('h2, .title, [data-title]').first().text().trim()
      const priceText = $(el).find('.price, .preco, [data-price]').first().text().replace(/[^\d,]/g,'').replace(',','.')
      const price = parseFloat(priceText)
      const image_url = $(el).find('img').first().attr('src')
      
      if (title && price) {
        items.push({
          store_name: store.name,
          title: title.substring(0, 120),
          price,
          image_url: image_url?.startsWith('http') ? image_url : null,
          status: 'active',
          neighborhood: 'Centro'
        })
      }
    })

    if (items.length > 0) {
      // apaga ofertas antigas desse mercado e insere novas
      await supabase.from('offers').delete().eq('store_name', store.name)
      await supabase.from('offers').insert(items)
      await log(store.slug, 'success', `Atualizado com ${items.length} ofertas`, items.length)
      return { store: store.name, count: items.length }
    } else {
      await log(store.slug, 'empty', 'Nenhum seletor encontrou produto - precisa ajustar selector', 0)
      return { store: store.name, count: 0, warn: 'ajustar selector' }
    }

  } catch (e: any) {
    await log(store.slug, 'error', e.message, 0)
    return { store: store.name, count: 0, error: e.message }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('store') // ?store=california para testar só um
  
  const toRun = target ? STORES.filter(s => s.slug === target) : STORES
  
  const results = []
  for (const store of toRun) {
    const r = await scrapeStore(store)
    results.push(r)
  }

  return Response.json({ ok: true, ran_at: new Date().toISOString(), results })
}
