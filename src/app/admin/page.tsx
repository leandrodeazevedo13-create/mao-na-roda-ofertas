'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {
  const [form, setForm] = useState({ store_name: 'Semar', title: '', price: '', neighborhood: 'Centro', image_url: '' })
  const [msg, setMsg] = useState('')

  async function salvar() {
    if (!form.title || !form.price) { setMsg('Título e preço obrigatórios'); return }
    const { error } = await supabase.from('offers').insert({
      store_name: form.store_name,
      title: form.title,
      price: parseFloat(form.price.replace(',', '.')),
      neighborhood: form.neighborhood,
      image_url: form.image_url || null,
      status: 'active'
    })
    if (error) setMsg('Erro: ' + error.message)
    else {
      setMsg(`✅ ${form.title} publicado no Mão na Roda!`)
      setForm({ ...form, title: '', price: '', image_url: '' })
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>🔧 Admin - Mão na Roda</h1>
      <p style={{ color: '#666' }}>Cadastra oferta do Semar / Shibata em 20s e já vai pro ar em maonarodaofertas.com.br</p>

      <label>Mercado</label>
      <select value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 12 }}>
        <option>Semar</option>
        <option>Shibata</option>
        <option>California</option>
        <option>Covabra</option>
        <option>Peixão</option>
      </select>

      <label>O que é? Ex: Arroz Tio João 5KG</label>
      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Arroz 5KG" style={{ width: '100%', padding: 10, marginBottom: 12 }} />

      <label>Preço Ex: 22,90</label>
      <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="22,90" style={{ width: '100%', padding: 10, marginBottom: 12 }} />

      <label>Foto (link do Instagram ou upload)</label>
      <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: 10, marginBottom: 12 }} />

      <label>Bairro</label>
      <input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 16 }} />

      <button onClick={salvar} style={{ width: '100%', background: 'black', color: 'white', padding: 14, borderRadius: 8, fontWeight: 700 }}>
        PUBLICAR OFERTA AO VIVO
      </button>

      <p style={{ marginTop: 12, fontWeight: 700 }}>{msg}</p>

      <hr style={{ margin: '24px 0' }} />
      <p style={{ fontSize: 12, color: '#888' }}>Dica: Copia a legenda do Instagram @semarsupermercados e cola no Título. Pra foto, clica com botão direito na foto do Insta > Copiar endereço da imagem.</p>
    </div>
  )
}
