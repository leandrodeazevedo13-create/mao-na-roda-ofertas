import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home(){
  const [offers,setOffers]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ load() },[])
  async function load(){
    setLoading(true)
    const { data } = await supabase.from('offers').select('*').eq('status','approved').order('created_at',{ascending:false})
    setOffers(data||[])
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-[#FFF7F2]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w- mx-auto px-4 py-3 flex justify-between items-center">
          <div><h1 className="font-black text- leading-none">MÃO NA RODA</h1><p className="text- font-bold tracking-[0.2em] opacity-60">UBATUBA • OFERTAS REAIS</p></div>
          <div className="text- bg-black text-white px-2.5 py-1 rounded-full font-bold">{offers.length} ofertas</div>
        </div>
      </header>
      <main className="max-w- mx-auto px-3 py-3 pb-24">
        <div className="grid gap-3">
          {offers.map(o=>(
            <div key={o.id} className="bg-white rounded- border overflow-hidden shadow-sm">
              <div className="w-full h-36 overflow-hidden bg-zinc-100">
                <img src={o.image_url} className="w-full h-full object-cover" />
              </div>
              <div className="p-3.5">
                <p className="text- font-black tracking-widest opacity-50 uppercase">{o.store_name}</p>
                <p className="font-black text-">{o.title}</p>
                <p className="text- mt-1"><span className="opacity-60">{o.neighborhood} •</span> <span className="font-black text-[#FF6B35]">R$ {o.price}</span></p>
                <p className="text- opacity-40 mt-2">Postado {new Date(o.created_at).toLocaleDateString()} • verificado</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-6">
          <a href="/mercado" className="bg-black text-white text-center py-3.5 rounded-2xl font-black text-sm">+ Postar oferta</a>
          <a href="/admin" className="bg-white border text-center py-3.5 rounded-2xl font-black text-sm">Admin</a>
        </div>
      </main>
    </div>
  )
}