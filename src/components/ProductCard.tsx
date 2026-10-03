// ProductCard que recorta do proprio encarte
export default function ProductCard({ offer }: { offer: any }) {
  const price = Number(offer.price).toFixed(2).replace('.', ',')
  const bbox = offer.bbox // [ymin, xmin, ymax, xmax] 0-1000

  // estilo para recortar do encarte original
  let cropStyle: any = {}
  let useCrop = false
  if(bbox && bbox.length===4){
    const [ymin, xmin, ymax, xmax] = bbox
    useCrop = true
    // usa div com background position para crop
    cropStyle = {
      backgroundImage: `url(${offer.image_url})`,
      backgroundPosition: `${(xmin/10)}% ${(ymin/10)}%`,
      backgroundSize: '1000% 1000%', // simula zoom no bbox
      // calculo mais preciso:
      backgroundPositionX: `${(xmin/(1000-(xmax-xmin)))*100}%`,
      backgroundPositionY: `${(ymin/(1000-(ymax-ymin)))*100}%`,
      backgroundSize: `${100 / ((xmax-xmin)/1000)}% ${100 / ((ymax-ymin)/1000)}%`,
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="px-3 pt-2 flex justify-between">
        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">{offer.store_name}</span>
        <span className="text-[10px] text-gray-400">Ubatuba</span>
      </div>

      {/* FOTO RECORTADA DO ENCARTE REAL */}
      <div className="h-32 mx-2 mt-2 rounded-xl overflow-hidden bg-white border border-gray-100">
        {useCrop ? (
          <div className="w-full h-full" style={cropStyle} />
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
