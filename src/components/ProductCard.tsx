// Salve em: web/src/components/ProductCard.tsx
'use client'
export function ProductCard({ offer }: { offer: any }) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
      <div className="aspect-square bg-zinc-50 p-3 flex items-center justify-center relative">
        <img src={offer.image_url} alt={offer.title} className="w-full h-full object-contain" />
        <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
          {offer.store_name}
        </span>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-medium line-clamp-2 min-h-[32px]">{offer.title}</p>
        <div className="flex items-end gap-1 mt-1">
          <span className="text-[11px] text-zinc-500">R$</span>
          <span className="text-[20px] font-black">{Number(offer.price).toFixed(2).replace('.',',')}</span>
        </div>
      </div>
    </div>
  )
}
