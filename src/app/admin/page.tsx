export default function AdminPage() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin - Mão na Roda</h1>
      <p style={{ marginTop: 12, color: '#555' }}>
        O build quebrou por causa do caractere maior que. Essa versão está corrigida.
      </p>
      
      <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Como colar oferta do Instagram:</h2>
        <ol style={{ marginTop: 12, lineHeight: 1.8 }}>
          <li>Abra instagram.com/semarsupermercados</li>
          <li>Clique com botão direito na foto e escolha Copiar endereço da imagem</li>
          <li>Cole aqui no formulário abaixo</li>
        </ol>
      </div>

      <div style={{ marginTop: 24 }}>
        <a href="/postar" style={{ display: 'inline-block', padding: '12px 20px', background: '#000', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
          Ir para /postar
        </a>
        <a href="/api/scrape" style={{ display: 'inline-block', padding: '12px 20px', background: '#eee', color: '#000', borderRadius: 8, textDecoration: 'none', fontWeight: 700, marginLeft: 12 }}>
          Testar /api/scrape
        </a>
      </div>
    </div>
  )
}
