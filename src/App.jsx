
// App.tsx - Mão na Roda Ofertas - FINAL SALMÃO/PRETO/BRANCO COMPACTO MODERNO
import React, { useState, useEffect, useRef } from 'react';

const OFERTA_DO_DIA = [
  { id:1, emoji:"🍚", name:"Arroz 5kg Camil", price:"R$ 23,90", old:"R$ 32,90", market:"Supermercado Central", bairro:"Itaguá" },
  { id:2, emoji:"🫒", name:"Óleo de Soja 900ml", price:"R$ 5,99", old:"R$ 8,49", market:"Atacadão Ubatuba", bairro:"Centro" },
  { id:3, emoji:"🥩", name:"Carne Acém 1kg", price:"R$ 18,90", old:"R$ 26,90", market:"Açougue Itaguá", bairro:"Itaguá" },
];

const GRID = [
  { emoji:"🥛", name:"Leite Integral 1L", price:"R$ 4,19", market:"Central", verified:"2h" },
  { emoji:"🍞", name:"Pão Forma Wickbold", price:"R$ 6,99", market:"Atacadão", verified:"45min" },
  { emoji:"🧃", name:"Suco Del Valle 1L", price:"R$ 5,49", market:"Central", verified:"1h" },
  { emoji:"🧀", name:"Mussarela Fatiada 500g", price:"R$ 18,90", market:"Itaguá", verified:"3h" },
  { emoji:"🍝", name:"Macarrão Renata 500g", price:"R$ 3,29", market:"Atacadão", verified:"5h" },
  { emoji:"🥚", name:"Ovos Brancos 30un", price:"R$ 16,99", market:"Central", verified:"2h" },
];

const ROBOS = [
  { emoji:"🧴", name:"Detergente Ypê 500ml", price:"R$ 2,19", market:"Atacadão" },
  { emoji:"🧻", name:"Papel Higiênico 12 rolos", price:"R$ 13,90", market:"Central" },
  { emoji:"🥤", name:"Coca-Cola 2L", price:"R$ 7,99", market:"Atacadão" },
  { emoji:"🧈", name:"Manteiga Aviação 200g", price:"R$ 8,49", market:"Itaguá" },
];

const COMUNIDADE = [
  { emoji:"🍌", name:"Banana Nanica kg", price:"R$ 3,99", market:"Hortifruti Maranduba", user:"Ana P.", pts:"+10" },
  { emoji:"🍗", name:"Coxa c/ Sobrecoxa kg", price:"R$ 7,90", market:"Açougue Perequê", user:"Rafa", pts:"+10" },
  { emoji:"🧽", name:"Esponja Assolan", price:"R$ 1,99", market:"Central", user:"Marcos L.", pts:"+10" },
];

