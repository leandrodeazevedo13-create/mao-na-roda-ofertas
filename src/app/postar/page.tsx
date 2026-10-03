'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Offer = {
  id: string
  store_name: string
  title: string
  price: number
  image_url?: string
  neighborhood?: string
}

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [filter, setFilter] = useState('Todos')

  useEffect(() => {
    supabase.from('offers').select('*').eq('status','active').order('created_at', { ascending: false }).limit(40).then(({data}) => {
      if (data) setOffers(data as any)
    })
  }, [])

  const stores = ['Todos', ...Array.from(new Set(offers.map(o => o.store_name)))]

  const filtered = filter === 'Todos' ? offers : offers.filter(o => o.store_name === filter)

  return (
    <main style={{ background: '#FFFBEB', minHeight: '100vh', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <header style={{ background: '#111827', color: 'white', padding: '20px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>MÃO NA RODA <span style={{ color: '#FACC15' }}>UBATUBA</span></h1>
          <span style={{ background: '#FACC15', color: 'black', padding: '6px 12px', borderRadius: 20, fontWeight: 800, fontSize: 12 }}>AO VIVO</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: '12px 0 4px' }}>Ofertas de hoje em Ubatuba</h2>
        <p style={{ color: '#374151', fontWeight: 600, marginBottom: 16 }}>Semar, Shibata, California e mais. Atualizado todo dia.</p>

        {/* FILTRO */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
          {stores.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '2px solid #111827',
                background: filter === s ? '#111827' : 'white',
                color: filter === s ? 'white' : '#111827',
                fontWeight: 800,
                fontSize: 14,
                whiteSpace: 'nowrap'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginTop: 8 }}>
          {filtered.map(offer => (
            <div key={offer.id} style={{ background: 'white', border: '2px solid #111827', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 120, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {offer.image_url ? (
                  <img src={offer.image_url} alt={offer.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 32 }}>🛒</span>
                )}
              </div>
              <div style={{ padding: 10 }}>
                <span style={{ background: '#FACC15', color: 'black', fontSize: 10, fontWeight: 900, padding: '3px 6px', borderRadius: 6 }}>{offer.store_name?.toUpperCase()}</span>
                <p style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2, margin: '6px 0', color: '#111827', minHeight: 32 }}>{offer.title}</p>
                <p style={{ fontWeight: 900, fontSize: 18, color: '#111827' }}>R$ {Number(offer.price).toFixed(2).replace('.', ',')}</p>
                {offer.neighborhood && <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, marginTop: 2 }}>📍 {offer.neighborhood}</p>}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ background: 'white', border: '2px dashed #111827', borderRadius: 16, padding: 24, textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontWeight: 800 }}>Nenhuma oferta pra {filter} hoje</p>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Cadastra no /admin ou verifica o Supabase `offers`</p>
          </div>
        )}

        <footer style={{ textAlign: 'center', marginTop: 32, padding: 20, color: '#6B7280', fontSize: 12, fontWeight: 600 }}>
          maonarodaofertas.com.br • Feito em Ubatuba • {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  )
}
