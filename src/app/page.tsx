"use client"
import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const STORES = ["Todos", "Shibata", "Semar", "Tenda", "Mana", "Maximo", "Pit Stop", "Conde"]

export default function Home() {
  const [offers, setOffers] = useState<any[]>([])
  const [filter, setFilter] = useState("Todos")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("status", "active")
        .order("price", { ascending: true })
        .limit(100)
      setOffers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === "Todos" ? offers : offers.filter(o => o.store_name.toLowerCase() === filter.toLowerCase())

  // Oferta do dia = menor preço ou Semar
  const ofertaDia = offers.find(o => o.store_name === "Semar") || offers[0]

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <div>
              <h1 className="font-black text-[15px] leading-none tracking-tight">MÃO NA RODA Ofertas</h1>
              <p className="text-[10px] text-zinc-400 font-medium">UBATUBA - Todas em 1 lugar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">• AO VIVO</span>
          </div>
        </div>
      </header>

      {/* Banner Laranja */}
      <div className="bg-[#ff6a00] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-[11px]">
          <span className="font-medium">Siga @maonarodao.ubatuba • novidades todo dia</span>
          <span className="bg-black text-[9px] px-2 py-1 rounded-full font-bold">NOVO</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Oferta do Dia - WEB e MOBILE */}
        {ofertaDia && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 mb-6 flex gap-4 items-center">
            <span className="absolute hidden" />
            <div className="flex flex-col">
              <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-fit mb-2">🔥 OFERTA DO DIA</span>
              <h2 className="font-bold text-[16px] md:text-[18px] leading-tight text-black">{ofertaDia.title}</h2>
              <p className="text-[12px] text-zinc-600 mt-1">{ofertaDia.store_name} • Ubatuba</p>
              <p className="text-[22px] font-black mt-2">R$ {Number(ofertaDia.price).toFixed(2).replace('.', ',')}</p>
            </div>
            <img src={ofertaDia.image_url && !ofertaDia.image_url.includes('cluster') ? ofertaDia.image_url : 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=200'} alt="" className="w-24 h-24 object-contain bg-white rounded-xl ml-auto" />
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {STORES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition ${
                filter === s ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-black"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid Produtos - WEB 4 colunas / MOBILE 2 colunas */}
        {loading ? (
          <div className="text-center py-20 font-bold">Carregando {offers.length} ofertas...</div>
        ) : (
          <>
            <p className="text-[13px] text-gray-500 mb-3 font-medium">{filtered.length} ofertas em {filter}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filtered.map((o: any) => (
                <ProductCard key={o.id} offer={o} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-[11px] text-gray-400">
          {filtered.length === 0 && "Nenhuma oferta neste filtro. Rode o scraper!"}
          <p className="mt-4">© Mão na Roda Ubatuba • Atualizado ao vivo</p>
        </div>
      </div>
    </main>
  )
}
