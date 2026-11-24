import { Link } from 'react-router-dom'

export function Contato() {
  return (
    <section className="rg-detalhe-card rg-pagina-enter">
      <p className="small fw-semibold mb-2" style={{ color: 'var(--rg-cyan)' }}>
        ATENDIMENTO AO JOGADOR
      </p>
      <h1 className="h3 fw-bold mb-3">Contato</h1>
      <p className="rg-detalhe-descricao mb-4">
        Tem dúvidas sobre o estado de conservação de algum cartucho ou disponibilidade de títulos clássicos? Confira os canais de atendimento da loja:
      </p>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="rg-detalhe-selo">
            <strong className="d-block mb-1" style={{ color: 'var(--rg-text-primary)' }}>
              E-mail de suporte
            </strong>
            atendimento@retrogames.local
          </div>
        </div>
        <div className="col-md-6">
          <div className="rg-detalhe-selo">
            <strong className="d-block mb-1" style={{ color: 'var(--rg-text-primary)' }}>
              Horário de atendimento
            </strong>
            Segunda a sexta, das 9h às 18h
          </div>
        </div>
      </div>

      <Link to="/" className="btn rg-btn-secondary">
        Voltar ao catálogo
      </Link>
    </section>
  )
}
