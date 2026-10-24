type Offer = {
  id: string
  title: string
  price: number
  store_name: string
  city?: string
  image_url?: string
  thumb_url?: string
}

export default function ProductCard({ offer }: { offer: Offer }) {
  const price = Number(offer.price).toFixed(2).replace('.', ',')

  // FOTO REAL - mapeia por nome do produto
  function getProductPhoto(title: string, fallback?: string) {
    if (fallback && fallback.startsWith('http') && !fallback.includes('shibata') && !fallback.includes('semar') && !fallback.includes('cluster')) {
      return fallback
    }
    const t = title.toLowerCase()
    if (t.includes('carvão') || t.includes('carvao') || t.includes('brasa')) return 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop'
    if (t.includes('friskies') || t.includes('gato') || t.includes('alimento p/ gatos')) return 'https://images.unsplash.com/photo-1589924691993-400dc54e3b2d?w=400&h=400&fit=crop'
    if (t.includes('alpo') || t.includes('cães') || t.includes('ração') || t.includes('racao')) return 'https://images.unsplash.com/photo-1589924691993-400dc54e3b2d?w=400&h=400&fit=crop'
    if (t.includes('picanha') || t.includes('carne') || t.includes('bovino') || t.includes('músculo')) return 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop&crop=center'
    if (t.includes('arroz')) return 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop'
    if (t.includes('pilha') || t.includes('duracell')) return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'
    if (t.includes('lubrificante') || t.includes('shell')) return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
    if (t.includes('prato')) return 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=400&fit=crop'
    // fallback generico bonito
    return `https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=400&fit=crop`
  }

  const photo = getProductPhoto(offer.title, offer.thumb_url || offer.image_url)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden h-full group">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          {offer.store_name}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Ubatuba</span>
      </div>

      {/* Foto REAL do produto - não emoji, não encarte gigante */}
      <div className="mx-3 mt-3 h-[148px] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
        <img 
          src={photo} 
          alt={offer.title}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // se quebrar, mostra placeholder bonito
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=400&fit=crop'
          }}
        />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-black leading-tight line-clamp-2 min-h-[36px]">
          {offer.title}
        </h3>
        
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-black">R$</span>
            <span className="text-[20px] font-black text-black tracking-tight">{price}</span>
          </div>
          
          <button className="mt-2.5 w-full bg-black hover:bg-zinc-800 text-white text-[12px] font-bold py-2.5 rounded-xl transition-colors">
            Ver oferta
          </button>
        </div>
      </div>
    </div>
  )
}
