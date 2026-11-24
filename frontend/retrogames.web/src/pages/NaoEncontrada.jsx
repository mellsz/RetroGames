import { Link } from 'react-router-dom'

export function NaoEncontrada() {
  return (
    <section className="rg-estado-box rg-pagina-enter my-4">
      <p className="rg-font-pixel mb-2" style={{ fontSize: '0.78rem', color: 'var(--rg-magenta)' }}>
        ERRO 404 · FASE NÃO ENCONTRADA
      </p>
      <h1 className="h3 mb-3">Esse caminho não leva a nenhum cartucho</h1>
      <p className="mb-4" style={{ color: 'var(--rg-text-secondary)' }}>
        O endereço acessado não existe ou foi movido. Volte ao catálogo para explorar os jogos disponíveis.
      </p>
      <Link to="/" className="btn rg-btn-primary">
        Voltar ao catálogo
      </Link>
    </section>
  )
}
