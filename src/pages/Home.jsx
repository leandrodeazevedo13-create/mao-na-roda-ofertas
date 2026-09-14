import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home(){
  const [offers,setOffers]=useState([])
  const [filtro,setFiltro]=useState('Todos')
  const [tab,setTab]=useState('ofertas')
  const bairros = ['Todos','Califórnia','Peixão','Semar','Covabra']

  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('offers').select('*').eq('status','approved').order('created_at',{ascending:false})
    setOffers(data||[])
  })()},[])

  const ofertaDoDia = offers[0]
  const lista = filtro==='Todos'? offers : offers.filter(o=>o.bairro===filtro)

  return (
    <div className="min-h-screen bg-[#faf6f0] max-w- mx-auto pb-20">
      {/* HEADER */}
      <div className="bg-black text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-orange-400 w-8 h-8 rounded-lg flex items-center justify-center">🛒</div>
          <div className="leading-none">
            <p className="font-black text-">MÃO NA RODA <span className="text-orange-400 font-normal">Ofertas</span></p>
            <p className="text- tracking-widest opacity-70">UBATUBA • Todas em 1 lugar</p>
          </div>
        </div>
        <span className="bg-white/15 text- font-black px-2.5 py-1 rounded-full">● AO VIVO</span>
      </div>

      <div className="bg-orange-500 text-black px-4 py-2 flex justify-between text- font-bold">
        <span>Siga @maonaroda.ubatuba • novidades todo dia</span>
        <span className="bg-black text-white px-2 py-0.5 rounded-full text-">NOVO</span>
      </div>

      <div className="p-3">
        {tab==='ofertas' && (
          <>
            {ofertaDoDia && (
              <div className="bg-[#fde9d0] rounded- p-3 border border-orange-200 mb-3">
                <div className="flex justify-between mb-2">
                  <span className="bg-black text-white text- font-black px-2 py-1 rounded-full">🔥 OFERTA DO DIA</span>
                  <span className="text- opacity-60">Itaguá</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white"><img src={ofertaDoDia.image_url} className="w-full h-full object-cover" /></div>
                  <div><p className="text- opacity-60">{ofertaDoDia.store}</p><p className="font-black text-">{ofertaDoDia.title}</p><p className="font-black text- mt-1">R$ {ofertaDoDia.price}</p></div>
                </div>
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto mb-3">
              {bairros.map(b=>(
                <button key={b} onClick={()=>setFiltro(b)} className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text- font-bold border ${filtro===b?'bg-black text-white':'bg-white'}`}>{b}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {lista.map(o=>(
                <div key={o.id} className="bg-white rounded- border p-2.5">
                  <div className="flex justify-between mb-2"><span className="text- bg-zinc-100 px-2 py-0.5 rounded-full">{o.store}</span><span className="text- bg-green-100 px-1.5 rounded-full">● 2h</span></div>
                  <div className="w-full h-16 bg-zinc-50 rounded-xl overflow-hidden mb-2"><img src={o.image_url} className="w-full h-full object-cover" /></div>
                  <p className="font-bold text- h-7 leading-tight">{o.title}</p><p className="font-black text-">R$ {o.price}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==='promocao' && <div className="text-center py-20"><p className="font-black">PROMOÇÕES ATIVAS</p><p className="text-xs opacity-60">Aqui vão cupons dos parceiros</p></div>}
        {tab==='video' && <div className="text-center py-20"><p className="font-black">VÍDEOS</p><p className="text-xs opacity-60">Reels dos mercados de Ubatuba</p></div>}
        {tab==='post' && <div className="text-center py-20"><Link to="/mercado" className="bg-black text-white px-6 py-3 rounded-2xl font-black">+ Postar oferta</Link></div>}
        {tab==='parceiros' && <div className="text-center py-20"><p className="font-black">TOP MERCADOS - UBATUBA</p><p className="text-xs opacity-60">1º Supermercado Central<br/>2º Atacadão<br/>3º Peixão</p><Link to="/admin" className="inline-block mt-4 bg-white border-2 border-black px-6 py-2 rounded-2xl font-black text-sm">Admin</Link></div>}
      </div>

      {/* MENU FIXO EMBAIXO */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w- bg-white border-t border-black/10 flex justify-around py-2 px-2">
        <button onClick={()=>setTab('ofertas')} className={`flex flex-col items-center text- font-bold ${tab==='ofertas'?'text-black':'opacity-40'}`}><span className="text-">🏷️</span>Ofertas</button>
        <button onClick={()=>setTab('promocao')} className={`flex flex-col items-center text- font-bold ${tab==='promocao'?'text-black':'opacity-40'}`}><span className="text-">🔥</span>Promoção</button>
        <button onClick={()=>setTab('video')} className={`flex flex-col items-center text- font-bold ${tab==='video'?'text-black':'opacity-40'}`}><span className="text-">🎥</span>Vídeo</button>
        <button onClick={()=>setTab('post')} className={`flex flex-col items-center text- font-bold ${tab==='post'?'text-black':'opacity-40'}`}><span className="text-">➕</span>Post</button>
        <button onClick={()=>setTab('parceiros')} className={`flex flex-col items-center text- font-bold ${tab==='parceiros'?'text-black':'opacity-40'}`}><span className="text-">🤝</span>Parceiros</button>
      </div>
    </div>
  )
}