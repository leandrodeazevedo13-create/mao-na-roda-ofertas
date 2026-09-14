
// Admin.tsx - Dashboard separado /admin - Só você
export default function Admin(){
  return (
    <div className="min-h-screen bg-[#111] text-white p-4">
      <h1 className="font-black text-xl">Admin - Fila de Aprovação</h1>
      <p className="text-xs opacity-60 mt-1">GPS só visível aqui • Validador preço ativo</p>
      <div className="mt-4 space-y-3">
        <div className="bg-white text-black rounded-2xl p-3">
          <p className="font-bold text-sm">Arroz 5kg R$ 23,90 - Central Itaguá</p>
          <p className="text-[11px] text-zinc-500">Foto: plaquinha OK • GPS: -23.434, -45.083 • Usuário: Ana P. (confiável 5 aprovações)</p>
          <div className="mt-2 flex gap-2"><button className="bg-black text-white px-3 py-1 rounded-full text-xs">Aprovar</button><button className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Reprovar</button></div>
        </div>
      </div>
    </div>
  )
}
