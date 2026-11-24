export function Paginacao({ paginaAtual, totalPaginas, aoMudarPagina }) {
  if (!totalPaginas || totalPaginas <= 1) {
    return null
  }

  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1)

  return (
    <nav aria-label="Paginação do catálogo" className="mt-4 d-flex justify-content-center">
      <ul className="pagination rg-paginacao mb-0 flex-wrap justify-content-center">
        <li className={`page-item ${paginaAtual <= 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={paginaAtual <= 1}
            onClick={() => aoMudarPagina(paginaAtual - 1)}
          >
            Anterior
          </button>
        </li>

        {paginas.map((numero) => (
          <li key={numero} className={`page-item ${numero === paginaAtual ? 'active' : ''}`}>
            <button
              type="button"
              className="page-link"
              aria-current={numero === paginaAtual ? 'page' : undefined}
              onClick={() => aoMudarPagina(numero)}
            >
              {numero}
            </button>
          </li>
        ))}

        <li className={`page-item ${paginaAtual >= totalPaginas ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => aoMudarPagina(paginaAtual + 1)}
          >
            Próxima
          </button>
        </li>
      </ul>
    </nav>
  )
}
