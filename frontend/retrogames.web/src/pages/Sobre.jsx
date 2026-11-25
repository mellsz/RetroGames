import { Link } from 'react-router-dom'

export function Sobre() {
  return (
    <section className="rg-detalhe-card rg-pagina-enter">
      <p className="small fw-semibold mb-2" style={{ color: 'var(--rg-cyan)' }}>
        SOBRE A LOJA
      </p>
      <h1 className="h3 fw-bold mb-3">Sobre a RetroGames</h1>
      <p className="rg-detalhe-descricao mb-3">
        A RetroGames é uma loja especializada em jogos retrô usados, dedicada a preservar títulos clássicos de consoles que marcaram gerações. Cada item cadastrado traz plataforma, gêneros, ano de lançamento e condição real de conservação.
      </p>
      <p className="rg-detalhe-descricao mb-4">
        Este projeto integra o frontend em React com Bootstrap e React Router a uma API REST em ASP.NET Core (.NET 10) conectada ao MySQL 8.
      </p>
      <Link to="/" className="btn rg-btn-primary">
        Explorar catálogo
      </Link>
    </section>
  )
}
