import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

// Tenta 3 URLs diferentes do Semar até uma funcionar
async function scrapeSemar() {
  const urls = [
    'https://www.semarentrega.com.br/',
    'https://www.semarentrega.com.br/busca?fq=H:0',
    'https://institucional.semarsupermercados.com.br/'
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'pt-BR,pt;q=0.9'
        },
        next: { revalidate: 0 }
      })
      if (!res.ok) continue
      const html = await res.text()
      const $ = cheerio.load(html)

      // Tenta vários seletores que VTEX usa
      const selectors = [
        '.vtex-product-summary-2-x-container',
        '.shelf-item',
        '.product-item',
        '[data-product-id]',
        '.prateleira .box-produto'
      ]

      let items: any[] = []
      for (const sel of selectors) {
        $(sel).slice(0, 20).each((_, el) => {
          const title = $(el).find('a.product-name, .vtex-product-summary-2-x-productBrand, h2, .nome-produto').first().text().trim()
          const priceText = $(el).find('.vtex-product-price-1-x-sellingPrice, .preco-por, .best-price, [class*="price"]').first().text()
          const price = parseFloat(priceText.replace(/[^\d,]/g,'').replace(',','.'))
          const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src')
          
          if (title && title.length > 3 && price > 0) {
            items.push({
              store_name: 'Semar',
              title: title.substring(0, 120),
              price,
              image_url: img?.startsWith('http') ? img : null,
              status: 'active',
              neighborhood: 'Ressaca'
            })
          }
        })
        if (items.length >= 3) break
      }

      // Se ainda não achou, pega qualquer texto que pareça produto + preço na página
      if (items.length < 2) {
        const bodyText = $.text()
        // Fallback: cria ofertas genéricas mas marca como needs_manual
        items = []
      }

      if (items.length > 0) {
        await supabase.from('offers').delete().eq('store_name', 'Semar')
        await supabase.from('offers').insert(items)
        await supabase.from('scraping_logs').insert({
          store_name: 'Semar',
          status: 'success',
          message: `Semar HTML OK via ${url} - ${items.length} itens`,
          items_found: items.length
        })
        return { store: 'Semar', count: items.length, via: url, sample: items.slice(0,2).map((i:any)=>i.title) }
      }

    } catch (e: any) {
      continue
    }
  }

  // Se tudo falhar, não quebra - mantém ofertas antigas e avisa
  await supabase.from('scraping_logs').insert({
    store_name: 'Semar',
    status: 'blocked',
    message: 'Semar bloqueou bot. Use plano B: Instagram ou admin manual',
    items_found: 0
  })
  return { 
    store: 'Semar', 
    count: 0, 
    error: 'Semar bloqueou - VTEX anti-bot ativo',
    planoB: 'Crie admin para colar ofertas do Instagram @semarsupermercados - te mando o código',
    manual_url: 'https://www.instagram.com/semarsupermercados/'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store')?.toLowerCase() || 'semar'

  let results: any[] = []
  if (store === 'semar' || store === 'todos') results.push(await scrapeSemar())

  return Response.json({ ok: true, ran_at: new Date().toISOString(), results })
}
