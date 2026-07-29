'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Postar() {
  const [titulo, setTitulo] = useState('')
  const [preco, setPreco] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [gps, setGps] = useState<{lat:number,lng:number} | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const pegarGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('Ativa o GPS!'),
      { enableHighAccuracy: true }
    )
  }

  const handleFoto = (e:any) => {
    const file = e.target.files[0]
    if(file){
      setFoto(file)
      setPreview(URL.createObjectURL(file))
      pegarGPS()
    }
  }

  const postar = async () => {
    if(!titulo ||!preco ||!foto) return alert('Foto, título e preço obrigatórios!')
    if(!gps) return alert('GPS obrigatório!')
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user){
        // cria anonimo pra teste em Ubatuba viralizar sem login
        const { data: anon } = await supabase.auth.signInAnonymously()
        if(!anon.user) throw new Error('Erro login')
      }
      const { data: { user: u2 } } = await supabase.auth.getUser()
      const userId = u2!.id

      const nomeFoto = `${userId}/${Date.now()}.jpg`
      await supabase.storage.from('ofertas').upload(nomeFoto, foto!)
      const { data } = supabase.storage.from('ofertas').getPublicUrl(nomeFoto)

      const { error } = await supabase.from('offers').insert({
        user_id: userId,
        titulo,
        preco: parseFloat(preco),
        foto_url: data.publicUrl,
        lat: gps.lat,
        lng: gps.lng
      })
      if(error) throw error
      alert('POSTADO! +10 pontos')
      router.push('/')
    } catch (err:any){ alert(err.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Postar Oferta Real 📸</h1>
      <div onClick={()=>fileRef.current?.click()} className="w-full h-64 bg-zinc-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-700 mb-4 overflow-hidden">
        {preview? <img src={preview} className="w-full h-full object-cover"/> : <span className="text-zinc-500">TOCA PRA TIRAR FOTO</span>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFoto}/>
      <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="O que? Ex: Arroz 5kg" className="w-full p-4 rounded-xl bg-zinc-900 mb-3"/>
      <input value={preco} onChange={e=>setPreco(e.target.value)} type="number" placeholder="Preço? 22.90" className="w-full p-4 rounded-xl bg-zinc-900 mb-3"/>
      <div className={`p-3 rounded-xl mb-4 ${gps? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
        {gps? `✅ GPS OK: ${gps.lat.toFixed(4)}` : '❌ GPS OBRIGATÓRIO'}
      </div>
      <button onClick={postar} disabled={loading} className="w-full p-4 bg-white text-black font-black text-xl rounded-xl">
        {loading? 'POSTANDO...' : 'POSTAR 🚀'}
      </button>
    </div>
  )
}