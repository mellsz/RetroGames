import gatoEstadoVazio from '../assets/gato-estado-vazio.png'

export function Carregando({ mensagem = 'Carregando jogos...' }) {
  return (
    <div className="rg-estado-box my-4" role="status" aria-live="polite">
      <div className="mb-3" aria-hidden="true">
        <svg width="48" height="32" viewBox="0 0 24 16" fill="none">
          <rect x="2" y="4" width="20" height="10" rx="3" fill="#8b5cf6" />
          <rect x="5" y="7" width="4" height="2" fill="#0d0820" />
          <rect x="6" y="6" width="2" height="4" fill="#0d0820" />
          <rect x="15" y="7" width="2" height="2" fill="#fbbf24" />
          <rect x="18" y="8" width="2" height="2" fill="#22d3ee" />
        </svg>
      </div>
      <p className="mb-1 fw-semibold fs-5">{mensagem}</p>
      <p className="rg-font-pixel mb-0" style={{ fontSize: '0.62rem', color: 'var(--rg-cyan)' }}>
        INSERT COIN · LOADING
      </p>
      <div className="rg-progress-track" aria-hidden="true">
        <div className="rg-progress-bar" />
      </div>
      <div className="row g-3 mt-4 d-none d-md-flex" aria-hidden="true">
        <div className="col-3"><div className="rg-skeleton-card" /></div>
        <div className="col-3"><div className="rg-skeleton-card" /></div>
        <div className="col-3"><div className="rg-skeleton-card" /></div>
        <div className="col-3"><div className="rg-skeleton-card" /></div>
      </div>
    </div>
  )
}

export function MensagemErro({ mensagem, aoTentarNovamente }) {
  return (
    <div className="rg-estado-erro my-4" role="alert">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <p className="rg-font-pixel mb-2" style={{ fontSize: '0.7rem', color: 'var(--rg-error)' }}>
            GAME OVER · FALHA NA REQUISIÇÃO
          </p>
          <p className="mb-0">{mensagem}</p>
        </div>
        {aoTentarNovamente && (
          <button
            type="button"
            className="btn rg-btn-primary align-self-start align-self-md-center"
            onClick={aoTentarNovamente}
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}

export function EstadoVazio({
  titulo = 'Ops! Nenhum jogo encontrado.',
  descricao = 'Que tal explorar nosso catálogo novamente?',
  acao,
}) {
  return (
    <div className="rg-estado-vazio my-4">
      <div className="rg-gatinho-vazio" aria-hidden="true">
        <img src={gatoEstadoVazio} alt="" />
      </div>
      <h2 className="rg-vazio-titulo">{titulo}</h2>
      <p className="rg-vazio-descricao">
        {descricao}
      </p>
      {acao}
    </div>
  )
}
