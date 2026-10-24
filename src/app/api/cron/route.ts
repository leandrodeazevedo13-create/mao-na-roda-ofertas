import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!GEMINI_KEY) return NextResponse.json({ ok: false, error: "SEM GEMINI_API_KEY na Vercel" }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const logs: string[] = [];
  let totalNovos = 0;

  // === MÁXIMO - TESTA DIRETO O 705 QUE VOCÊ ACHOU ===
  const pdfs = [705, 704, 706, 703, 712, 711, 710, 709, 708, 707];
  for (const num of pdfs) {
    const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
    logs.push(`Tentando Maximo PDF ${num}`);
    try {
      const res = await fetch(url);
      logs.push(`PDF ${num} status: ${res.status} size: ${res.headers.get('content-length')}`);
      if (!res.ok) continue;
      
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) { logs.push(`PDF ${num} muito pequeno ${buf.length}`); continue; }

      const prompt = `Você é extrator de ofertas de supermercado. Extraia TODOS os produtos deste PDF de encarte do Supermercado Máximo.
      Retorne APENAS JSON array no formato: [{"title":"Arroz 5kg Tipo 1","price":19.99},{"title":"Heineken 350ml","price":3.99}]
      Regras: title com nome completo + peso, price numero com ponto. Ignore R$0,00 e sorteios. Extraia no minimo 5 produtos. Só JSON, sem markdown.`;

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: "application/pdf" } }
      ]);
      let text = result.response.text();
      logs.push(`Gemini raw ${num}: ${text.slice(0,200)}`);
      
      text = text.replace(/```json|```/g, "").trim();
      const s = text.indexOf("[");
      const e = text.lastIndexOf("]");
      if (s === -1 || e === -1) { logs.push(`Sem JSON no PDF ${num}`); continue; }
      
      const arr = JSON.parse(text.slice(s, e + 1));
      if (!Array.isArray(arr) || arr.length === 0) { logs.push(`Array vazio PDF ${num}`); continue; }

      logs.push(`PDF ${num} achou ${arr.length} produtos`);
      
      // limpa antigos do Máximo e insere
      await supabase.from("offers").delete().eq("store_name", "Máximo");
      
      const rows = arr.filter((p: any) => p.price > 0.5 && p.price < 1000).map((p: any) => ({
        title: String(p.title).slice(0, 120),
        price: Number(p.price),
        store_name: "Máximo",
        image_url: url,
        neighborhood: "Ubatuba"
      }));

      const { data, error } = await supabase.from("offers").insert(rows as any).select();
      if (error) {
        logs.push(`ERRO Supabase Maximo: ${error.message}`);
      } else {
        totalNovos += rows.length;
        logs.push(`✅ Máximo PDF ${num} SALVOU ${rows.length}`);
        break; // para no primeiro que der certo
      }
    } catch (err: any) {
      logs.push(`ERRO PDF ${num}: ${err.message?.slice(0,200)}`);
    }
  }

  // === LIMPEZA ===
  await supabase.from("offers").delete().lte("price", 0.5);

  return NextResponse.json({ ok: true, totalNovos, logs, ranAt: new Date().toISOString(), mensagem: "Robo Maximo tentado" });
}
