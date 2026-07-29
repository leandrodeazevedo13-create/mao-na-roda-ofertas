'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Feed() {
  const [ofertas, setOfertas] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false }).limit(20)
      if(data) setOfertas(data)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white max-w-md mx-auto">
      <div className="p-4 flex justify-between items-center sticky top-0 bg-black z-10">
        <h1 className="font-black text-xl">MÃO NA RODA 🤙 Ubatuba</h1>
        <Link href="/postar" className="bg-white text-black px-4 py-2 rounded-full font-bold">+ POSTAR</Link>
      </div>

      <div className="snap-y snap-mandatory h- overflow-y-scroll">
        {ofertas.length === 0 && <p className="p-10 text-center text-zinc-500">Nenhuma oferta ainda. Seja o primeiro a postar no Itaguá! 🚀</p>}
        {ofertas.map(o => (
          <div key={o.id} className="snap-start h- relative border-b border-zinc-900 flex flex-col justify-end p-0 mb-4">
            <img src={o.foto_url} className="absolute inset-0 w-full h-full object-cover"/>
            <div className="relative bg-gradient-to-t from-black via-black/60 to-transparent p-4">
              <p className="text-3xl font-black">R$ {o.preco}</p>
              <p className="text-lg">{o.titulo}</p>
              <p className="text-xs text-zinc-300 mt-1">📍 {o.lat?.toFixed(3)}, {o.lng?.toFixed(3)} • agora • +10 pts</p>
              <button className="mt-3 w-full bg-white text-black p-3 rounded-xl font-black">PEGAR OFERTA 🏃</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}