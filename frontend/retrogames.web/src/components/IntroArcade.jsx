import { useEffect, useState } from 'react'
import ceuEstrelas from '../assets/arcade/01_ceu_estrelas.png'
import lua from '../assets/arcade/02_lua.png'
import nuvens from '../assets/arcade/03_nuvens.png'
import montanhas from '../assets/arcade/04_montanhas_paisagem.png'
import castelos from '../assets/arcade/05_castelos.png'
import aguaReflexos from '../assets/arcade/06_agua_reflexos.png'
import plataforma from '../assets/arcade/07_plataforma.png'
import personagem from '../assets/arcade/08_personagem.png'
import estrela01 from '../assets/arcade/estrela_01.png'
import estrela02 from '../assets/arcade/estrela_02.png'
import estrela03 from '../assets/arcade/estrela_03.png'
import estrela04 from '../assets/arcade/estrela_04.png'

export function IntroArcade({ aoEntrar }) {
  const [saindo, setSaindo] = useState(false)
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 })

  function iniciarEntrada() {
    if (saindo) return
    setSaindo(true)
    window.setTimeout(() => {
      aoEntrar()
    }, 300)
  }

  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === 'Enter' || evento.key === ' ' || evento.key === 'Escape') {
        evento.preventDefault()
        if (saindo) return
        setSaindo(true)
        window.setTimeout(() => {
          aoEntrar()
        }, 300)
      }
    }

    window.addEventListener('keydown', aoPressionarTecla)
    return () => window.removeEventListener('keydown', aoPressionarTecla)
  }, [saindo, aoEntrar])

  function aoMoverMouse(evento) {
    const x = (evento.clientX / window.innerWidth - 0.5) * 18
    const y = (evento.clientY / window.innerHeight - 0.5) * 12
    setDeslocamento({ x, y })
  }

  return (
    <section
      className={`rg-intro-overlay ${saindo ? 'rg-intro-overlay--saindo' : ''}`}
      aria-label="Abertura arcade RetroGames"
      onMouseMove={aoMoverMouse}
    >
      <div className="rg-intro-cena" aria-hidden="true">
        <img
          src={ceuEstrelas}
          alt=""
          className="rg-intro-camada rg-intro-ceu"
          style={{ transform: `translate(${-deslocamento.x * 0.2}px, ${-deslocamento.y * 0.2}px)` }}
        />

        <img src={estrela01} alt="" className="rg-intro-estrela" style={{ top: '14%', left: '12%', animationDelay: '0s' }} />
        <img src={estrela02} alt="" className="rg-intro-estrela" style={{ top: '20%', left: '34%', animationDelay: '0.6s' }} />
        <img src={estrela03} alt="" className="rg-intro-estrela" style={{ top: '11%', left: '58%', animationDelay: '1.1s' }} />
        <img src={estrela04} alt="" className="rg-intro-estrela" style={{ top: '24%', right: '26%', animationDelay: '1.7s' }} />

        <img
          src={lua}
          alt=""
          className="rg-intro-camada rg-intro-lua"
          style={{ transform: `translate(${-deslocamento.x * 0.35}px, ${-deslocamento.y * 0.35}px)` }}
        />

        <img src={nuvens} alt="" className="rg-intro-camada rg-intro-nuvens" />

        <img
          src={montanhas}
          alt=""
          className="rg-intro-camada rg-intro-montanhas"
          style={{ transform: `translate(${-deslocamento.x * 0.5}px, ${-deslocamento.y * 0.3}px)` }}
        />

        <img
          src={castelos}
          alt=""
          className="rg-intro-camada rg-intro-castelos"
          style={{ transform: `translate(${-deslocamento.x * 0.65}px, ${-deslocamento.y * 0.4}px)` }}
        />

        <img src={aguaReflexos} alt="" className="rg-intro-camada rg-intro-agua" />

        <img
          src={plataforma}
          alt=""
          className="rg-intro-camada rg-intro-plataforma"
          style={{ transform: `translate(${-deslocamento.x * 0.85}px, 0px)` }}
        />

        <img
          src={personagem}
          alt=""
          className="rg-intro-camada rg-intro-personagem"
          style={{ transform: `translate(${-deslocamento.x * 0.85}px, 0px)` }}
        />

        <div className="rg-intro-scanlines" />
      </div>

      <div className="rg-intro-conteudo">
        <p className="rg-intro-sub">ORIGINAL ARCADE EXPERIENCE</p>
        <h1 className="rg-intro-logo">RETROGAMES</h1>
        <p className="rg-intro-coin">INSERT COIN</p>

        <button
          type="button"
          className="rg-intro-start-btn"
          onClick={iniciarEntrada}
        >
          ▶ PRESS START · VER CATÁLOGO
        </button>

        <div className="rg-intro-badges">
          <span className="rg-intro-badge rg-intro-badge--yellow">PLAYER 01</span>
          <span className="rg-intro-badge rg-intro-badge--cyan">8-BIT · 16-BIT</span>
        </div>
      </div>
    </section>
  )
}
