import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!GEMINI_KEY) return NextResponse.json({ ok: false, error: "SEM GEMINI_API_KEY" }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  // MODELO CORRETO QUE FUNCIONA HOJE: 2.0-flash (1.5 foi descontinuado)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const logs: string[] = [];
  let totalNovos = 0;

  // === MÁXIMO - FORÇA O 705.pdf ===
  const pdfs = [705, 704, 706, 703, 702, 701, 700];
  for (const num of pdfs) {
    const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
    logs.push(`Tentando Maximo PDF ${num}`);
    try {
      const res = await fetch(url);
      logs.push(`PDF ${num} status: ${res.status} size: ${res.headers.get('content-length')}`);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) continue;

      const prompt = `Extraia TODOS os produtos deste encarte de supermercado Maximo.
      Retorne APENAS JSON array: [{"title":"Arroz 5kg","price":19.99}]
      Title = nome completo + peso/volume. Price = numero com ponto. Ignore R$0,00. Minimo 5 produtos. Só JSON.`;

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: "application/pdf" } }
      ]);
      let text = result.response.text();
      logs.push(`Gemini ${num}: ${text.slice(0,250)}`);
      text = text.replace(/```json|```/g, "").trim();
      const s = text.indexOf("["); const e = text.lastIndexOf("]");
      if (s === -1 || e === -1) continue;
      const arr = JSON.parse(text.slice(s, e + 1));
      if (!Array.isArray(arr) || arr.length === 0) continue;

      logs.push(`PDF ${num} achou ${arr.length}`);

      await supabase.from("offers").delete().eq("store_name", "Máximo");

      const rows = arr.filter((p: any) => p.price > 0.5 && p.price < 1000).map((p: any) => ({
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
        logs.push(`✅ Máximo ${num} SALVO ${rows.length}`);
        break;
      }
    } catch (err: any) {
      logs.push(`ERRO PDF ${num}: ${err.message?.slice(0,300)}`);
    }
  }

  await supabase.from("offers").delete().lte("price", 0.5);

  return NextResponse.json({ ok: true, totalNovos, logs, ranAt: new Date().toISOString() });
}
