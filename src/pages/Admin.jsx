import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin(){
  const [offers,setOffers]=useState([])
  useEffect(()=>{ load() },[])
  async function load(){
    const {data} = await supabase.from('offers').select('*').eq('status','pending').order('created_at',{ascending:false})
    setOffers(data||[])
  }
  async function handleApprove(o){
    // 1. aprova oferta
    await supabase.from('offers').update({status:'approved'}).eq('id',o.id)
    // 2. soma +10 pts na loja
    const {data:store} = await supabase.from('stores').select('points').eq('name',o.store_name).single()
    if(store){
      await supabase.from('stores').update({points: store.points + 10}).eq('name',o.store_name)
    } else {
      await supabase.from('stores').insert({name:o.store_name, points:10})
    }
    load()
  }
  async function handleReject(id){
    await supabase.from('offers').update({status:'rejected'}).eq('id',id)
    load()
  }
  return (
    <div className="min-h-screen bg-[#FFF7F2] p-4 max-w- mx-auto">
      <h1 className="font-black text-xl">Admin - Pendentes ({offers.length})</h1>
      <p className="text-xs opacity-60 mb-3">GPS só aqui</p>
      <div className="grid gap-3">
        {offers.map(o=>(
          <div key={o.id} className="bg-white rounded-2xl border overflow-hidden">
            <div className="w-full h-36 overflow-hidden bg-zinc-100">
              <img src={o.image_url} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="font-black">{o.store_name}</p>
              <p className="text-sm">{o.title} - R$ {o.price}</p>
              <p className="text-xs opacity-60">{o.neighborhood}</p>
              <a href={`https://www.google.com/maps?q=${o.lat},${o.lng}`} target="_blank" className="text- text-blue-600 font-bold">📍 Ver GPS real: {o.lat}, {o.lng}</a>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={()=>handleApprove(o)} className="bg-black text-white py-2.5 rounded-xl font-black text-sm">APROVAR +10pts</button>
                <button onClick={()=>handleReject(o.id)} className="bg-zinc-200 py-2.5 rounded-xl font-bold text-sm">REJEITAR</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <a href="/" className="block text-center mt-6 text-sm font-bold underline">Ver Home h-36</a>
    </div>
  )
}