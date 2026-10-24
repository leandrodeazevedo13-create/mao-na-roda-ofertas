import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);

  const logs: string[] = [];
  let totalNovos = 0;

  // Tenta todos os modelos novos até um funcionar
  const MODELOS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-1.5-flash-latest", "gemini-2.0-flash-exp"];
  
  let model: any = null;
  let modeloUsado = "";
  for (const m of MODELOS) {
    try {
      const testModel = genAI.getGenerativeModel({ model: m });
      // teste rapido
      await testModel.generateContent("teste");
      model = testModel;
      modeloUsado = m;
      logs.push(`✅ Modelo funcionando: ${m}`);
      break;
    } catch (e: any) {
      logs.push(`Modelo ${m} falhou: ${e.message?.slice(0,150)}`);
    }
  }
  
  if (!model) {
    // fallback final
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    modeloUsado = "gemini-2.5-flash (fallback)";
    logs.push(`Usando fallback: ${modeloUsado}`);
  }

  // === MÁXIMO - FORÇA 705.pdf ===
  const pdfs = [705, 704, 706, 703, 712];
  for (const num of pdfs) {
    const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
    logs.push(`Tentando PDF ${num}`);
    try {
      const res = await fetch(url);
      if (!res.ok) { logs.push(`PDF ${num} status ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) continue;

      const prompt = `Extraia TODOS produtos deste encarte Maximo. Retorne APENAS JSON array: [{"title":"Arroz 5kg","price":19.99}] Title nome completo. Price numero. Minimo 8 produtos. Só JSON.`;

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: "application/pdf" } }
      ]);
      let text = result.response.text();
      logs.push(`Gemini ${num} (${modeloUsado}): ${text.slice(0,300)}`);
      text = text.replace(/```json|```/g, "").trim();
      const s = text.indexOf("["); const e = text.lastIndexOf("]");
      if (s === -1) { logs.push(`Sem JSON ${num}`); continue; }
      const arr = JSON.parse(text.slice(s, e + 1));
      if (!arr.length) continue;

      await supabase.from("offers").delete().eq("store_name", "Máximo");
      const rows = arr.filter((p: any) => p.price > 0.5).map((p: any) => ({
        title: String(p.title).slice(0, 120),
        price: Number(p.price),
        store_name: "Máximo",
        image_url: url,
        neighborhood: "Ubatuba"
      }));
      const { error } = await supabase.from("offers").insert(rows as any);
      if (error) logs.push(`ERRO Supabase: ${error.message}`);
      else {
        totalNovos += rows.length;
        logs.push(`✅ SALVOU Maximo ${num} = ${rows.length} ofertas`);
        break;
      }
    } catch (err: any) {
      logs.push(`ERRO ${num}: ${err.message?.slice(0,400)}`);
    }
  }

  await supabase.from("offers").delete().lte("price", 0.5);

  return NextResponse.json({ ok: true, modelo: modeloUsado, totalNovos, logs, ranAt: new Date().toISOString() });
}
