export default function ProductCard({ offer }: { offer: any }) {
  const price = Number(offer.price).toFixed(2).replace('.', ',')

  function emoji(title: string){
    const t = title.toLowerCase()
    if(t.includes('alimento') || t.includes('ração') || t.includes('alpo') || t.includes('friskies')) return '🐶'
    if(t.includes('pilha') || t.includes('duracell')) return '🔋'
    if(t.includes('lubrificante') || t.includes('shell')) return '🛢️'
    if(t.includes('prato')) return '🍽️'
    if(t.includes('carne') || t.includes('bovino')) return '🥩'
    return '🛒'
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-3 flex flex-col h-full">
      <div className="flex justify-between text-">
        <span className="bg-black text-white px-2 py-1 rounded-full font-bold">{offer.store_name}</span>
        <span className="text-gray-400">Ubatuba</span>
      </div>
      <div className="h-24 bg-yellow-50 rounded-xl mt-2 flex items-center justify-center text-4xl">
        {emoji(offer.title)}
      </div>
      <h3 className="text- font-bold text-black mt-2 line-clamp-2 min-h-">{offer.title}</h3>
      <div className="mt-auto">
        <span className="text- font-bold">R$ </span>
        <span className="text- font-black">{price}</span>
      </div>
      <button className="mt-2 w-full bg-black text-white text- font-bold py-2 rounded-lg">Ver oferta</button>
    </div>
  )
}