import { Link, NavLink, Outlet } from 'react-router-dom'

const ANO_ATUAL = new Date().getFullYear()

export function Layout({ aoAbrirIntro }) {
  return (
    <div className="rg-app-shell">
      <header>
        <nav className="navbar navbar-expand-lg rg-navbar" aria-label="Navegação principal">
          <div className="container">
            <Link to="/" className="rg-brand navbar-brand me-4">
              <svg width="32" height="22" viewBox="0 0 24 16" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="20" height="11" rx="3" fill="#6d28d9" stroke="#a78bfa" strokeWidth="1.5" />
                <rect x="5" y="7" width="4" height="2" fill="#f1f0ff" />
                <rect x="6" y="6" width="2" height="4" fill="#f1f0ff" />
                <rect x="15" y="7" width="2" height="2" fill="#fbbf24" />
                <rect x="18" y="8" width="2" height="2" fill="#22d3ee" />
              </svg>
              <span className="rg-brand-texto">RETROGAMES</span>
            </Link>

            <button
              className="navbar-toggler rg-navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#menuPrincipal"
              aria-controls="menuPrincipal"
              aria-expanded="false"
              aria-label="Alternar menu de navegação"
            >
              <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
            </button>

            <div className="collapse navbar-collapse" id="menuPrincipal">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2 pt-2 pt-lg-0">
                <li className="nav-item">
                  <NavLink to="/" end className="rg-nav-link nav-link">
                    Catálogo
                  </NavLink>
                </li>
              </ul>

              {aoAbrirIntro && (
                <div className="d-flex pt-2 pt-lg-0">
                  <button
                    type="button"
                    className="rg-btn-intro"
                    onClick={aoAbrirIntro}
                  >
                    Intro Arcade
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="rg-main">
        <div className="container pt-4">
          <Outlet />
        </div>
      </main>

      <footer className="rg-footer">
        <div className="container">
          <div className="row gy-3 align-items-center justify-content-between">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="rg-brand-texto" style={{ fontSize: '0.82rem' }}>
                  RETROGAMES
                </span>
              </div>
              <p className="mb-0 small" style={{ color: 'var(--rg-text-secondary)' }}>
                Jogos clássicos usados, testados e preservados para novas jornadas.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <Link to="/" className="text-decoration-none me-3 small">
                Catálogo
              </Link>
              <span className="small" style={{ color: 'var(--rg-text-muted)' }}>
                © {ANO_ATUAL} RetroGames
              </span>
            </div>
          </div>
        </div>
        <div className="rg-footer-checker" aria-hidden="true" />
      </footer>
    </div>
  )
}
