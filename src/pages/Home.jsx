import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home(){
  const [offers,setOffers]=useState([])
  const [filtro,setFiltro]=useState('Todos')
  const bairros = ['Todos','Califórnia','Peixão','Semar','Covabra']

  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('offers').select('*').eq('status','approved').order('created_at',{ascending:false})
    setOffers(data||[])
  })()},[])

  const ofertaDoDia = offers[0]
  const lista = filtro==='Todos'? offers.slice(1) : offers.filter(o=>o.bairro===filtro).slice(0)

  return (
    <div className="min-h-screen bg-[#faf6f0] max-w- mx-auto">
      {/* HEADER PRETO */}
      <div className="bg-black text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black">🛒</div>
          <div className="leading-none">
            <p className="font-black text- tracking-tight">MÃO NA RODA <span className="text-orange-400 font-normal">Ofertas</span></p>
            <p className="text- tracking-[0.15em] opacity-70">UBATUBA • Todas em 1 lugar</p>
          </div>
        </div>
        <span className="bg-white/15 border border-white/20 text- font-black px-2.5 py-1 rounded-full">● AO VIVO</span>
      </div>

      {/* FAIXA LARANJA */}
      <div className="bg-orange-500 text-black px-4 py-2 flex justify-between items-center text- font-bold">
        <span>📷 Siga @maonaroda.ubatuba • novidades todo dia</span>
        <span className="bg-black text-white px-2 py-0.5 rounded-full text-">NOVO</span>
      </div>

      <div className="p-3 space-y-3">
        {/* OFERTA DO DIA - h-36 FIXO */}
        {ofertaDoDia && (
          <div className="bg-[#fde9d0] rounded- p-3 border border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <span className="bg-black text-white text- font-black px-2 py-1 rounded-full">🔥 OFERTA DO DIA</span>
              <span className="text- opacity-60">{bairros.length}/3 • Itaguá</span>
            </div>
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                <img src={ofertaDoDia.image_url} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text- tracking-widest opacity-60">{ofertaDoDia.store?.toUpperCase()}</p>
                <p className="font-black text- leading-tight">{ofertaDoDia.title}</p>
                <p className="text- line-through opacity-50">R$ {ofertaDoDia.old_price || '20,90'}</p>
                <p className="font-black text-">R$ {ofertaDoDia.price}</p>
              </div>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {bairros.map(b=>(
            <button key={b} onClick={()=>setFiltro(b)} className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text- font-bold border ${filtro===b?'bg-black text-white border-black':'bg-white border-black/10'}`}>{b}</button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-2.5">
          {lista.map(o=>(
            <div key={o.id} className="bg-white rounded- border border-black/5 p-2.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text- bg-zinc-100 px-2 py-0.5 rounded-full">{o.store}</span>
                <span className="text- bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">● {o.time || '2h'}</span>
              </div>
              <div className="w-full h-16 flex items-center justify-center bg-zinc-50 rounded-xl mb-2 overflow-hidden">
                <img src={o.image_url} className="w-full h-full object-cover" />
              </div>
              <p className="font-bold text- leading-tight h-7">{o.title}</p>
              <p className="font-black text- mt-1">R$ {o.price}</p>
            </div>
          ))}
        </div>

        {!offers.length && <p className="text-center text-xs opacity-40 mt-20">Nenhuma oferta ainda. Posta em /mercado</p>}
      </div>

      <div className="p-3 flex gap-2">
        <Link to="/mercado" className="flex-1 bg-black text-white text-center py-3 rounded-2xl font-black text-sm">+ Postar oferta</Link>
        <Link to="/admin" className="flex-1 bg-white border-2 border-black text-center py-3 rounded-2xl font-black text-sm">Admin</Link>
      </div>
    </div>
  )
}