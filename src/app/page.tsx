"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type Offer = { id: string; title: string; price: number; store_name: string; neighborhood?: string; created_at?: string; };

const MERCADOS = ["Shibata", "Semar", "Máximo", "Conde", "Tenda", "Maná", "Pit Stop"];
const CATEGORIAS = {
  "Açougue": ["costelinha", "linguiça", "linguica", "frango", "peito", "contra", "file", "filé", "carne", "bovino", "suino", "suína", "acem", "patinho", "coxao", "alcatra", "picanha", "costela"],
  "Bebidas": ["vinho", "heineken", "cerveja", "refrigerante", "suco", "agua", "água", "concha", "toro", "brahma", "skol"],
  "Mercearia": ["café", "cafe", "manteiga", "pudim", "pão", "pao", "arroz", "feijao", "feijão", "oleo", "óleo", "açucar", "acucar", "leite", "macarrao", "biscoito"]
};

function getCategory(title: string): string {
  const t = title.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORIAS)) {
    if (keys.some(k => t.includes(k))) return cat;
  }
  return "Outros";
}
function getEmoji(title: string): string {
  const cat = getCategory(title);
  if (cat === "Açougue") return "🥩";
  if (cat === "Bebidas") return "🍺";
  if (cat === "Mercearia") return "☕";
  return "🛒";
}

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filtroMercado, setFiltroMercado] = useState<string>("Todos");
  const [filtroProduto, setFiltroProduto] = useState<string>("Todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("offers").select("*").gt("price", 0.5).order("price", { ascending: true });
      if (data) setOffers(data);
    };
    load();
  }, []);

  const filtrados = useMemo(() => {
    return offers.filter(o => {
      const matchMercado = filtroMercado === "Todos" || o.store_name === filtroMercado;
      const matchProduto = filtroProduto === "Todos" || getCategory(o.title) === filtroProduto;
      const matchBusca = busca === "" || o.title.toLowerCase().includes(busca.toLowerCase());
      return matchMercado && matchProduto && matchBusca;
    });
  }, [offers, filtroMercado, filtroProduto, busca]);

  const countsMercado = useMemo(() => {
    const c: any = { Todos: offers.length };
    MERCADOS.forEach(m => c[m] = offers.filter(o => o.store_name === m).length);
    return c;
  }, [offers]);

  const countsProduto = useMemo(() => {
    const c: any = { Todos: offers.length };
    ["Açougue", "Mercearia", "Bebidas", "Outros"].forEach(cat => {
      c[cat] = offers.filter(o => getCategory(o.title) === cat).length;
    });
    return c;
  }, [offers]);

  return (
    <main className="min-h-screen bg-[#FFFBF2]">
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">MÃO NA RODA <span className="text-[#FFD700]">OFERTAS</span></h1>
          <span className="bg-white/15 px-3 py-1 rounded-full text-sm font-bold">{filtrados.length} ofertas</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <input
          placeholder="Buscar produto... ex: picanha, arroz, heineken"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full px-5 py-4 rounded-2xl border border-black/10 bg-white text-black placeholder:text-black/40 font-medium text-[15px] focus:outline-none focus:ring-2 focus:ring-black mb-6"
        />

        <div className="mb-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-black/50 uppercase mb-3">FILTRAR POR MERCADO</p>
          <div className="flex flex-wrap gap-2">
            {["Todos", ...MERCADOS].map(m => (
              <button key={m} onClick={() => setFiltroMercado(m)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold border transition ${filtroMercado === m ? "bg-black text-white border-black" : "bg-white text-black border-black/10 hover:border-black"}`}>
                {m} <span className={filtroMercado === m ? "text-white/70" : "text-black/50"}>({countsMercado[m] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] text-black/50 uppercase mb-3">FILTRAR POR PRODUTO</p>
          <div className="flex flex-wrap gap-2">
            {["Todos", "Açougue", "Mercearia", "Bebidas", "Outros"].map(cat => (
              <button key={cat} onClick={() => setFiltroProduto(cat)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold border transition ${filtroProduto === cat ? "bg-[#FFD700] text-black border-black" : "bg-white text-black border-black/10 hover:border-black"}`}>
                {cat === "Açougue" ? "🥩 " : cat === "Mercearia" ? "🧈 " : cat === "Bebidas" ? "🍺 " : ""}{cat} ({countsProduto[cat] || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtrados.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-black/10 p-4 flex flex-col hover:border-black hover:shadow-[4px_4px_0px_0px_black] transition">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">{o.store_name}</span>
                <span className="bg-black/5 text-black/60 text-[10px] font-bold px-2 py-1 rounded-full">{getCategory(o.title)}</span>
              </div>
              <div className="text-[44px] leading-none my-2 text-center">{getEmoji(o.title)}</div>
              <h3 className="text-[14px] font-bold text-black leading-tight min-h-[36px] line-clamp-2">{o.title}</h3>
              <div className="mt-auto pt-3">
                <p className="text-[22px] font-black text-black tracking-tight">R$ {o.price.toFixed(2).replace(".", ",")}</p>
                <p className="text-[11px] font-medium text-black/50">Válido 23 a 25/10/2026</p>
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🛒</p>
            <p className="font-black text-black text-lg">Nenhuma oferta encontrada</p>
            <p className="text-black/60">Tente limpar os filtros</p>
          </div>
        )}
      </div>
    </main>
  );
}
