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
  titulo = 'Nenhum jogo encontrado.',
  descricao = 'Tente buscar outro título ou remover parte dos filtros.',
  acao,
}) {
  return (
    <div className="rg-estado-box my-4">
      <div className="mb-3" aria-hidden="true">
        <svg width="56" height="40" viewBox="0 0 28 20" fill="none">
          <rect x="4" y="4" width="20" height="14" rx="2" fill="#1e1248" stroke="#6d28d9" strokeWidth="2" />
          <rect x="9" y="9" width="2" height="2" fill="#a78bfa" />
          <rect x="17" y="9" width="2" height="2" fill="#a78bfa" />
          <rect x="11" y="13" width="6" height="1.5" fill="#d946ef" />
        </svg>
      </div>
      <h2 className="h5 mb-2">{titulo}</h2>
      <p className="mb-3" style={{ color: 'var(--rg-text-secondary)' }}>
        {descricao}
      </p>
      {acao}
    </div>
  )
}
