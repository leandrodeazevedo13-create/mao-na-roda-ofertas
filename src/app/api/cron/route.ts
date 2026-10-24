import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];

async function extractFromImageUrl(url: string, storeName: string, genAI: any) {
  const prompt = `Extraia TODOS os produtos deste encarte do supermercado ${storeName}.
Retorne APENAS JSON array: [{"title":"Nome Produto 500g","price":12.99}]
Regras:
- title = nome completo com peso/kg/g/un. Ex: "Costelinha Suina KG", "Heineken 350ml"
- price = numero com ponto. Ex: 15.99
- Ignore R$0,00, sorteios, vales
- Minimo 10 produtos se houver
Apenas JSON, sem markdown.`;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = url.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
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
        console.log(`✅ ${storeName} ${modelName}: ${arr.length} produtos`);
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

  // 1. SHIBATA - campanhas 700 a 720 (imagens .jpg do cluster)
  logs.push("=== SHIBATA ===");
  for (let camp = 700; camp <= 720; camp++) {
    for (let page = 1; page <= 4; page++) {
      // Tenta 2 formatos de URL que o Shibata usa
      const urls = [
        `https://www.loja.shibata.com.br/wp-content/uploads/campanha-${camp}-${page}.jpg`,
        `https://shibata.com.br/wp-content/uploads/2025/10/campanha-${camp}-cluster-${page}-1200x1571.jpeg`
      ];
      for (const url of urls) {
        try {
          const head = await fetch(url, { method: "HEAD" });
          if (!head.ok) continue;
          const prods = await extractFromImageUrl(url, "Shibata", genAI);
          if (prods.length) {
            // limpa duplicatas antigas desse cluster
            const rows = prods.filter((p: any) => p.price > 0.5 && p.price < 500).map((p: any) => ({
              title: String(p.title).slice(0, 120).trim(),
              price: Number(p.price),
              store_name: "Shibata",
              image_url: url,
              neighborhood: "Ubatuba"
            }));
            const uniq = Array.from(new Map(rows.map((r: any) => [`${r.title}-${r.price}`, r])).values());
            if (uniq.length) {
              await supabase.from("offers").delete().eq("store_name", "Shibata").eq("image_url", url);
              const { error } = await supabase.from("offers").insert(uniq as any);
              if (!error) {
                totalNovos += uniq.length;
                logs.push(`Shibata ${camp}-${page}: ${uniq.length}`);
              }
            }
            await new Promise(r => setTimeout(r, 1500));
            break; // achou nessa campanha, vai pra proxima
          }
        } catch {}
      }
    }
  }

  // 2. MÁXIMO - PDFs 700 a 740 (705.pdf que você achou)
  logs.push("=== MAXIMO ===");
  for (let num = 740; num >= 700; num--) {
    const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) continue;
      logs.push(`Maximo tentando PDF ${num}`);
      const prods = await extractFromImageUrl(url, "Máximo", genAI);
      if (prods.length) {
        const rows = prods.filter((p: any) => p.price > 0.5).map((p: any) => ({
          title: String(p.title).slice(0, 120).trim(),
          price: Number(p.price),
          store_name: "Máximo",
          image_url: url,
          neighborhood: "Ubatuba"
        }));
        const uniq = Array.from(new Map(rows.map((r: any) => [`${r.title}-${r.price}`, r])).values());
        if (uniq.length) {
          await supabase.from("offers").delete().eq("store_name", "Máximo");
          await supabase.from("offers").insert(uniq as any);
          totalNovos += uniq.length;
          logs.push(`Maximo PDF ${num}: ${uniq.length} - PAROU`);
          break;
        }
      }
    } catch (e) {}
  }

  // 3. LIMPEZA GERAL - remove R$0.00 e duplicatas
  await supabase.from("offers").delete().lte("price", 0.5);

  return NextResponse.json({ ok: true, totalNovos, logs, ranAt: new Date().toISOString(), mensagem: "Robo 2x ao dia ativo" });
}
