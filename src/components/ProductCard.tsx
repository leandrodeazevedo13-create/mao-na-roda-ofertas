export default function ProductCard({ offer }: { offer: any }) {
  const price = Number(offer.price).toFixed(2).replace('.', ',')
  const bbox = offer.bbox as number[] | undefined

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="px-3 pt-2 flex justify-between">
        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">{offer.store_name || 'Shibata'}</span>
        <span className="text-[10px] text-gray-400">Ubatuba</span>
      </div>

      <div className="h-32 mx-2 mt-2 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
        {bbox && bbox.length===4 ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${offer.image_url})`,
              backgroundPosition: `${(bbox[1]/(1000-(bbox[3]-bbox[1])))*100}% ${(bbox[0]/(1000-(bbox[2]-bbox[0])))*100}%`,
              backgroundSize: `${100 / ((bbox[3]-bbox[1])/1000)}% ${100 / ((bbox[2]-bbox[0])/1000)}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-contain p-1" />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[12px] font-bold text-black line-clamp-2 min-h-[32px]">{offer.title}</h3>
        <div className="mt-auto pt-2">
          <span className="text-[11px] font-bold">R$ </span>
          <span className="text-[18px] font-black">{price}</span>
        </div>
        <button className="mt-2 w-full bg-black text-white text-[11px] font-bold py-2 rounded-lg">Ver oferta</button>
      </div>
    </div>
  )
}
