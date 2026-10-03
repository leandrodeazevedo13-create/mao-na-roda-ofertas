'use client'
import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page() {
  const [offers, setOffers] = useState<any[]>([])
  const [filter, setFilter] = useState('Todos')

  useEffect(() => {
    supabase.from('offers').select('*').eq('status','active').order('created_at',{ascending:false}).then(({data})=>setOffers(data||[]))
  }, [])

  const filtered = offers.filter(o => {
    if (filter === 'Todos') return true
    return o.store_name.toLowerCase().includes(filter.toLowerCase())
  })

  // Oferta do dia = Semar com preço 0 (banner) ou primeiro com preço
  const ofertaDia = offers.find(o=>o.store_name==='Semar') || offers[0]
  const gridOffers = offers.filter(o=>o.price > 0) // só produtos individuais bonitinhos

  return (
    <div className="min-h-screen bg-[#fefce8] max-w-[480px] mx-auto">
      <header className="bg-black text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2"><span>🛒</span><div><p className="font-black text-[14px] leading-none">MÃO NA RODA Ofertas</p><p className="text-[10px] text-zinc-400">UBATUBA - Todas em 1 lugar</p></div></div>
        <span className="bg-white/20 text-[10px] px-2 py-1 rounded-full">• AO VIVO</span>
      </header>

      <div className="bg-orange-500 text-white text-[11px] p-2 flex justify-between"><span>Siga @maonarodao.ubatuba • novidades todo dia</span><span className="bg-black text-[9px] px-2 py-0.5 rounded-full">NOVO</span></div>

      {ofertaDia && (
        <div className="m-3 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-[20px] p-3 border border-orange-200">
          <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full">🔥 OFERTA DO DIA</span>
          <div className="flex gap-3 mt-2">
            <img src={ofertaDia.image_url} alt="" className="w-20 h-28 object-contain bg-white rounded-xl" />
            <div><p className="font-bold text-[13px]">{ofertaDia.title}</p><p className="text-zinc-500 text-[12px]">{ofertaDia.store_name}</p></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 px-3 overflow-x-auto pb-2">
        {['Todos','Shibata','Semar','California','Peixão'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-[13px] whitespace-nowrap ${filter===f?'bg-black text-white':'bg-white border'}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 p-3">
        {filtered.filter(o=>o.price>0).map((o,i)=><ProductCard key={i} offer={o} />)}
        {filtered.filter(o=>o.price>0).length===0 && filtered.map((o,i)=>(
          <div key={i} className="bg-white rounded-[20px] p-2 border"><img src={o.image_url} className="w-full h-32 object-contain" /><p className="text-[12px] mt-1 line-clamp-2">{o.title}</p></div>
        ))}
      </div>
    </div>
  )
}
