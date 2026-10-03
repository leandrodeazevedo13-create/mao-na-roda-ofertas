// web/src/components/ProductCard.tsx - VERSAO FIXADA CONTRASTE
export default function ProductCard({ offer }: { offer: any }) {
  const price = Number(offer.price).toFixed(2).replace('.', ',')
  
  // pega emoji baseado no nome
  function getEmoji(title: string){
    const t = title.toLowerCase()
    if(t.includes('arroz') || t.includes('feijao') || t.includes('macarrao')) return '🍚'
    if(t.includes('carne') || t.includes('bovino') || t.includes('suina') || t.includes('frango') || t.includes('linguica')) return '🥩'
    if(t.includes('pao') || t.includes('biscoito') || t.includes('bolo')) return '🍞'
    if(t.includes('leite') || t.includes('iogurte') || t.includes('queijo') || t.includes('requeijao')) return '🧀'
    if(t.includes('cerveja') || t.includes('refrigerante') || t.includes('suco') || t.includes('energetico') || t.includes('vinho') || t.includes('gin') || t.includes('whisky')) return '🥤'
    if(t.includes('azeite') || t.includes('oleo') || t.includes('ketchup') || t.includes('maionese') || t.includes('molho')) return '🫙'
    if(t.includes('fruta') || t.includes('abacaxi') || t.includes('maca') || t.includes('laranja') || t.includes('uva') || t.includes('melao') || t.includes('ameixa')) return '🍎'
    if(t.includes('legume') || t.includes('cenoura') || t.includes('batata') || t.includes('repolho') || t.includes('chuchu') || t.includes('pepino')) return '🥦'
    if(t.includes('papel') || t.includes('fralda') || t.includes('sabone') || t.includes('amaciante') || t.includes('lava') || t.includes('desinfetante') || t.includes('creme dental')) return '🧻'
    if(t.includes('racao') || t.includes('alimento p/')) return '🐶'
    if(t.includes('panettone') || t.includes('pudim') || t.includes('chocolate') || t.includes('bala')) return '🍰'
    return '🛒'
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* header loja */}
      <div className="px-3 pt-3 flex justify-between items-center">
        <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
          {offer.store_name || 'Shibata'}
        </span>
        <span className="text-[11px] text-gray-500 font-medium">Ubatuba</span>
      </div>

      {/* icone / imagem */}
      <div className="h-28 bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center text-5xl mt-3 mx-3 rounded-xl">
        {getEmoji(offer.title)}
      </div>

      {/* titulo com contraste FORTE */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-3 min-h-[60px]">
          {offer.title}
        </h3>
        
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-[12px] font-bold text-gray-700">R$</span>
            <span className="text-[22px] font-extrabold text-black tracking-tight">{price}</span>
          </div>
          <div className="mt-2 w-full bg-black text-white text-center text-[13px] font-bold py-2 rounded-xl">
            Ver oferta
          </div>
        </div>
      </div>
    </div>
  )
}
