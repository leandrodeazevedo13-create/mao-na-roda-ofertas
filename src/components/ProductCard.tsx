// web/src/components/ProductCard.tsx - COM FOTO REAL POR IA
export default function ProductCard({ offer }: { offer: any }) {
  const price = Number(offer.price).toFixed(2).replace(',', '.').replace('.', ',')
  
  // gera foto real do produto via IA gratis - pollinations
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('foto realista de produto de supermercado: ' + offer.title + ', fundo branco, estudio, alta qualidade')}?width=400&height=400&nologo=true&enhance=true`

  // fallback se der erro - usa emoji
  function getEmoji(title: string){
    const t = title.toLowerCase()
    if(t.includes('desinfetante') || t.includes('limpador') || t.includes('veja') || t.includes('amaciante')) return '🧴'
    if(t.includes('carne') || t.includes('frango')) return '🥩'
    if(t.includes('pao')) return '🍞'
    if(t.includes('cerveja') || t.includes('refri')) return '🥤'
    if(t.includes('papel') || t.includes('fralda')) return '🧻'
    return '🛒'
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="px-3 pt-3 flex justify-between items-center">
        <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          {offer.store_name || 'Shibata'}
        </span>
        <span className="text-[11px] text-gray-500">Ubatuba</span>
      </div>

      {/* IMAGEM REAL POR IA */}
      <div className="h-32 bg-white flex items-center justify-center mt-2 mx-2 rounded-xl overflow-hidden border border-gray-100">
        <img 
          src={imageUrl} 
          alt={offer.title}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          onError={(e)=>{ (e.target as any).style.display='none'; (e.target as any).nextElementSibling.style.display='flex' }}
        />
        <div className="hidden w-full h-full bg-yellow-50 items-center justify-center text-4xl">{getEmoji(offer.title)}</div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[38px]">
          {offer.title}
        </h3>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-gray-600">R$</span>
            <span className="text-[20px] font-extrabold text-black">{price}</span>
          </div>
          <button className="mt-2 w-full bg-black text-white text-[12px] font-bold py-2.5 rounded-xl hover:bg-zinc-800">
            Ver oferta
          </button>
        </div>
      </div>
    </div>
  )
}
