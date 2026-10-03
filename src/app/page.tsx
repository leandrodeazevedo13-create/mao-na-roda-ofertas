'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home(){
  const [offers,setOffers]=useState<any[]>([])
  const [filtro,setFiltro]=useState('Todos')
  const [tab,setTab]=useState('ofertas')
  const bairros = ['Todos','Califórnia','Peixão','Semar','Covabra','Itaguá','Tenda']

  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('offers').select('*').eq('status','approved').order('created_at',{ascending:false}).limit(50)
    // se não tiver status, tenta sem filtro
    if(!data || data.length===0){
      const {data:all}=await supabase.from('offers').select('*').order('created_at',{ascending:false}).limit(50)
      setOffers(all||[])
    } else setOffers(data||[])
  })()},[])

  const ofertaDoDia = offers[0]
  const lista = filtro==='Todos'? offers : offers.filter(o=> (o.neighborhood||o.bairro||'').includes(filtro) || (o.store_name||o.store||o.titulo||'').toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#fff7e8] max-w-[480px] mx-auto pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-black text-white px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-orange-400 w-8 h-8 rounded-xl flex items-center justify-center">🛒</div>
          <div className="leading-none">
            <p className="font-black text-[14px]">MÃO NA RODA <span className="text-orange-400 font-normal">Ofertas</span></p>
            <p className="text-[10px] tracking-widest opacity-70">UBATUBA • Todas em 1 lugar</p>
          </div>
        </div>
        <span className="bg-white/15 text-[10px] font-black px-2.5 py-1 rounded-full">● AO VIVO</span>
      </div>

      <div className="bg-orange-500 text-black px-4 py-2 flex justify-between text-[11px] font-bold">
        <span>Siga @maonaroda.ubatuba • novidades todo dia</span>
        <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px]">NOVO</span>
      </div>

      <div className="p-3">
        {tab==='ofertas' && (
          <>
            {ofertaDoDia && (
              <div className="bg-[#fde9d0] rounded-[20px] p-3 border border-orange-200 mb-3">
                <div className="flex justify-between mb-2">
                  <span className="bg-black text-white text-[10px] font-black px-2 py-1 rounded-full">🔥 OFERTA DO DIA</span>
                  <span className="text-[11px] opacity-60">{ofertaDoDia.neighborhood||ofertaDoDia.bairro||'Itaguá'}</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shrink-0"><img src={ofertaDoDia.image_url||ofertaDoDia.foto_url} className="w-full h-full object-cover" /></div>
                  <div className="min-w-0"><p className="text-[11px] opacity-60">{ofertaDoDia.store_name||ofertaDoDia.store||'Mercado'}</p><p className="font-black text-[15px] leading-tight">{ofertaDoDia.title||ofertaDoDia.titulo}</p><p className="font-black text-[22px] mt-1">R$ {ofertaDoDia.price||ofertaDoDia.preco}</p></div>
                </div>
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto mb-3 scrollbar-hide">
              {bairros.map(b=>(
                <button key={b} onClick={()=>setFiltro(b)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold border ${filtro===b?'bg-black text-white border-black':'bg-white'}`}>{b}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {lista.slice(1).map(o=>(
                <div key={o.id} className="bg-white rounded-[18px] border p-2.5 shadow-sm">
                  <div className="flex justify-between mb-2"><span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full truncate max-w-[80px]">{o.store_name||o.store||'Loja'}</span><span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-full">● 2h</span></div>
                  <div className="w-full h-24 bg-zinc-50 rounded-xl overflow-hidden mb-2"><img src={o.image_url||o.foto_url} className="w-full h-full object-cover" /></div>
                  <p className="font-bold text-[13px] leading-tight line-clamp-2 min-h-[34px]">{o.title||o.titulo}</p><p className="font-black text-[15px] mt-1">R$ {o.price||o.preco}</p>
                </div>
              ))}
            </div>
            {lista.length===0 && <p className="text-center py-10 text-sm opacity-60">Nenhuma oferta em {filtro}. Seja o primeiro a postar! 🚀<br/><Link href="/postar" className="inline-block mt-3 bg-black text-white px-5 py-2 rounded-full font-bold">+ POSTAR</Link></p>}
          </>
        )}

        {tab==='promocao' && <div className="text-center py-20"><p className="font-black">PROMOÇÕES ATIVAS</p><p className="text-xs opacity-60 mt-2">Cupons dos parceiros de Ubatuba</p></div>}
        {tab==='video' && <div className="text-center py-20"><p className="font-black">VÍDEOS</p><p className="text-xs opacity-60 mt-2">Reels dos mercados</p></div>}
        {tab==='post' && <div className="text-center py-20"><Link href="/postar" className="bg-black text-white px-6 py-3 rounded-2xl font-black">+ Postar oferta</Link><p className="text-xs opacity-60 mt-3">Foto real + GPS obrigatório = +10 pontos</p></div>}
        {tab==='parceiros' && <div className="text-center py-20"><p className="font-black">TOP MERCADOS - UBATUBA</p><p className="text-xs opacity-60 mt-2">1º Supermercado Central<br/>2º Atacadão<br/>3º Peixão</p><Link href="/postar" className="inline-block mt-4 bg-white border-2 border-black px-6 py-2 rounded-2xl font-black text-sm">Admin</Link></div>}
      </div>

      {/* MENU FIXO */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-black/10 flex justify-around py-2 px-2 z-20">
        <button onClick={()=>setTab('ofertas')} className={`flex flex-col items-center text-[11px] font-bold ${tab==='ofertas'?'text-black':'opacity-40'}`}><span className="text-[18px]">🏷️</span>Ofertas</button>
        <button onClick={()=>setTab('promocao')} className={`flex flex-col items-center text-[11px] font-bold ${tab==='promocao'?'text-black':'opacity-40'}`}><span className="text-[18px]">🔥</span>Promoção</button>
        <button onClick={()=>setTab('video')} className={`flex flex-col items-center text-[11px] font-bold ${tab==='video'?'text-black':'opacity-40'}`}><span className="text-[18px]">🎥</span>Vídeo</button>
        <button onClick={()=>setTab('post')} className={`flex flex-col items-center text-[11px] font-bold ${tab==='post'?'text-black':'opacity-40'}`}><span className="text-[18px]">➕</span>Post</button>
        <button onClick={()=>setTab('parceiros')} className={`flex flex-col items-center text-[11px] font-bold ${tab==='parceiros'?'text-black':'opacity-40'}`}><span className="text-[18px]">🤝</span>Parceiros</button>
      </div>
    </div>
  )
}
