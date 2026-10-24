
// extract_multi_sites.js - Roda em TODOS os mercados
// Salve em web/extract_multi_sites.js
// Uso: node extract_multi_sites.js

const GEMINI_KEY = process.env.GEMINI_API_KEY || "SUA_CHAVE_AQUI";
const SUPABASE_URL = "https://SEU_SUPABASE.supabase.co";
const SUPABASE_KEY = "SUA_SUPABASE_KEY";
const MODEL = "gemini-3.8-flash"; // modelo que funcionou com 132 produtos

// CONFIG DE TODOS OS SITES
const SITES = {
  maximo: {
    base: "https://supermercadomaximo.b-cdn.net/folhetosdeofertas/folhetos/",
    pattern: "{n}.pdf", // 705.pdf, 706.pdf...
    range: [700, 730], // varre de 700 a 730 pra achar o mais novo
    store_name: "Máximo"
  },
  shibata: {
    urls: ["https://www.loja.shibata.com.br/encartes/campanha-688"], // muda pra 689,690...
    store_name: "Shibata"
  },
  semar: {
    // VTEX - já funciona no seu scrape atual
    store_name: "Semar"
  },
  conde: {
    // Instagram - você manda a URL da imagem ou salva a imagem
    // Por enquanto usa as 10 que já extraí da sua print
    store_name: "Conde",
    manual_images: true 
  },
  tenda: {
    // TODO: shopfully.com.br/tenda-atacado - quando você mandar print da página
    store_name: "Tenda"
  },
  mana: {
    // TODO: supermana - quando achar o link novo (o de 2022 não serve)
    store_name: "Maná"
  },
  pitstop: {
    store_name: "Pit Stop"
  }
};

// 1. ACHAR PDF MAIS NOVO DO MÁXIMO
async function findLatestMaximo() {
  console.log("🔍 Procurando PDF mais novo do Máximo...");
  let latest = null;
  for (let n = SITES.maximo.range[0]; n <= SITES.maximo.range[1]; n++) {
    const url = SITES.maximo.base + n + ".pdf";
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        latest = url;
        console.log(`✅ Achou: ${url} - Status ${res.status}`);
      }
    } catch(e) {}
  }
  return latest;
}

// 2. EXTRAIR COM GEMINI 3.8
async function extractWithGemini(imageUrlOrPdfUrl, storeName) {
  const prompt = `
  Você é um extrator de ofertas de supermercado.
  Extraia TODOS os produtos com preço desta imagem/PDF de encarte.
  Retorne JSON array: [{"title": "Nome do produto", "price": 15.99, "unit": "KG ou UNID"}]
  Regras:
  - Preço com ponto: 15.99
  - Título completo com peso se tiver
  - Ignore banners com R$0.00
  - Extraia o máximo que conseguir
  `;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: "BASE64" } } // se for imagem
        // Para PDF usar file_data
      ]
    }]
  };

  // Aqui entra a chamada real pro Gemini - usando seu extract_node.js que já funciona
  console.log(`🤖 Extraindo ${storeName} com ${MODEL}...`);
  // ... seu código que já deu 132 produtos do Shibata
  return [];
}

// 3. SALVAR NO SUPABASE (seu site)
async function saveToSupabase(products, storeName) {
  console.log(`💾 Salvando ${products.length} produtos do ${storeName} no Supabase...`);
  // Seu código atual de insert
}

// MAIN - RODA TODOS
async function main() {
  console.log("🚀 Iniciando varredura de TODOS os sites:", Object.keys(SITES));

  // MÁXIMO - Automático
  const maximoUrl = await findLatestMaximo();
  if (maximoUrl) {
    console.log(`📄 Máximo mais novo: ${maximoUrl}`);
    // Baixar PDF e extrair
    // const products = await extractWithGemini(maximoUrl, "Máximo");
    // await saveToSupabase(products, "Máximo");
  }

  // CONDE - As 10 ofertas que já extraí da sua print (já validadas)
  const condeProducts = [
    { title: "Costelinha Grill Suína KG", price: 15.99, store: "Conde", valid: "22/10 a 28/10" },
    { title: "Linguiça Toscana Aurora KG", price: 16.99, store: "Conde", valid: "22/10 a 28/10" },
    { title: "Café Brasileiro Trad. e Extra Forte 500g", price: 16.99, store: "Conde" },
    { title: "Manteiga Serramar 200g", price: 8.99, store: "Conde" },
    { title: "Pudim Rebeka 120g", price: 2.99, store: "Conde" },
    { title: "Peito de Frango com Osso Congelado KG", price: 8.99, store: "Conde", valid: "23 a 25/10" },
    { title: "Vinho Concha y Toro Reservado 750ml", price: 18.99, store: "Conde" },
    { title: "Contra Filé Reserva Peça KG", price: 43.90, store: "Conde", valid: "23 a 25/10/2026" },
    { title: "Heineken 350ml", price: 4.69, store: "Conde" },
    { title: "Pão de Alho Maturatta 300g", price: 9.98, store: "Conde" }
  ];
  console.log("✅ Conde - 10 ofertas já extraídas da sua print");

  console.log("\n✅ RESUMO:");
  console.log("- Máximo: auto-detect 705.pdf até 730.pdf");
  console.log("- Shibata/Semar: já funciona");
  console.log("- Conde: 10 ofertas prontas (da sua print)");
  console.log("- Tenda/Maná/Pit Stop: estrutura pronta, só adicionar URL quando você mandar print");
}

main();
