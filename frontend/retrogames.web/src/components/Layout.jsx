import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import logoRetroGames from '../assets/logo-retrogames.png'
import { IconeCarrinho, IconeLupa, IconePessoa } from './IconesNavbar'

const ANO_ATUAL = new Date().getFullYear()

export function Layout({ aoAbrirIntro }) {
  const navigate = useNavigate()
  const localizacao = useLocation()
  const [searchParams] = useSearchParams()
  const buscaAtual = searchParams.get('busca') ?? ''
  const estaNoCatalogo = localizacao.pathname === '/'

  const [painelAberto, setPainelAberto] = useState(null) // 'conta' | 'carrinho' | null
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)
  const acoesRef = useRef(null)

  useEffect(() => {
    function aoClicarFora(evento) {
      if (acoesRef.current && !acoesRef.current.contains(evento.target)) {
        setPainelAberto(null)
      }
    }

    function aoPressionarEsc(evento) {
      if (evento.key === 'Escape') {
        setPainelAberto(null)
        setMenuMobileAberto(false)
      }
    }

    document.addEventListener('mousedown', aoClicarFora)
    window.addEventListener('keydown', aoPressionarEsc)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      window.removeEventListener('keydown', aoPressionarEsc)
    }
  }, [])

  function aoBuscarNaNavbar(evento) {
    evento.preventDefault()
    const dados = new FormData(evento.currentTarget)
    const termo = String(dados.get('busca') ?? '').trim()

    setMenuMobileAberto(false)
    setPainelAberto(null)

    if (termo) {
      navigate(`/?busca=${encodeURIComponent(termo)}`)
    } else {
      navigate('/')
    }
  }

  function alternarPainel(nome) {
    setPainelAberto((anterior) => (anterior === nome ? null : nome))
  }

  function fecharMenus() {
    setMenuMobileAberto(false)
    setPainelAberto(null)
  }

  return (
    <div className="rg-app-shell">
      <header className={`rg-navbar-wrapper ${estaNoCatalogo ? 'rg-navbar-wrapper--catalogo' : ''}`}>
        <div className="rg-faixa-anuncio">
          <span>Frete grátis acima de R$ 200 · aproveite nossos cupons e ofertas</span>
        </div>
        <nav className="navbar navbar-expand-lg rg-navbar" aria-label="Navegação principal">
          <div className="container rg-navbar-inner">
            <Link to="/inicio" className="rg-brand navbar-brand" onClick={fecharMenus}>
              <img src={logoRetroGames} alt="RetroGames" className="rg-brand-logo" />
            </Link>

            <button
              className="navbar-toggler rg-navbar-toggler d-lg-none"
              type="button"
              aria-controls="menuPrincipal"
              aria-expanded={menuMobileAberto}
              aria-label="Alternar menu de navegação"
              onClick={() => setMenuMobileAberto((aberto) => !aberto)}
            >
              <span className="rg-toggler-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>

            <div className={`collapse navbar-collapse ${menuMobileAberto ? 'show' : ''}`} id="menuPrincipal">
              <ul className="navbar-nav rg-nav-list mx-lg-auto mb-3 mb-lg-0">
                <li className="nav-item">
                  <NavLink to="/inicio" className="rg-nav-link nav-link" onClick={fecharMenus}>
                    Início
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/" end className="rg-nav-link nav-link" onClick={fecharMenus}>
                    Catálogo
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/sobre" className="rg-nav-link nav-link" onClick={fecharMenus}>
                    Sobre
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/contato" className="rg-nav-link nav-link" onClick={fecharMenus}>
                    Contato
                  </NavLink>
                </li>
              </ul>

              <div className="rg-navbar-actions" ref={acoesRef}>
                <form className="rg-navbar-search" role="search" onSubmit={aoBuscarNaNavbar}>
                  <button type="submit" className="rg-navbar-search-btn" aria-label="Buscar jogos">
                    <IconeLupa />
                  </button>
                  <input
                    key={buscaAtual}
                    name="busca"
                    type="search"
                    className="rg-navbar-search-input"
                    placeholder="Buscar jogos..."
                    defaultValue={buscaAtual}
                    aria-label="Buscar jogos"
                  />
                </form>

                <div className="rg-navbar-icons">
                  <div className="position-relative">
                    <button
                      type="button"
                      className={`rg-icon-btn ${painelAberto === 'conta' ? 'is-active' : ''}`}
                      aria-label="Conta, login e administração"
                      aria-expanded={painelAberto === 'conta'}
                      onClick={() => alternarPainel('conta')}
                    >
                      <IconePessoa />
                    </button>

                    {painelAberto === 'conta' && (
                      <div className="rg-nav-popover" role="dialog" aria-label="Área da conta">
                        <p className="rg-nav-popover-titulo mb-1">Conta e Acesso</p>
                        <p className="small mb-2" style={{ color: 'var(--rg-text-secondary)' }}>
                          Gerenciamento de login, cadastro e área administrativa em preparação na Sprint 15.
                        </p>
                        {aoAbrirIntro && (
                          <button
                            type="button"
                            className="btn btn-sm rg-btn-secondary w-100"
                            onClick={() => {
                              fecharMenus()
                              aoAbrirIntro()
                            }}
                          >
                            Ver abertura Arcade
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="position-relative">
                    <button
                      type="button"
                      className={`rg-icon-btn rg-cart-btn ${painelAberto === 'carrinho' ? 'is-active' : ''}`}
                      aria-label="Carrinho de compras (0 itens)"
                      aria-expanded={painelAberto === 'carrinho'}
                      onClick={() => alternarPainel('carrinho')}
                    >
                      <IconeCarrinho />
                      <span className="rg-cart-badge">0</span>
                    </button>

                    {painelAberto === 'carrinho' && (
                      <div className="rg-nav-popover" role="dialog" aria-label="Resumo do carrinho">
                        <p className="rg-nav-popover-titulo mb-1">Seu Carrinho (0)</p>
                        <p className="small mb-0" style={{ color: 'var(--rg-text-secondary)' }}>
                          O módulo de carrinho e pedidos será ativado na etapa de compras da Sprint 15.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
        <div className="container rg-footer-conteudo">
          <div className="row gy-4">
            <div className="col-12 col-sm-6 col-lg-4">
              <Link to="/inicio" className="rg-footer-marca">
                <img src={logoRetroGames} alt="RetroGames" />
              </Link>
              <p className="rg-footer-descricao">Jogos que atravessam gerações.</p>
            </div>
            <div className="col-6 col-lg-2">
              <h2 className="rg-footer-titulo">Navegação</h2>
              <Link to="/inicio">Início</Link>
              <Link to="/">Catálogo</Link>
              <Link to="/sobre">Sobre</Link>
              <Link to="/contato">Contato</Link>
            </div>
            <div className="col-6 col-lg-3">
              <h2 className="rg-footer-titulo">Suporte</h2>
              <a href="mailto:suporte@retrogames.local?subject=FAQ">FAQ</a>
              <a href="mailto:suporte@retrogames.local?subject=Privacidade">Política de Privacidade</a>
              <a href="mailto:suporte@retrogames.local?subject=Termos de Uso">Termos de Uso</a>
              <Link to="/contato">Fale Conosco</Link>
            </div>
            <div className="col-12 col-lg-3">
              <h2 className="rg-footer-titulo">Siga a gente!</h2>
              <div className="rg-footer-redes" aria-label="Redes sociais">
                <a href="https://discord.com" aria-label="Discord"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.7 5.2a18 18 0 0 0-4.4-1.4l-.6 1.2a16 16 0 0 0-5.4 0l-.6-1.2a18 18 0 0 0-4.4 1.4C1.5 9.3.8 13.3 1.2 17.2a18 18 0 0 0 5.4 2.7l1.2-2a11 11 0 0 1-1.9-.9l.5-.4a13 13 0 0 0 11.2 0l.5.4a11 11 0 0 1-1.9.9l1.2 2a18 18 0 0 0 5.4-2.7c.5-4.5-.8-8.4-3.1-12ZM8.6 14.8c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg></a>
                <a href="https://instagram.com" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r=".8" className="rg-social-fill"/></svg></a>
                <a href="https://youtube.com" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.4V8.6l5.9 3.4-5.9 3.4Z"/></svg></a>
                <a href="https://x.com" aria-label="X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.8 5.7 22H2.5l7.3-8.4L1.8 2h6.4l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z"/></svg></a>
              </div>
            </div>
          </div>
        </div>
        <div className="rg-footer-base">
          <div className="container rg-footer-base-conteudo">
            <span>© {ANO_ATUAL} RetroGames. Todos os direitos reservados.</span>
            <span className="rg-footer-checker" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </div>
  )
}
