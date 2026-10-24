type Offer = {
  id: string
  title: string
  price: number
  store_name: string
  city?: string
  image_url?: string
  thumb_url?: string
}

// FOTO REAL por nome - sem emoji, sem pão repetido
function getRealPhoto(title: string) {
  const t = title.toLowerCase()
  
  // Limpeza
  if (t.includes('desinfetante') || t.includes('suprema') || t.includes('pinho') || t.includes('cloro') || t.includes('limpeza')) 
    return 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=400&fit=crop'
  if (t.includes('azeite') || t.includes('borges') || t.includes('óleo') || t.includes('oleo')) 
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop'
  if (t.includes('panettone') || t.includes('panetone') || t.includes('bauducco')) 
    return 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=400&fit=crop'
  if (t.includes('arroz') || t.includes('feijão') || t.includes('feijao') || t.includes('tio joão') || t.includes('camil')) 
    return 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop'
  if (t.includes('ovo') || t.includes('ovos')) 
    return 'https://images.unsplash.com/photo-1518568403628-df60788af197?w=400&h=400&fit=crop'
  if (t.includes('carvão') || t.includes('carvao') || t.includes('brasa') || t.includes('churrasco')) 
    return 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop'
  if (t.includes('friskies') || t.includes('whiskas') || t.includes('gato') || t.includes('felino')) 
    return 'https://images.unsplash.com/photo-1571873735615-1ae72b963024?w=400&h=400&fit=crop'
  if (t.includes('alpo') || t.includes('pedigree') || t.includes('cães') || t.includes('cachorro') || t.includes('dog chow')) 
    return 'https://images.unsplash.com/photo-1589924691993-400dc54e3b2d?w=400&h=400&fit=crop'
  if (t.includes('picanha') || t.includes('alcatra') || t.includes('acém') || t.includes('carne') || t.includes('bovino') || t.includes('patinho')) 
    return 'https://images.unsplash.com/photo-1558030006-450066393d65?w=400&h=400&fit=crop'
  if (t.includes('linguiça') || t.includes('linguica') || t.includes('salsicha')) 
    return 'https://images.unsplash.com/photo-1558030006-450066393d65?w=400&h=400&fit=crop'
  if (t.includes('pilha') || t.includes('duracell') || t.includes('bateria')) 
    return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'
  if (t.includes('prato') || t.includes('duralex') || t.includes('copo')) 
    return 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop'
  if (t.includes('lubrificante') || t.includes('shell') || t.includes('óleo motor')) 
    return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
  if (t.includes('leite') || t.includes('italac') || t.includes('piracanjuba')) 
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop'
  if (t.includes('refrigerante') || t.includes('coca') || t.includes('guaraná') || t.includes('fanta')) 
    return 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400&h=400&fit=crop'
  if (t.includes('cerveja') || t.includes('heineken') || t.includes('brahma') || t.includes('skol')) 
    return 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop'
  if (t.includes('sabão') || t.includes('omo') || t.includes('tixan') || t.includes('detergente')) 
    return 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop'

  // fallback - produto genérico supermercado (não pão!)
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'
}

export default function ProductCard({ offer }: { offer: Offer }) {
  const price = Number(offer.price).toFixed(2).replace('.', ',')
  const photo = getRealPhoto(offer.title)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden h-full group hover:-translate-y-0.5">
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          {offer.store_name}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Ubatuba</span>
      </div>

      <div className="mx-3 mt-3 h-[148px] bg-[#fcfcfc] rounded-xl overflow-hidden flex items-center justify-center">
        <img 
          src={photo} 
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

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
