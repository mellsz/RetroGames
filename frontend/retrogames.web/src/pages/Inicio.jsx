import { Link } from 'react-router-dom'
import castelos from '../assets/arcade/05_castelos.png'
import montanhas from '../assets/arcade/04_montanhas_paisagem.png'
import personagem from '../assets/arcade/08_personagem.png'

export function Inicio({ aoAbrirIntro }) {
  return (
    <section className="rg-pagina-enter">
      <div className="rg-hero-inicio mb-4">
        <img src={montanhas} alt="" className="rg-hero-inicio-montanhas" aria-hidden="true" />
        <img src={castelos} alt="" className="rg-hero-inicio-castelo d-none d-md-block" aria-hidden="true" />
        <img src={personagem} alt="" className="rg-hero-inicio-personagem d-none d-lg-block" aria-hidden="true" />

        <div className="position-relative" style={{ zIndex: 2, maxWidth: '580px' }}>
          <p className="small fw-semibold mb-2" style={{ color: 'var(--rg-cyan)' }}>
            JOGOS CLÁSSICOS, NOVAS AVENTURAS
          </p>
          <h1 className="rg-font-pixel mb-3" style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2.2rem)', color: 'var(--rg-yellow)' }}>
            RETROGAMES
          </h1>
          <p className="mb-4" style={{ color: 'var(--rg-text-secondary)' }}>
            A sua loja virtual de jogos retrô usados. Reviva os clássicos, conheça novas histórias e complete sua coleção.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/" className="btn rg-btn-primary">
              Ver catálogo →
            </Link>
            {aoAbrirIntro && (
              <button type="button" className="btn rg-btn-secondary" onClick={aoAbrirIntro}>
                Abrir Intro Arcade
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="rg-detalhe-selo h-100">
            <strong className="d-block mb-1" style={{ color: 'var(--rg-text-primary)' }}>
              Jogos testados
            </strong>
            Cartuchos e mídias verificados antes da disponibilização.
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="rg-detalhe-selo h-100">
            <strong className="d-block mb-1" style={{ color: 'var(--rg-text-primary)' }}>
              Múltiplos consoles
            </strong>
            Títulos selecionados de plataformas 8-bit, 16-bit e clássicos.
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="rg-detalhe-selo h-100">
            <strong className="d-block mb-1" style={{ color: 'var(--rg-text-primary)' }}>
              Estado transparente
            </strong>
            Condição real do item informada claramente no catálogo.
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="rg-detalhe-selo h-100">
            <strong className="d-block mb-1" style={{ color: 'var(--rg-text-primary)' }}>
              Projeto integrador
            </strong>
            Desenvolvido com arquitetura em camadas .NET 10 e React.
          </div>
        </div>
      </div>
    </section>
  )
}
