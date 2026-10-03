import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// AUTOMÁTICO COMPLIANT - usa API pública do VTEX, sem proxy, sem antibot
// Endpoint oficial que o próprio site do Semar usa para listar produtos

async function scrapeSemarAPIOficial() {
  try {
    // API pública VTEX - lista ofertas por ordenação TopSale
    const url = 'https://www.semarentrega.com.br/api/catalog_system/pub/products/search?ft=oferta&_from=0&_to=19&O=OrderByTopSaleDESC'
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Mão na Roda Ubatuba - parceria)'
      },
      next: { revalidate: 3600 } // cache 1h
    })

    if (!res.ok) {
      throw new Error(`Semar retornou ${res.status} - pode estar em manutenção`)
    }

    const products = await res.json()
    
    const ofertas = products.map((p: any) => {
      const item = p.items?.[0]
      const seller = item?.sellers?.[0]
      const offer = seller?.commertialOffer
      return {
        store_name: 'Semar',
        title: p.productName,
        price: offer?.Price || offer?.ListPrice || 0,
        image_url: item?.images?.[0]?.imageUrl || null,
        status: 'active',
        neighborhood: 'Centro',
        external_id: p.productId
      }
    }).filter((o: any) => o.price > 0)

    if (ofertas.length > 0) {
      // limpa antigas do Semar e insere novas
      await supabase.from('offers').delete().eq('store_name', 'Semar')
      await supabase.from('offers').insert(ofertas.map(({ external_id, ...rest }: any) => rest))
    }

    await supabase.from('scraping_logs').insert({
      store_name: 'Semar',
      status: 'success',
      message: `API VTEX oficial: ${ofertas.length} ofertas`,
      items_found: ofertas.length
    })

    return { store: 'Semar', count: ofertas.length, via: 'VTEX API Pública' }
  } catch (e: any) {
    await supabase.from('scraping_logs').insert({
      store_name: 'Semar',
      status: 'error',
      message: e.message,
      items_found: 0
    })
    return { store: 'Semar', count: 0, error: e.message }
  }
}

// Instagram OFICIAL - só funciona se o dono do @semarsupermercados autorizar seu app no Meta for Developers
// Isso é 100% dentro das regras do Instagram Graph API
async function scrapeInstagramOficial() {
  const TOKEN = process.env.INSTAGRAM_GRAPH_TOKEN // token de longa duração que o Semar te dá
  const IG_ID = process.env.SEMAR_IG_USER_ID
  
  if (!TOKEN || !IG_ID) {
    return { store: 'Shibata', count: 0, note: 'Sem token oficial - peça autorização do mercado no developers.facebook.com' }
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media?fields=caption,media_url,timestamp&limit=5&access_token=${TOKEN}`)
    const data = await res.json()
    
    const ofertas = (data.data || []).flatMap((post: any) => {
      const linhas = (post.caption || '').match(/.*R\$\s*[\d.,]+.*/g) || []
      return linhas.slice(0, 2).map((l: string) => ({
        store_name: 'Shibata',
        title: l.replace(/R\$.*/, '').trim().slice(0, 100),
        price: parseFloat((l.match(/R\$\s*([\d.,]+)/i)?.[1] || '0').replace(',', '.')),
        image_url: post.media_url,
        status: 'active',
        neighborhood: 'Centro'
      })).filter((o: any) => o.price > 0)
    })

    if (ofertas.length) {
      await supabase.from('offers').delete().eq('store_name', 'Shibata')
      await supabase.from('offers').insert(ofertas)
    }

    return { store: 'Shibata', count: ofertas.length, via: 'Instagram Graph API Oficial' }
  } catch (e: any) {
    return { store: 'Shibata', count: 0, error: e.message }
  }
}

export async function GET() {
  const semar = await scrapeSemarAPIOficial()
  const insta = await scrapeInstagramOficial()

  return Response.json({
    ok: true,
    automatic: true,
    ran_at: new Date().toISOString(),
    results: [semar, insta],
    next: 'Configure CRON na Vercel: vercel.json com "schedule": "0 9 * * *" apontando pra /api/scrape'
  })
}
