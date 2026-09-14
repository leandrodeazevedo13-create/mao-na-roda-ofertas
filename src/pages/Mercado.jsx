import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Mercado(){
  const [form,setForm]=useState({store_name:'',title:'',price:'',neighborhood:'Centro'})
  const [file,setFile]=useState(null)
  const [msg,setMsg]=useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setMsg('Enviando...')

    let image_url = null
    let lat = null, lng = null

    // pega GPS se o cara permitir
    try{
      const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej))
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    }catch{}

    // upload da foto com nome sem espaço
    if(file){
      const safeName = file.name.replaceAll(' ','-').replaceAll('/','-')
      const name = `${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('ofertas-fotos').upload(name, file)
      if(uploadError){
        setMsg('Erro no upload: '+uploadError.message)
        return
      }
      const { data } = supabase.storage.from('ofertas-fotos').getPublicUrl(name)
      image_url = data.publicUrl
    }

    // insere oferta como pending
    const { error } = await supabase.from('offers').insert({
      store_name: form.store_name,
      title: form.title,
      price: parseFloat(form.price.replace(',','.')),
      neighborhood: form.neighborhood,
      image_url,
      status: 'pending',
      gps_lat: lat,
      gps_lng: lng
    })

    if(error) setMsg('Erro: '+error.message)
    else setMsg('✅ Enviado! Aguardando aprovação no /admin')
  }

  return (
    <div className="min-h-screen bg-[#FFF7F2] p-4 max-w- mx-auto">
      <h1 className="font-black text-2xl">Área do Mercado</h1>
      <p className="text-sm opacity-60 mb-4">Poste e ganhe pontos</p>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl space-y-3 border">
        <input required placeholder="Nome mercado ex: Peixão" className="w-full p-3 border rounded-xl" value={form.store_name} onChange={e=>setForm({...form,store_name:e.target.value})} />
        <input required placeholder="Oferta ex: Leite 1L" className="w-full p-3 border rounded-xl" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <input required placeholder="Preço ex: 4,19" className="w-full p-3 border rounded-xl" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
        <select className="w-full p-3 border rounded-xl" value={form.neighborhood} onChange={e=>setForm({...form,neighborhood:e.target.value})}>
          <option>Centro</option><option>Califórnia</option><option>Itaguá</option><option>Ubatuba</option>
        </select>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} className="w-full text-sm" />
        <button className="w-full bg-black text-white font-bold p-3 rounded-xl">Enviar oferta</button>
        {msg && <p className="text-sm font-bold">{msg}</p>}
      </form>
    </div>
  )
}