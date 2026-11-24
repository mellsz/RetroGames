import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { generoApi, jogoApi, plataformaApi } from '../../api/servicos'
import { obterMensagemErro } from '../../api/erros'
import castelosBanner from '../../assets/arcade/05_castelos.png'
import { CardJogo } from '../../components/CardJogo'
import { Carregando, EstadoVazio, MensagemErro } from '../../components/MensagensEstado'
import { Paginacao } from '../../components/Paginacao'

const TAMANHO_PAGINA = 12

export function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()

  const buscaUrl = searchParams.get('busca') ?? ''
  const idPlataformaUrl = searchParams.get('idPlataforma') ?? ''
  const idGeneroUrl = searchParams.get('idGenero') ?? ''
  const paginaBruta = Number(searchParams.get('pagina'))
  const paginaUrl = Number.isInteger(paginaBruta) && paginaBruta > 0 ? paginaBruta : 1

  const [plataformas, setPlataformas] = useState([])
  const [generos, setGeneros] = useState([])

  const [resultado, setResultado] = useState({
    itens: [],
    pagina: 1,
    totalItens: 0,
    totalPaginas: 0,
  })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    async function carregarFiltros() {
      try {
        const [listaPlataformas, listaGeneros] = await Promise.all([
          plataformaApi.listar(),
          generoApi.listar(),
        ])

        if (ativo) {
          setPlataformas(listaPlataformas)
          setGeneros(listaGeneros)
        }
      } catch {
        // Falha silenciosa nos filtros auxiliares; o catálogo principal trata erro de conexão
      }
    }

    carregarFiltros()
    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    let ativo = true

    async function buscarJogos() {
      setCarregando(true)
      setErro(null)

      const filtros = {
        pagina: paginaUrl,
        tamanhoPagina: TAMANHO_PAGINA,
      }

      if (buscaUrl.trim()) {
        filtros.busca = buscaUrl.trim()
      }

      if (idPlataformaUrl) {
        filtros.idPlataforma = Number(idPlataformaUrl)
      }

      if (idGeneroUrl) {
        filtros.idGenero = Number(idGeneroUrl)
      }

      try {
        const dados = await jogoApi.listar(filtros)
        if (ativo) {
          setResultado(dados)
        }
      } catch (error) {
        if (ativo) {
          setErro(obterMensagemErro(error))
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    buscarJogos()
    return () => {
      ativo = false
    }
  }, [buscaUrl, idPlataformaUrl, idGeneroUrl, paginaUrl, tentativa])

  function atualizarParametros(novosValores) {
    const proximo = new URLSearchParams(searchParams)

    Object.entries(novosValores).forEach(([chave, valor]) => {
      if (valor === '' || valor === null || valor === undefined) {
        proximo.delete(chave)
      } else {
        proximo.set(chave, String(valor))
      }
    })

    setSearchParams(proximo)
  }

  function aoSubmeterBusca(evento) {
    evento.preventDefault()
    const dadosFormulario = new FormData(evento.currentTarget)
    const termoDigitado = String(dadosFormulario.get('busca') ?? '').trim()
    atualizarParametros({
      busca: termoDigitado,
      pagina: 1,
    })
  }

  function aoAlterarPlataforma(evento) {
    atualizarParametros({
      idPlataforma: evento.target.value,
      pagina: 1,
    })
  }

  function aoAlterarGenero(evento) {
    atualizarParametros({
      idGenero: evento.target.value,
      pagina: 1,
    })
  }

  function aoMudarPagina(novaPagina) {
    atualizarParametros({
      pagina: novaPagina,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limparFiltros() {
    setSearchParams({})
  }

  const temFiltrosAtivos = Boolean(buscaUrl || idPlataformaUrl || idGeneroUrl)

  return (
    <section className="rg-pagina-enter">
      <div className="rg-catalogo-banner">
        <img src={castelosBanner} alt="" className="rg-catalogo-banner-art d-none d-md-block" aria-hidden="true" />
        <div className="position-relative" style={{ zIndex: 1 }}>
          <p className="small fw-semibold mb-2" style={{ color: 'var(--rg-cyan)' }}>
            JOGOS CLÁSSICOS · CONSOLES RETRÔ
          </p>
          <h1 className="rg-catalogo-titulo mb-2">Catálogo de Jogos</h1>
          <p className="mb-0" style={{ color: 'var(--rg-text-secondary)', maxWidth: '58ch' }}>
            Explore cartuchos e mídias físicas originais para consoles clássicos. Filtre por plataforma, gênero ou nome.
          </p>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <aside className="col-lg-3">
          <div className="rg-filtros-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h6 fw-bold mb-0">Filtrar catálogo</h2>
              {temFiltrosAtivos && (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  onClick={limparFiltros}
                >
                  Limpar
                </button>
              )}
            </div>

            <form onSubmit={aoSubmeterBusca} className="mb-3">
              <label htmlFor="campo-busca" className="form-label small" style={{ color: 'var(--rg-text-secondary)' }}>
                Buscar por nome
              </label>
              <div className="input-group">
                <input
                  key={buscaUrl}
                  id="campo-busca"
                  name="busca"
                  type="search"
                  className="form-control rg-input"
                  placeholder="Ex: Mario, Zelda..."
                  defaultValue={buscaUrl}
                />
                <button type="submit" className="btn rg-btn-primary">
                  Buscar
                </button>
              </div>
            </form>

            <div className="mb-3">
              <label htmlFor="filtro-plataforma" className="form-label small" style={{ color: 'var(--rg-text-secondary)' }}>
                Plataforma
              </label>
              <select
                id="filtro-plataforma"
                className="form-select rg-select"
                value={idPlataformaUrl}
                onChange={aoAlterarPlataforma}
              >
                <option value="">Todas as plataformas</option>
                {plataformas.map((plataforma) => (
                  <option key={plataforma.id} value={plataforma.id}>
                    {plataforma.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filtro-genero" className="form-label small" style={{ color: 'var(--rg-text-secondary)' }}>
                Gênero
              </label>
              <select
                id="filtro-genero"
                className="form-select rg-select"
                value={idGeneroUrl}
                onChange={aoAlterarGenero}
              >
                <option value="">Todos os gêneros</option>
                {generos.map((genero) => (
                  <option key={genero.id} value={genero.id}>
                    {genero.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <div className="col-lg-9">
          {!carregando && !erro && (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <p className="mb-0 small" style={{ color: 'var(--rg-text-secondary)' }}>
                {resultado.totalItens === 1
                  ? 'Encontramos 1 jogo'
                  : `Encontramos ${resultado.totalItens} jogos`}
              </p>
              {resultado.totalPaginas > 1 && (
                <span className="small" style={{ color: 'var(--rg-text-muted)' }}>
                  Página {resultado.pagina} de {resultado.totalPaginas}
                </span>
              )}
            </div>
          )}

          {carregando && <Carregando mensagem="Carregando jogos..." />}

          {!carregando && erro && (
            <MensagemErro
              mensagem={erro}
              aoTentarNovamente={() => setTentativa((valor) => valor + 1)}
            />
          )}

          {!carregando && !erro && resultado.itens.length === 0 && (
            <EstadoVazio
              titulo="Nenhum jogo encontrado."
              descricao={
                temFiltrosAtivos
                  ? 'Nenhum título corresponde aos filtros selecionados.'
                  : 'Ainda não há jogos ativos disponíveis no catálogo.'
              }
              acao={
                temFiltrosAtivos ? (
                  <button type="button" className="btn rg-btn-primary" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                ) : null
              }
            />
          )}

          {!carregando && !erro && resultado.itens.length > 0 && (
            <>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                {resultado.itens.map((jogo) => (
                  <div key={jogo.id} className="col">
                    <CardJogo jogo={jogo} />
                  </div>
                ))}
              </div>

              <Paginacao
                paginaAtual={resultado.pagina}
                totalPaginas={resultado.totalPaginas}
                aoMudarPagina={aoMudarPagina}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
