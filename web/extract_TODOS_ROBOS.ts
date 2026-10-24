import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const MODELS_FALLBACK = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-flash-8b"];

async function extractWithGemini(imageUrl: string, storeName: string) {
  const prompt = `Extraia TODOS os produtos deste encarte de supermercado ${storeName}.
Retorne JSON puro array: [{"title":"Nome Produto Peso","price":12.99}]
Regras:
- title = nome completo + peso/kg/g/unidade. Ex: "Costelinha Suína KG", "Café Brasileiro 500g"
- price = numero com ponto. Ex: 15.99
- Ignore R$0,00, sorteios, vales, combos sem preço
- Se não conseguir ler, pule
Apenas JSON, sem markdown.`;

  for (const modelName of MODELS_FALLBACK) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // baixar imagem/pdf como base64
      const res = await fetch(imageUrl);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = imageUrl.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
      
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: buf.toString("base64"), mimeType: mime } }
      ]);
      let text = result.response.text();
      text = text.replace(/```json|```/g, "").trim();
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      if (start === -1) continue;
      const jsonStr = text.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✅ ${storeName} ${modelName}: ${parsed.length} produtos de ${imageUrl}`);
        return parsed;
      }
    } catch (e: any) {
      console.log(`❌ ${modelName} falhou p/ ${storeName}: ${e.message?.slice(0,100)}`);
    }
  }
  return [];
}

async function saveOffers(products: any[], storeName: string, sourceUrl: string) {
  if (!products.length) return 0;
  // limpa ofertas antigas do mesmo mercado (>3 dias) para não duplicar
  await supabase.from("offers").delete().eq("store_name", storeName).lt("created_at", new Date(Date.now()-3*24*60*60*1000).toISOString());

  const rows = products
    .filter((p: any) => p.price && Number(p.price) > 0.5 && Number(p.price) < 500)
    .map((p: any) => ({
      title: String(p.title).slice(0, 120).replace(/\[entity-.*$/,"").trim(), // remove bug [entity-
      price: Number(p.price),
      store_name: storeName,
      image_url: sourceUrl,
      neighborhood: "Ubatuba"
    }));

  // remove duplicatas por titulo+preco
  const uniq = Array.from(new Map(rows.map((r:any)=>[`${r.title}-${r.price}`, r])).values());
  
  const { error } = await supabase.from("offers").insert(uniq);
  if (error) console.error(`Erro insert ${storeName}:`, error.message);
  else console.log(`💾 ${storeName}: ${uniq.length} salvos`);
  return uniq.length;
}

export async function runAllRobots() {
  let total = 0;

  // 1. SHIBATA - varre campanhas 688 a 710
  console.log("\n=== ROBÔ SHIBATA ===");
  for (let camp = 688; camp <= 710; camp++) {
    for (let page = 1; page <= 3; page++) {
      const url = `https://shibata.com.br/wp-content/uploads/campanha-${camp}-${page}.jpg`;
      try {
        const head = await fetch(url, { method: "HEAD" });
        if (!head.ok) continue;
        const prods = await extractWithGemini(url, "Shibata");
        total += await saveOffers(prods, "Shibata", url);
        await new Promise(r=>setTimeout(r, 2000)); // evita rate limit
      } catch {}
    }
  }

  // 2. MÁXIMO - varre PDFs 700 a 740
  console.log("\n=== ROBÔ MÁXIMO ===");
  for (let num = 740; num >= 700; num--) { // do mais novo pro mais velho
    const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${num}.pdf`;
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) continue;
      console.log(`Tentando Máximo PDF ${num}`);
      const prods = await extractWithGemini(url, "Máximo");
      if (prods.length > 0) {
        total += await saveOffers(prods, "Máximo", url);
        break; // achou o mais novo, para
      }
    } catch {}
  }

  // 3. CONDE - Instagram ainda manual, mas tenta site se tiver encarte
  console.log("\n=== ROBÔ CONDE (site) ===");
  // futuro: scraping instagram condesupermercados

  // 4. SEMAR - placeholder VTEX
  console.log("\n=== ROBÔ SEMAR (placeholder) ===");
  // TODO: implementar VTEX API

  // 5. TENDA
  console.log("\n=== ROBÔ TENDA (placeholder) ===");
  
  console.log(`\n🏁 TOTAL GERAL: ${total} ofertas novas`);
  return total;
}

if (require.main === module) {
  runAllRobots();
}
