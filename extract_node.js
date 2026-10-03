// Roda sem PowerShell: node extract_node.js
// Nao precisa se preocupar com aspas

const API = 'https://www.maonarodaofertas.com.br/api/extract';

async function extrair(urlImagem){
  console.log('Extraindo:', urlImagem);
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: urlImagem,
      store_name: 'Shibata'
    })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
  return json;
}

(async()=>{
  await extrair('https://shibata.com.br/wp-content/uploads/2026/09/campanha-688-cluster-10-pagina-1-1200x1571.jpeg');
  await extrair('https://shibata.com.br/wp-content/uploads/2026/09/campanha-688-cluster-10-pagina-2-1200x1571.jpeg');
})()
