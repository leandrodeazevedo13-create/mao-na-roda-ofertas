import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Ranking(){
  const [top,setTop]=useState([])
  useEffect(()=>{(async()=>{
    const {data}=await supabase.from('stores').select('*').order('points',{ascending:false}).limit(3)
    setTop(data||[])
  })()},[])
  if(!top.length) return null
  return (
    <div className="bg-black text-white rounded-2xl p-4 mb-4">
      <p className="font-black text-sm mb-2">🏆 TOP MERCADOS - UBATUBA</p>
      {top.map((s,i)=>(
        <div key={s.name} className="flex justify-between text-sm py-1 border-b border-white/10 last:border-0">
          <span>{i+1}º {s.name}</span><span className="font-black">{s.points}pts</span>
        </div>
      ))}
    </div>
  )
}