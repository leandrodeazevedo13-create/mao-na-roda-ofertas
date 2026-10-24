'use client';
import { useState, useEffect, useMemo } from 'react';

type Offer = {
  id: number | string;
  store_name: string;
  title: string;
  price: number;
  image_url?: string;
  valid_until?: string;
};

const STORES = ['Shibata','Semar','Máximo','Conde','Tenda','Maná','Pit Stop'];

// Categoria automática pela palavra
function getCategory(title: string): string {
  const t = title.toLowerCase();
  if (/costelinha|linguiça|linguica|frango|contra|filé|file|carne|peito|açougue|acougue|suína|suina|bife|alcatra|picanha/.test(t)) return 'Açougue';
  if (/heineken|vinho|cerveja|refrigerante|coca|guaraná|guarana|bebida|suco|água|agua/.test(t)) return 'Bebidas';
  if (/café|cafe|manteiga|pudim|pão|pao|leite|arroz|feijão|feijao|macarrão|macarrao|óleo|oleo|açúcar|acucar/.test(t)) return 'Mercearia';
  if (/sabão|sabao|detergente|amaciante|limpeza|desinfetante/.test(t)) return 'Limpeza';
  if (/ração|racao|pet|dog|cat|friskies/.test(t)) return 'Pet';
  if (/fralda|shampoo|sabonete|higiene/.test(t)) return 'Higiene';
  return 'Outros';
}

function getEmoji(title: string, category: string) {
  const t = title.toLowerCase();
  if (t.includes('costelinha')) return '🥩';
  if (t.includes('linguiça') || t.includes('linguica')) return '🌭';
  if (t.includes('frango') || t.includes('peito')) return '🍗';
  if (t.includes('contra') || t.includes('filé')) return '🥩';
  if (t.includes('heineken') || t.includes('cerveja')) return '🍺';
  if (t.includes('vinho')) return '🍷';
  if (t.includes('café') || t.includes('cafe')) return '☕';
  if (t.includes('manteiga')) return '🧈';
  if (t.includes('pudim')) return '🍮';
  if (t.includes('pão') || t.includes('alho')) return '🧄';
  if (category === 'Bebidas') return '🍺';
  if (category === 'Açougue') return '🥩';
  if (category === 'Mercearia') return '🧈';
  return '🛒';
}

const MOCK_OFFERS: Offer[] = [
  // CONDE - 10 extraídas da sua print 23-25/10/2026
  { id: 1, store_name: 'Conde', title: 'Costelinha Grill Suína KG', price: 15.99 },
  { id: 2, store_name: 'Conde', title: 'Linguiça Toscana Aurora KG', price: 16.99 },
  { id: 3, store_name: 'Conde', title: 'Café Brasileiro Trad. e Extra Forte 500g', price: 16.99 },
  { id: 4, store_name: 'Conde', title: 'Manteiga Serramar com e sem sal 200g', price: 8.99 },
  { id: 5, store_name: 'Conde', title: 'Pudim Rebeka 120g', price: 2.99 },
  { id: 6, store_name: 'Conde', title: 'Peito de Frango com Osso Congelado KG', price: 8.99 },
  { id: 7, store_name: 'Conde', title: 'Vinho Concha y Toro Reservado 750ml', price: 18.99 },
  { id: 8, store_name: 'Conde', title: 'Contra Filé Reserva Peça KG', price: 43.90 },
  { id: 9, store_name: 'Conde', title: 'Heineken 350ml', price: 4.69 },
  { id: 10, store_name: 'Conde', title: 'Pão de Alho Maturatta 300g', price: 9.98 },
  // MÁXIMO - exemplo do 705.pdf
  { id: 11, store_name: 'Máximo', title: 'Arroz Tio João 5kg', price: 22.90 },
  { id: 12, store_name: 'Máximo', title: 'Feijão Camil 1kg', price: 6.99 },
  { id: 13, store_name: 'Máximo', title: 'Coca Cola 2L', price: 8.49 },
  { id: 14, store_name: 'Máximo', title: 'Cerveja Brahma Lata 350ml', price: 3.29 },
  // SHIBATA - exemplo
  { id: 15, store_name: 'Shibata', title: 'Alcatra com Maminha KG', price: 36.90 },
  { id: 16, store_name: 'Shibata', title: 'Ovo Branco Cartela 20un', price: 12.99 },
];

