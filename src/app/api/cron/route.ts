import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY!;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  
  // MODELO QUE FUNCIONOU HOJE - TRAVADO
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const logs: string[] = [];
  let totalNovos = 0;

  // === 1. SHIBATA JPG 688-712 ===
  try {
    logs.push("=== SHIBATA ===");
    for (let num = 712; num >= 688; num--) {
      const url = `https://shibata-supermercados.b-cdn.net/campanhas/${num}.jpg`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10000) continue;

      const prompt = `Extraia produtos deste encarte Shibata. JSON array: [{"title":"Arroz 5kg","price":19.99}] Só JSON.`;
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: "image/jpeg" } }
      ]);
      let text = result.response.text().replace(/```json|```/g, "").trim();
      const s = text.indexOf("["); const e = text.lastIndexOf("]");
      if (s === -1) continue;
      const arr = JSON.parse(text.slice(s, e + 1));
      if (!arr.length) continue;

      await supabase.from("offers").delete().eq("store_name", "Shibata");
      const rows = arr.filter((p: any) => p.price > 0.5).map((p: any) => ({
        title: String(p.title).slice(0,120),
        price: Number(p.price),
        store_name: "Shibata",
        image_url: url,
        neighborhood: "Ubatuba"
      }));
      await supabase.from("offers").insert(rows as any);
      totalNovos += rows.length;
      logs.push(`✅ Shibata ${num} = ${rows.length}`);
      break;
    }
  } catch (e: any) { logs.push(`Erro Shibata: ${e.message?.slice(0,200)}`); }

  // === 2. MAXIMO PDF 705 ===
  try {
    logs.push("=== MAXIMO ===");
    for (const num of [705, 704, 706, 712]) {
      const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) continue;

      const prompt = `Extraia TODOS produtos Maximo. JSON: [{"title":"Arroz 5kg","price":19.99}] Só JSON min 10 itens.`;
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: "application/pdf" } }
      ]);
      let text = result.response.text().replace(/```json|```/g, "").trim();
      const s = text.indexOf("["); const e = text.lastIndexOf("]");
      if (s === -1) continue;
      const arr = JSON.parse(text.slice(s, e + 1));
      if (!arr.length) continue;

      await supabase.from("offers").delete().eq("store_name", "Máximo");
      const rows = arr.filter((p: any) => p.price > 0.5).map((p: any) => ({
        title: String(p.title).slice(0,120),
        price: Number(p.price),
        store_name: "Máximo",
        image_url: url,
        neighborhood: "Ubatuba"
      }));
      await supabase.from("offers").insert(rows as any);
      totalNovos += rows.length;
      logs.push(`✅ Máximo ${num} = ${rows.length}`);
      break;
    }
  } catch (e: any) { logs.push(`Erro Maximo: ${e.message?.slice(0,300)}`); }

  // LIMPEZA FINAL
  await supabase.from("offers").delete().lte("price", 0.5);
  // Remove duplicatas por titulo+loja mantendo mais antigo
  const { data } = await supabase.from("offers").select("id,title,store_name").order("created_at", { ascending: true });
  if (data) {
    const seen = new Set();
    const dupIds: string[] = [];
    for (const row of data) {
      const key = `${row.title}|${row.store_name}`;
      if (seen.has(key)) dupIds.push(row.id);
      else seen.add(key);
    }
    if (dupIds.length) await supabase.from("offers").delete().in("id", dupIds);
  }

  return NextResponse.json({ ok: true, modelo: "gemini-flash-latest", totalNovos, logs, ranAt: new Date().toISOString() });
}
