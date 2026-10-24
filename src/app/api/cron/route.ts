import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-2.5-flash"];

async function extractFromUrl(imageUrl: string, storeName: string, genAI: any) {
  const prompt = `Extraia TODOS os produtos deste encarte ${storeName}.
Retorne APENAS JSON array: [{"title":"Nome Completo Peso","price":12.99}]
- title com peso: "Costelinha Suína KG", "Café 500g"
- price numero com ponto
- ignore R$0,00, sorteios, vale-compras
Só JSON, sem markdown.`;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await fetch(imageUrl);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = imageUrl.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: mime } }
      ]);
      let text = result.response.text().replace(/```json|```/g, "").trim();
      const s = text.indexOf("[");
      const e = text.lastIndexOf("]");
      if (s === -1) continue;
      const arr = JSON.parse(text.slice(s, e + 1));
      if (Array.isArray(arr) && arr.length > 0) {
        console.log(`✅ ${storeName} ${modelName}: ${arr.length} de ${imageUrl}`);
        return arr;
      }
    } catch (err: any) {
      console.log(`❌ ${modelName} ${storeName}: ${err.message?.slice(0,80)}`);
    }
  }
  return [];
}

export async function GET() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!GEMINI_KEY) return NextResponse.json({ ok: false, error: "GEMINI_API_KEY faltando" }, { status: 500 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);

  let totalNovos = 0;
  const logs: string[] = [];

  // 1. SHIBATA - tenta 688 a 710
  logs.push("=== SHIBATA ===");
  for (let camp = 688; camp <= 712; camp++) {
    for (let page = 1; page <= 4; page++) {
      const url = `https://shibata.com.br/wp-content/uploads/campanha-${camp}-${page}.jpg`;
      try {
        const head = await fetch(url, { method: "HEAD" });
        if (!head.ok) continue;
        const prods = await extractFromUrl(url, "Shibata", genAI);
        if (prods.length) {
          const rows = prods.filter((p: any) => p.price > 0.5 && p.price < 500).map((p: any) => ({
            title: String(p.title).slice(0,120).trim(),
            price: Number(p.price),
            store_name: "Shibata",
            image_url: url,
            neighborhood: "Ubatuba"
          }));
          const uniq = Array.from(new Map(rows.map((r: any) => [`${r.title}-${r.price}`, r])).values());
          const uniqArr = Array.from(uniq);
          if (uniqArr.length) {
            await supabase.from("offers").insert(uniqArr as any);
            totalNovos += uniqArr.length;
            logs.push(`Shibata campanha ${camp}-${page}: ${uniqArr.length}`);
          }
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch {}
    }
  }

  // 2. MÁXIMO - PDFs 700 a 735 do mais novo pro velho
  logs.push("=== MAXIMO ===");
  for (let num = 735; num >= 700; num--) {
    const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) continue;
      logs.push(`Tentando Maximo ${num}`);
      const prods = await extractFromUrl(url, "Máximo", genAI);
      if (prods.length) {
        const rows = prods.filter((p: any) => p.price > 0.5).map((p: any) => ({
          title: String(p.title).slice(0,120).trim(),
          price: Number(p.price),
          store_name: "Máximo",
          image_url: url,
          neighborhood: "Ubatuba"
        }));
        const uniq = Array.from(new Map(rows.map((r: any) => [`${r.title}-${r.price}`, r])).values());
        const uniqArr = Array.from(uniq);
        if (uniqArr.length) {
          await supabase.from("offers").insert(uniqArr as any);
          totalNovos += uniqArr.length;
          logs.push(`Maximo PDF ${num}: ${uniqArr.length} - PAROU AQUI (mais novo)`);
          break;
        }
      }
    } catch {}
  }

  return NextResponse.json({ ok: true, totalNovos, logs, ranAt: new Date().toISOString() });
}