export default function Home() {
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [store, setStore] = useState<string>('Todos');
  const [category, setCategory] = useState<string>('Todos');
  const [search, setSearch] = useState('');

  // Busca real do Supabase (descomente quando for pro ar)
  useEffect(() => {
    // fetch('/api/offers').then(r=>r.json()).then(data=> {
    //   const clean = data.filter((o:any)=> o.price > 0.5);
    //   setOffers(clean);
    // });
  }, []);

  const filtered = useMemo(() => {
    return offers.filter(o => {
      if (o.price <= 0.5) return false; // remove R$0,00 Virada dos Sonhos
      if (store !== 'Todos' && o.store_name !== store) return false;
      if (category !== 'Todos' && getCategory(o.title) !== category) return false;
      if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [offers, store, category, search]);

  const categories = useMemo(() => {
    const cats = new Set(offers.map(o=> getCategory(o.title)));
    return ['Todos', ...Array.from(cats)];
  }, [offers]);

  const storeCounts = useMemo(() => {
    const map: Record<string, number> = { 'Todos': offers.length };
    STORES.forEach(s => map[s] = offers.filter(o=> o.store_name===s).length);
    return map;
  }, [offers]);

  const catCounts = useMemo(() => {
    const map: Record<string, number> = { 'Todos': offers.length };
    categories.forEach(c => {
      if (c==='Todos') return;
      map[c] = offers.filter(o=> getCategory(o.title)===c).length;
    });
    return map;
  }, [offers, categories]);

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <header className="bg-black text-white p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-black text-xl">MÃO NA RODA <span className="text-yellow-400">OFERTAS</span></h1>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{filtered.length} ofertas</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3">
        {/* BUSCA */}
        <input 
          value={search}
          onChange={e=> setSearch(e.target.value)}
          placeholder="Buscar produto... ex: Heineken, Costelinha"
          className="w-full p-3 rounded-xl border border-gray-200 mb-3"
        />

        {/* FILTRO 1 - MERCADO */}
        <div className="mb-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Filtrar por mercado</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Todos', ...STORES].map(s => (
              <button
                key={s}
                onClick={()=> setStore(s)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition ${
                  store===s ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {s} <span className="opacity-60">({storeCounts[s]||0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* FILTRO 2 - PRODUTO/CATEGORIA */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Filtrar por produto</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={()=> setCategory(c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border ${
                  category===c ? 'bg-yellow-400 text-black border-yellow-400 font-bold' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {c==='Açougue'?'🥩 ':c==='Bebidas'?'🍺 ':c==='Mercearia'?'🧈 ':''}{c} ({catCounts[c]||0})
              </button>
            ))}
          </div>
        </div>

        {/* GRID - 4 cols web, 2 cols mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(o => {
            const cat = getCategory(o.title);
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black bg-black text-white px-2 py-1 rounded-full">{o.store_name}</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full">{cat}</span>
                </div>
                <div className="text-5xl text-center my-3">{getEmoji(o.title, cat)}</div>
                <h3 className="text-[13px] font-medium leading-tight line-clamp-2 min-h-[32px]">{o.title}</h3>
                <div className="mt-auto pt-2">
                  <p className="text-xl font-black">R$ {o.price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-[10px] text-gray-400">Válido 23 a 25/10/2026</p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length===0 && (
          <div className="text-center py-20 text-gray-400">
            <p>Nenhuma oferta com esse filtro</p>
            <button onClick={()=> {setStore('Todos'); setCategory('Todos'); setSearch('')}} className="mt-3 bg-black text-white px-4 py-2 rounded-full text-sm">Limpar filtros</button>
          </div>
        )}
      </div>
    </div>
  );
}
