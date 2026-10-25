import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Função que limpa duplicatas após inserir
async function limparDuplicatas(supabase: any) {
  const { data } = await supabase.from("offers").select("id,title,store_name,created_at").order("created_at", { ascending: true });
  if (!data) return;
  const seen = new Set<string>();
  const dupIds: string[] = [];
  for (const row of data) {
    const key = `${row.title}|${row.store_name}`;
    if (seen.has(key)) dupIds.push(row.id);
    else seen.add(key);
  }
  if (dupIds.length) {
    await supabase.from("offers").delete().in("id", dupIds);
    console.log(`🧹 Limpos ${dupIds.length} duplicatas`);
  }
}

export async function GET() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY!;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  let totalNovos = 0;
  const logs: string[] = [];

  // === MÁXIMO - 705 PDF (só roda se não tiver 40 já) ===
  try {
    const { count } = await supabase.from("offers").select("*", { count: "exact", head: true }).eq("store_name", "Máximo");
    logs.push(`Maximo já tem ${count} ofertas`);
    if ((count || 0) < 40) {
      logs.push("=== MAXIMO PDF 705 ===");
      const url = "https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/705.pdf";
      const res = await fetch(url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const prompt = `Extraia TODOS produtos deste encarte Supermercado Maximo. Retorne APENAS JSON array: [{"title":"Nome Produto Peso","price":19.99}] Minimo 15 itens. Só JSON.`;
        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { data: buf.toString("base64"), mimeType: "application/pdf" } }
        ]);
        let text = result.response.text().replace(/```json|```/g, "").trim();
        const s = text.indexOf("["); const e = text.lastIndexOf("]");
        if (s !== -1) {
          const arr = JSON.parse(text.slice(s, e + 1));
          logs.push(`PDF 705 achou ${arr.length}`);
          await supabase.from("offers").delete().eq("store_name", "Máximo");
          const rows = arr.filter((p: any) => p.price > 0.5 && p.price < 500).map((p: any) => ({
            title: String(p.title).slice(0, 120).trim(),
            price: Number(p.price),
            store_name: "Máximo",
            image_url: url,
            neighborhood: "Ubatuba"
          }));
          const { error } = await supabase.from("offers").insert(rows as any);
          if (!error) { totalNovos += rows.length; logs.push(`✅ Maximo 705 = ${rows.length}`); }
        }
      }
    } else {
      logs.push(`Maximo já tem ${count} - pula`);
    }
  } catch (e: any) { logs.push(`Erro Maximo: ${e.message?.slice(0,200)}`); }

  // === LIMPEZA FINAL ===
  await supabase.from("offers").delete().lte("price", 0.5);
  await limparDuplicatas(supabase);

  const { data: final } = await supabase.from("offers").select("store_name", { count: "exact" });
  logs.push(`TOTAL FINAL: ${final?.length || 0}`);

  return NextResponse.json({ ok: true, modelo: "gemini-flash-latest", totalNovos, logs, ranAt: new Date().toISOString() });
}
