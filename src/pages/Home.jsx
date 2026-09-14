import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

function Ranking(){
  const [top,setTop]=useState([])
  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('stores').select('*').order('points',{ascending:false}).limit(3)
    setTop(data||[])
  })()},[])
  if(!top.length) return null
  return (
    <div className="bg-black text-white rounded-2xl p-4 mb-6">
      <p className="font-black text-sm mb-3 tracking-widest">🏆 TOP MERCADOS - UBATUBA</p>
      {top.map((s,i)=>(
        <div key={s.name} className="flex justify-between text-sm py-2 border-b border-white/10 last:border-0">
          <span className="font-bold">{i+1}º {s.name}</span>
          <span className="bg-white text-black px-2 rounded-full font-black text-xs">{s.points}pts</span>
        </div>
      ))}
    </div>
  )
}

export default function Home(){
  const [offers,setOffers]=useState([])

  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('offers').select('*').eq('status','approved').order('created_at',{ascending:false})
    setOffers(data||[])
  })()},[])

  return (
    <div className="min-h-screen bg-[#fdf6ec] p-4 max-w- mx-auto">
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-black text-xl leading-none">MÃO NA RODA</h1>
          <p className="text- font-bold tracking-[0.2em] opacity-60">UBATUBA • OFERTAS REAIS</p>
        </div>
        <div className="bg-black text-white text- font-black px-3 py-1 rounded-full">{offers.length} ofertas</div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/mercado" className="bg-black text-white font-black text-xs py-3 rounded-2xl text-center">+ Postar oferta</Link>
        <Link to="/admin" className="bg-white border font-black text-xs py-3 rounded-2xl text-center">Admin</Link>
      </div>

      <Ranking />

      <div className="grid grid-cols-1 gap-4">
        {offers.map(o=>(
          <div key={o.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border">
            {/* AQUI TÁ O FIX H-36 */}
            <div className="w-full h-36 overflow-hidden bg-zinc-100">
              <img src={o.image_url} alt={o.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="font-black text-sm leading-tight">{o.title}</p>
              <p className="text-xs opacity-60">{o.store} • R$ {o.price}</p>
            </div>
          </div>
        ))}
        {!offers.length && <p className="text-center text-xs opacity-50 mt-20">Nenhuma oferta ainda. Seja o primeiro a postar!</p>}
      </div>
    </div>
  )
}