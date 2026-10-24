import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!geminiKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false, error: "ENV faltando" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalSalvos = 0;
    const log: any[] = [];

    // 1. SHIBATA - campanhas 700 a 712
    for (let camp = 700; camp <= 712; camp++) {
      const url = `https://shibata.com.br/campanhas/${camp}.jpg`;
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");

        const prompt = `Extraia TODOS produtos desta oferta de supermercado. 
        Retorne JSON ARRAY puro: [{"name":"Nome Produto 300g","price":11.9,"category":"mercearia","brand":""}]
        Regras: name completo com peso, price apenas numero (ex 11.90), category uma de: acougue, bebidas, mercearia, hortifruti, limpeza, pet, etc. Ignore R$0.00. Minimo 15 produtos se houver.`;

        const result = await model.generateContent([
          { inlineData: { data: base64, mimeType: "image/jpeg" } },
          { text: prompt }
        ]);
        let text = result.response.text();
        text = text.replace(/```json|```/g, "").trim();
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) continue;
        const produtos = JSON.parse(match[0]);

        for (const p of produtos) {
          if (!p.name || !p.price || p.price < 0.5) continue;
          const { error } = await supabase.from("offers").insert({
            name: p.name.trim(),
            price: p.price,
            market: "Shibata",
            category: p.category || "mercado",
            brand: p.brand || "",
            image_url: url,
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            is_active: true
          });
          if (!error) totalSalvos++;
        }
        log.push({ camp, qtd: produtos.length });
      } catch (e) {
        log.push({ camp, erro: String(e).slice(0,100) });
      }
    }

    // 2. MAXIMO - PDFs 700 a 735
    for (let pdf = 700; pdf <= 735; pdf++) {
      const url = `https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/${pdf}.pdf`;
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok) continue;
        // Por enquanto só loga que existe, extração de PDF vem na próxima versão
        log.push({ maximo_pdf: pdf, status: "existe" });
      } catch {}
    }

    return NextResponse.json({ ok: true, totalSalvos, log, robo: "ativo 2x ao dia Shibata+Maximo" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
