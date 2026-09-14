import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ykkuludvrdwbetszitcw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlra3VsdWR2cmR3YmV0c3ppdGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMDIwMjEsImV4cCI6MjEwMDU3ODAyMX0.9CGWNd56W9vu12GG4Mzp44mHQDeLne7QQ9S7e16_30g'
)

export default function App() {
  const [offers, setOffers] = useState([])
  const [q, setQ] = useState('')
  const [loja, setLoja] = useState('Todos')

  useEffect(() => {
    supabase.from('offers').select('*, stores!inner(name)').eq('status','active').order('price').then(({data}) => setOffers(data||[]))
  }, [])

  const filtered = offers.filter(o => {
    const matchBusca = o.raw_product_name.toLowerCase().includes(q.toLowerCase())
    const matchLoja = loja === 'Todos' || o.stores?.name?.includes(loja)
    return matchBusca && matchLoja
  })

  return (
    <div style={{minHeight:'100vh', background:'#fafaf5', fontFamily:'Inter, system-ui'}}>
      <header style={{position:'sticky', top:0, background:'#fff', padding:'14px 20px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}><span style={{fontSize:28}}>🛒</span><div><b style={{fontSize:20}}>Mão na Roda</b><div style={{fontSize:12, color:'#888'}}>Ofertas reais de Ubatuba</div></div></div>
        <span style={{background:'#dcfce7', color:'#166534', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:700}}>📍 Ubatuba, SP</span>
      </header>

      <div style={{maxWidth:800, margin:'0 auto', padding:20}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar arroz, feijão, óleo..." style={{width:'100%', padding:'14px 18px', borderRadius:14, border:'1px solid #e5e7eb', fontSize:16, marginBottom:14}} />
        
        <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:18}}>
          {['Todos','Tenda','Atacadão','Assaí'].map(l=>(
            <button key={l} onClick={()=>setLoja(l)} style={{padding:'8px 16px', borderRadius:20, border:'none', background: loja===l ? '#16a34a' : '#fff', color: loja===l ? '#fff' : '#333', fontWeight:700, cursor:'pointer', boxShadow:'0 1px 3px #0001', whiteSpace:'nowrap'}}>{l}</button>
          ))}
        </div>

        <div style={{display:'grid', gap:12}}>
          {filtered.map(o=>(
            <div key={o.id} style={{background:'#fff', borderRadius:16, padding:14, display:'flex', gap:14, boxShadow:'0 2px 8px #00000008', alignItems:'center'}}>
              <img src={o.source_image_url} width={84} height={84} style={{borderRadius:12, objectFit:'cover', background:'#f3f4f6'}} />
              <div style={{flex:1}}>
                <div style={{fontSize:11, background:'#f3f4f6', display:'inline-block', padding:'2px 8px', borderRadius:20, marginBottom:4}}>{o.stores?.name || 'Tenda Atacado'}</div>
                <div style={{fontWeight:700}}>{o.raw_product_name}</div>
                <div style={{color:'#16a34a', fontWeight:900, fontSize:20}}>R$ {Number(o.price).toFixed(2).replace('.',',')}</div>
                <div style={{fontSize:11, color:'#888'}}>Válido até {new Date(o.valid_to).toLocaleDateString('pt-BR')}</div>
              </div>
              <a href={o.source_url} target="_blank" style={{background:'#111', color:'#fff', padding:'10px 16px', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:13}}>Ver</a>
            </div>
          ))}
        </div>

        <p style={{textAlign:'center', color:'#888', marginTop:24, fontSize:13}}>{filtered.length} ofertas ativas hoje • atualizado agora</p>
      </div>
    </div>
  )
}