export default function App() {
  const [aba, setAba] = useState("inicio");
  const [carousel, setCarousel] = useState(0);
  const [showCam, setShowCam] = useState(false);
  const [etapa, setEtapa] = useState(1);
  const [bairro, setBairro] = useState("Itaguá");
  const [toast, setToast] = useState(null);
 const timerRef = useRef(null)

  useEffect(() => {
    if (aba !== "inicio") return;
    timerRef.current = window.setInterval(() => setCarousel(v => (v+1)%3), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [aba]);

  useEffect(() => { if (toast) { const t=setTimeout(()=>setToast(null),3000); return ()=>clearTimeout(t);} }, [toast]);

  const tirarFoto = () => { setEtapa(2); setTimeout(()=>setEtapa(3),2000); };
  const confirmar = () => { setShowCam(false); setEtapa(1); setToast("✅ Post enviado! +10 pts • Aprovação em até 2h"); };

  return (
    <div className="min-h-screen bg-[#FAFBFB] flex justify-center font-['Inter',system-ui]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap'); *{font-family:Inter,sans-serif}`}</style>
      <div className="w-full max-w-[390px] bg-white min-h-screen shadow-[0_0_80px_rgba(0,0,0,0.08)] relative flex flex-col">
        {/* HEADER */}
        <header className="bg-[#0F0F0F] text-white px-5 pt-5 pb-4 sticky top-0 z-30 backdrop-blur-xl border-b border-[#222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#FF6B4A] rounded-xl flex items-center justify-center text-[20px] font-black">🤙</div>
              <div>
                <h1 className="font-black tracking-tight leading-none text-[17px]">MÃO NA RODA <span className="font-light text-[#FF6B4A]">Ofertas</span></h1>
                <p className="text-[11px] opacity-60 font-semibold tracking-wide -mt-[1px]">UBATUBA • Todas em 1 lugar</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 border border-white/10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold">AO VIVO</span>
            </div>
          </div>
        </header>

        {/* BARRA SALMÃO */}
        <div className="bg-[#FF6B4A] text-black px-4 h-8 flex items-center justify-between">
          <p className="text-[11px] font-bold flex items-center gap-1">📸 Siga @maonaroda.ubatuba • novidades todo dia</p>
          <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full">NOVO</span>
        </div>

        <main className="flex-1 pb-[88px] overflow-y-auto">
          {aba==="inicio" && (
            <div className="px-3 pt-3">
              {/* CARROSSEL COMPACTO */}
              <div className="relative">
                <div className="rounded-[16px] bg-[#FFF0EB] border border-[#FFE0D0] overflow-hidden shadow-sm relative h-[120px]">
                  <div className="absolute inset-0 p-3 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="bg-black text-[#FF6B4A] text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest">🔥 OFERTA DO DIA</span>
                      <span className="text-[10px] font-bold text-black/50">{carousel+1}/3 • {OFERTA_DO_DIA[carousel].bairro}</span>
                    </div>
                    <div className="flex-1 flex gap-3 mt-2 items-center">
                      <div className="w-16 h-16 bg-white rounded-xl shadow flex items-center justify-center text-[28px] shrink-0 border">{OFERTA_DO_DIA[carousel].emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">{OFERTA_DO_DIA[carousel].market}</p>
                        <h2 className="font-black text-[14px] leading-tight text-black">{OFERTA_DO_DIA[carousel].name}</h2>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] line-through text-black/30 font-bold">{OFERTA_DO_DIA[carousel].old}</span>
                          <span className="text-[20px] font-black text-black tracking-tight">{OFERTA_DO_DIA[carousel].price}</span>
                        </div>
                      </div>
                      <button onClick={()=>setToast(`🎉 Oferta ${OFERTA_DO_DIA[carousel].name} copiada!`)} className="w-9 h-9 bg-[#0F0F0F] text-white rounded-full flex items-center justify-center">🛒</button>
                    </div>
                  </div>
                </div>
                <button onClick={()=>setCarousel(v=>(v-1+3)%3)} className="absolute left-1 top-[40%] w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">‹</button>
                <button onClick={()=>setCarousel(v=>(v+1)%3)} className="absolute right-1 top-[40%] w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">›</button>
              </div>
              <div className="flex justify-center gap-1.5 mt-2">
                {[0,1,2].map(i=><button key={i} onClick={()=>setCarousel(i)} className={`h-1.5 rounded-full transition-all ${i===carousel?"w-5 bg-[#0F0F0F]":"w-1.5 bg-zinc-300"}`} />)}
              </div>

              <div className="mt-3 px-1 flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                <span>📍</span><span>Mostrando todas de Ubatuba - sem filtro de bairro</span>
              </div>

              {/* FILTROS */}
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {["Todos","Califórnia","Peixão","Semar","Covabra"].map(f=>(
                  <button key={f} className={`h-8 px-3 rounded-full text-[12px] font-bold whitespace-nowrap border transition ${f==="Todos"?"bg-[#0F0F0F] text-white border-black shadow":"bg-white text-zinc-600 border-zinc-200"}`}>{f}</button>
                ))}
              </div>

              {/* GRID COMPACTO */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {GRID.map(p=>(
                  <div key={p.name} className="bg-white border border-[#EFEFEF] rounded-[16px] shadow-sm p-2 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-bold bg-zinc-100 px-2 py-0.5 rounded-full">{p.market}</span>
                      <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">✅ {p.verified}</span>
                    </div>
                    <div className="mt-2 h-[56px] rounded-xl bg-[#FAFAFA] flex items-center justify-center text-[28px]">{p.emoji}</div>
                    <p className="mt-2 text-[11px] font-bold leading-tight line-clamp-2 min-h-[30px]">{p.name}</p>
                    <p className="mt-1 text-[14px] font-black tracking-tight">{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aba==="promocoes" && (
            <div className="px-3 pt-3">
              <div className="rounded-[16px] bg-gradient-to-br from-[#FF6B4A] to-[#FF8C5A] p-4 text-black flex gap-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-[18px]">🤖</div>
                <div className="flex-1">
                  <h3 className="font-black text-[13px]">ROBÔ varrendo ofertas 2x/dia AO VIVO</h3>
                  <p className="text-[11px] mt-1 opacity-80">Varredura automática nos encartes. Sem bairro exposto.</p>
                  <div className="mt-2 flex gap-2"><span className="bg-black/10 text-[9px] font-bold px-2 py-1 rounded-full">06:00</span><span className="bg-black/10 text-[9px] font-bold px-2 py-1 rounded-full">18:00</span><span className="bg-black text-white text-[9px] font-black px-2 py-1 rounded-full">ATIVO</span></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {ROBOS.map(p=>(
                  <div key={p.name} className="bg-white border border-[#FFE0D0] rounded-[16px] p-2 relative">
                    <span className="absolute top-2 right-2 bg-black text-white text-[7px] font-black px-2 py-0.5 rounded-full">🤖 ROBÔ</span>
                    <div className="mt-5 h-14 bg-[#FFF0EB] rounded-xl flex items-center justify-center text-[28px]">{p.emoji}</div>
                    <p className="mt-2 text-[11px] font-bold leading-tight">{p.name}</p>
                    <p className="text-[13px] font-black mt-1">{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aba==="videos" && (
            <div className="flex flex-col items-center justify-center px-8 pt-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-2xl">🎥</div>
              <h3 className="mt-4 font-black text-[16px]">Vídeos em pausa</h3>
              <p className="mt-2 text-[13px] text-zinc-500">Deixando o app leve pro 3G da praia. Voltam em breve! 🚀</p>
              <button onClick={()=>setAba("inicio")} className="mt-6 bg-[#0F0F0F] text-white font-bold rounded-full px-6 h-10">Voltar pro Início</button>
            </div>
          )}

          {aba==="postagem" && (
            <div className="px-3 pt-3">
              <div className="flex justify-between items-center"><h2 className="font-black text-[16px]">Achados da Galera</h2><span className="text-[10px] font-bold bg-zinc-100 px-2 py-1 rounded-full">+10 pts</span></div>
              <div className="mt-3 space-y-2">
                {COMUNIDADE.map(p=>(
                  <div key={p.name} className="bg-white border rounded-[16px] p-2.5 flex gap-3">
                    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-xl">{p.emoji}</div>
                    <div className="flex-1"><p className="text-[10px] font-bold">👤 {p.user}</p><p className="font-bold text-[12px]">{p.name}</p><p className="text-[11px] text-zinc-500">{p.market} • {p.price}</p></div>
                    <span className="text-[10px] bg-[#FFF0EB] text-[#FF6B4A] font-black px-2 py-1 rounded-full h-fit">{p.pts}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setShowCam(true); setEtapa(1);}} className="fixed bottom-[92px] right-[calc(50%-195px+16px)] w-14 h-14 bg-[#0F0F0F] rounded-2xl shadow-xl flex items-center justify-center text-white text-xl">📸</button>
            </div>
          )}

          {aba==="parceiros" && (
            <div className="pb-6">
              <div className="bg-[#0F0F0F] text-white px-5 pt-5 pb-6 rounded-b-[24px]">
                <p className="text-[11px] font-bold opacity-60">🏪 ÁREA DO DONO DE MERCADO</p>
                <h2 className="mt-2 font-black text-[22px] leading-tight">É dono de<br/>mercado em<br/><span className="text-[#FF6B4A]">Ubatuba?</span></h2>
                <p className="mt-2 text-[12px] opacity-80">Poste com selo <span className="bg-white text-black px-1 rounded-full text-[10px] font-black">Oficial</span> e apareça no topo</p>
              </div>
              <div className="px-3 -mt-4 grid grid-cols-3 gap-2">
                {[{t:"Alcance toda Ubatuba",d:"Sem filtro"},{t:"Selo Oficial",d:"Destaque"},{t:"Grátis início",d:"Viralizar"}].map(c=>(
                  <div key={c.t} className="bg-white rounded-[14px] p-2.5 border shadow-sm"><p className="font-bold text-[10px] leading-tight">{c.t}</p><p className="text-[9px] text-zinc-500">{c.d}</p></div>
                ))}
              </div>
              <div className="px-3 mt-4 bg-white rounded-2xl p-4 border shadow-sm">
                <p className="font-black text-[13px]">Quero ser parceiro</p>
                <div className="mt-3 h-10 bg-zinc-50 border rounded-xl px-3 flex items-center text-[12px] text-zinc-400">Ex: Supermercado Central</div>
                <button onClick={()=>setToast("📋 Cadastro enviado! 24h • Grátis Fase 1")} className="mt-3 w-full h-11 bg-[#0F0F0F] text-white font-black rounded-full">QUERO SER PARCEIRO</button>
              </div>
              <div className="mt-4 bg-[#0F0F0F] rounded-2xl p-4 text-white mx-3">
                <h3 className="font-black text-[13px]">Tudo que já decidimos - Sócio Leandro</h3>
                <div className="mt-3 space-y-2 text-[11px]">
                  {["Domínio maonarodaofertas.com.br no ar","Sem login pra ver, pontos pra postar","Foto obrigatória GPS só banco","Anti-spam validador preço","Câmera inteligente robô preenche","Abas Início Promoções Vídeos Postagem Parceiros","Carrossel Oferta do Dia topo","Preço grande embaixo","Sistema pontos +10 confiável após 3","Botão denunciar 3 derruba","Vídeos off leve 3G","Parceiros selo Oficial Fase 2","Fase 1 viralizar grátis Fase 2 monetizar"].map(t=>(
                    <div key={t} className="flex gap-2"><span className="w-4 h-4 bg-[#FF6B4A] rounded-full flex items-center justify-center text-[10px] text-black">✓</span><span>{t}</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* NAV */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t px-2 pt-2 pb-2 flex justify-around z-20">
          {[{k:"inicio",l:"INÍCIO",i:"🏠"},{k:"promocoes",l:"PROMO",i:"🤖"},{k:"videos",l:"VÍDEOS",i:"🎥"},{k:"postagem",l:"POSTAR",i:"📸"},{k:"parceiros",l:"PARCEIROS",i:"🏪"}].map(t=>(
            <button key={t.k} onClick={()=>setAba(t.k)} className={`flex flex-col items-center py-1 px-3 rounded-xl ${aba===t.k?"bg-[#0F0F0F] text-white":"text-zinc-400"}`}>
              <span className="text-[14px]">{t.i}</span><span className="text-[8px] font-black">{t.l}</span>
            </button>
          ))}
        </nav>

        {/* MODAL CÂMERA 3 ETAPAS */}
        {showCam && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full bg-white rounded-t-[24px] p-5">
              <div className="flex justify-between"><p className="font-black">📸 Postar achado</p><button onClick={()=>setShowCam(false)} className="w-7 h-7 bg-zinc-100 rounded-full">✕</button></div>
              {etapa===1 && (
                <div className="mt-4">
                  <div className="h-[180px] rounded-2xl bg-zinc-900 flex flex-col items-center justify-center text-white">
                    <p className="text-[11px] opacity-60">Mire na plaquinha de preço</p>
                    <div className="mt-3 w-[160px] h-16 border-2 border-[#FF6B4A] border-dashed rounded-xl"></div>
                  </div>
                  <div className="mt-4 flex gap-2"><button onClick={()=>setShowCam(false)} className="flex-1 h-10 bg-zinc-100 rounded-full font-bold text-[12px]">Cancelar</button><button onClick={tirarFoto} className="flex-1 h-10 bg-[#0F0F0F] text-white rounded-full font-black text-[12px]">📸 Tirar foto</button></div>
                </div>
              )}
              {etapa===2 && (
                <div className="mt-8 flex flex-col items-center py-10">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B4A] animate-pulse flex items-center justify-center">🤖</div>
                  <p className="mt-3 font-black">Robô lendo...</p><p className="text-[11px] text-zinc-500">Detectando produto e preço</p>
                </div>
              )}
              {etapa===3 && (
                <div className="mt-4">
                  <div className="flex gap-3"><div className="w-16 h-16 bg-zinc-100 rounded-xl flex items-center justify-center text-2xl">🍚</div><div><p className="text-[10px] font-bold text-zinc-500">PRODUTO DETECTADO</p><p className="font-black text-[13px]">Arroz Camil 5kg</p><p className="font-black text-[#0F0F0F]">R$ 23,90</p></div></div>
                  <select value={bairro} onChange={e=>setBairro(e.target.value)} className="mt-3 w-full h-10 bg-zinc-50 border rounded-xl px-3 text-[12px]"><option>Itaguá</option><option>Centro</option><option>Perequê-Açu</option></select>
                  <div className="mt-3 flex gap-2"><button onClick={()=>setEtapa(1)} className="flex-1 h-10 bg-zinc-100 rounded-full font-bold text-[12px]">Corrigir</button><button onClick={confirmar} className="flex-1 h-10 bg-[#0F0F0F] text-white rounded-full font-black text-[12px]">✨ Confirmar</button></div>
                </div>
              )}
            </div>
          </div>
        )}

        {toast && <div className="absolute bottom-[96px] left-3 right-3 bg-black text-white rounded-xl px-4 py-3 text-[12px] font-bold z-50">{toast}</div>}
      </div>
    </div>
  );
}
