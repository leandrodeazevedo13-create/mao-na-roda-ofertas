type Offer = {
  id: string;
  title: string;
  price: number;
  store_name: string;
  image_url: string;
};

function getRealImage(title: string) {
  // Gera foto real do produto via Pollinations (grátis) - 200x200 compacta
  const clean = encodeURIComponent(`product photo of ${title}, supermarket package, isolated white background, high quality`);
  return `https://image.pollinations.ai/prompt/${clean}?width=300&height=300&nologo=true`;
}

function getCategoryIcon(title: string) {
  const t = title.toLowerCase();
  if (t.match(/picanha|contra filé|alcatra|músculo|frango|linguiça|costela|carne|bovina|suína|açougue/)) return "🥩";
  if (t.match(/arroz|feijão|café|açúcar|óleo|molho|creme de leite|mercearia|cica|mococa/)) return "🫘";
  if (t.match(/heineken|cerveja|vinho|refrigerante|coca|bebida/)) return "🍺";
  if (t.match(/sabão|detergente|papel|sabonete|limpeza/)) return "🧴";
  return "🛒";
}

export default function ProductCard({ offer }: { offer: Offer }) {
  const fallback = getCategoryIcon(offer.title);
  const realImage = getRealImage(offer.title);
  
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-3 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">{offer.store_name.toUpperCase()}</span>
        <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded-full">{fallback} {offer.title.toLowerCase().includes('picanha') || offer.title.toLowerCase().includes('carne') || offer.title.toLowerCase().includes('frango') ? 'Açougue' : offer.title.toLowerCase().includes('heineken') || offer.title.toLowerCase().includes('vinho') || offer.title.toLowerCase().includes('cerveja') ? 'Bebidas' : offer.title.toLowerCase().includes('arroz') || offer.title.toLowerCase().includes('café') || offer.title.toLowerCase().includes('molho') ? 'Mercearia' : 'Outros'}</span>
      </div>
      
      {/* FOTO REAL COMPACTA 200x200 */}
      <div className="w-full h-[140px] bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden">
        <img 
          src={realImage} 
          alt={offer.title}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
          }}
        />
        <div className="hidden text-5xl">{fallback}</div>
      </div>

      <h3 className="font-bold text-[13px] leading-tight line-clamp-2 min-h-[36px] text-black">{offer.title}</h3>
      
      <div className="mt-2">
        <p className="font-black text-[18px] text-black">R$ {offer.price.toFixed(2).replace('.', ',')}</p>
        <p className="text-[10px] text-zinc-500">Válido 23 a 25/10/2026</p>
      </div>
    </div>
  );
}
