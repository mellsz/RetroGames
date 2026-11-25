import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { generoApi, jogoApi, plataformaApi } from '../../api/servicos'
import { obterMensagemErro } from '../../api/erros'
import bannerCatalogoTv from '../../assets/arcade/banner-catalogo-tv.png'
import bannerCatalogoTvDesligada from '../../assets/arcade/banner-catalogo-tv-desligada.png'
import { CardJogo } from '../../components/CardJogo'
import { Carregando, EstadoVazio, MensagemErro } from '../../components/MensagensEstado'
import { Paginacao } from '../../components/Paginacao'

const TAMANHO_PAGINA = 12
const TAMANHO_LOTE_API = 50
const ORDENACOES = [
  { valor: 'recentes', nome: 'Mais recentes' },
  { valor: 'menor-preco', nome: 'Menor preço' },
  { valor: 'maior-preco', nome: 'Maior preço' },
  { valor: 'nome', nome: 'Nome: A a Z' },
]

function IconeControle() {
  return (
    <svg
      className="rg-icone-controle"
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M467.51 248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5 91.5 0 0 0 352 96c-26.89 0-48.11 16-96 16s-69.15-16-96-16a99 99 0 0 0-27.2 3.66C89 112.59 61.94 165.7 43.33 248.83c-19 84.91-15.56 152 21.58 164.88 26 9 49.25-9.61 71.27-37 25-31.2 55.79-40.8 119.82-40.8s93.62 9.6 118.66 40.8c22 27.41 46.11 45.79 71.42 37.16 41.02-14.01 40.44-79.13 21.43-165.04Z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" />
      <circle cx="292" cy="224" r="20" />
      <path d="M336 288a20 20 0 1 1 20-19.95A20 20 0 0 1 336 288" />
      <circle cx="336" cy="180" r="20" />
      <circle cx="380" cy="224" r="20" />
      <path d="M160 176v96M208 224h-96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
    </svg>
  )
}

function IconeCatalogo({ nome }) {
  const propriedades = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
  }

  const icones = {
    filtros: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 4v4M15 10v4M10 16v4" /></>,
    limpar: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /></>,
    busca: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    genero: <><path d="M20.6 13.2 12.8 21a2 2 0 0 1-2.8 0L3 14V4h10l7.6 6.8a1.7 1.7 0 0 1 0 2.4Z" fill="currentColor" /><circle cx="7.5" cy="8" r="1.2" fill="#160b25" stroke="#160b25" /></>,
    preco: <><path d="M4.5 6c0-1.4 3.4-2.5 7.5-2.5s7.5 1.1 7.5 2.5-3.4 2.5-7.5 2.5S4.5 7.4 4.5 6Z" fill="currentColor" /><path d="M4.5 6v3.2c0 1.4 3.4 2.5 7.5 2.5 4.1 0 7.5-1.1 7.5-2.5V6M4.5 9.2v3.2c0 1.4 3.4 2.5 7.5 2.5 1.5 0 2.9-.2 4.1-.5M4.5 12.4v3.2c0 1.4 3.4 2.5 7.5 2.5 1.4 0 2.7-.2 3.8-.5" /></>,
  }

  return <svg {...propriedades}>{icones[nome]}</svg>
}

export function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filtrosRef = useRef(null)
  const ordenacaoRef = useRef(null)

  useEffect(() => {
    function fecharSeletoresFora(evento) {
      if (!filtrosRef.current?.contains(evento.target)) {
        filtrosRef.current?.querySelectorAll('details[open]').forEach((seletor) => {
          seletor.removeAttribute('open')
        })
      }

      if (!ordenacaoRef.current?.contains(evento.target)) {
        ordenacaoRef.current?.removeAttribute('open')
      }
    }

    function fecharSeletoresComEsc(evento) {
      if (evento.key === 'Escape') {
        filtrosRef.current?.querySelectorAll('details[open]').forEach((seletor) => {
          seletor.removeAttribute('open')
        })
        ordenacaoRef.current?.removeAttribute('open')
      }
    }

    document.addEventListener('pointerdown', fecharSeletoresFora)
    document.addEventListener('keydown', fecharSeletoresComEsc)
    return () => {
      document.removeEventListener('pointerdown', fecharSeletoresFora)
      document.removeEventListener('keydown', fecharSeletoresComEsc)
    }
  }, [])

  const buscaUrl = searchParams.get('busca') ?? ''
  const idPlataformaUrl = searchParams.get('idPlataforma') ?? ''
  const idGeneroUrl = searchParams.get('idGenero') ?? ''
  const ordenarPorBruto = searchParams.get('ordenarPor')
  const ordenarPorUrl = ORDENACOES.some((opcao) => opcao.valor === ordenarPorBruto)
    ? ordenarPorBruto
    : 'recentes'
  const nomeOrdenacao = ORDENACOES.find((opcao) => opcao.valor === ordenarPorUrl).nome
  const precoMaximoParametro = searchParams.has('precoMaximo')
    ? Number(searchParams.get('precoMaximo'))
    : null
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
        pagina: 1,
        tamanhoPagina: TAMANHO_LOTE_API,
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
        const primeiroLote = await jogoApi.listar(filtros)
        const todosOsJogos = [...primeiroLote.itens]

        for (let pagina = 2; pagina <= primeiroLote.totalPaginas; pagina += 1) {
          const proximoLote = await jogoApi.listar({ ...filtros, pagina })
          todosOsJogos.push(...proximoLote.itens)
        }

        if (ativo) {
          setResultado({
            itens: todosOsJogos,
            pagina: 1,
            totalItens: todosOsJogos.length,
            totalPaginas: Math.ceil(todosOsJogos.length / TAMANHO_PAGINA),
          })
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
  }, [buscaUrl, idPlataformaUrl, idGeneroUrl, tentativa])

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

  function selecionarOpcao(evento, atualizar, valor) {
    atualizar({ target: { value: valor } })
    evento.currentTarget.closest('details')?.removeAttribute('open')
  }

  function aoAlterarPreco(evento) {
    atualizarParametros({ precoMaximo: evento.target.value, pagina: 1 })
  }

  function aoAlterarOrdenacao(valor) {
    atualizarParametros({ ordenarPor: valor === 'recentes' ? null : valor, pagina: 1 })
    ordenacaoRef.current?.removeAttribute('open')
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

  const maiorPrecoCadastrado = resultado.itens.length > 0
    ? Math.ceil(Math.max(...resultado.itens.map((jogo) => jogo.preco)) / 10) * 10
    : 300
  const precoMaximoUrl = Number.isFinite(precoMaximoParametro)
    ? precoMaximoParametro
    : maiorPrecoCadastrado
  const jogosFiltrados = resultado.itens
    .filter((jogo) => jogo.preco <= precoMaximoUrl)
  const totalPaginasCatalogo = Math.ceil(jogosFiltrados.length / TAMANHO_PAGINA)
  const paginaCatalogo = Math.min(paginaUrl, Math.max(totalPaginasCatalogo, 1))
  const inicioPagina = (paginaCatalogo - 1) * TAMANHO_PAGINA
  const jogosVisiveis = jogosFiltrados
    .slice(inicioPagina, inicioPagina + TAMANHO_PAGINA)
    .sort((jogoA, jogoB) => {
      if (ordenarPorUrl === 'menor-preco') return jogoA.preco - jogoB.preco
      if (ordenarPorUrl === 'maior-preco') return jogoB.preco - jogoA.preco
      if (ordenarPorUrl === 'nome') return jogoA.nome.localeCompare(jogoB.nome, 'pt-BR')
      return jogoB.anoLancamento - jogoA.anoLancamento
    })
  const temFiltrosAtivos = Boolean(
    buscaUrl || idPlataformaUrl || idGeneroUrl || searchParams.has('precoMaximo') || searchParams.has('ordenarPor'),
  )

  useEffect(() => {
    if (!carregando && paginaUrl !== paginaCatalogo) {
      const parametrosCorrigidos = new URLSearchParams(searchParams)
      parametrosCorrigidos.set('pagina', String(paginaCatalogo))
      setSearchParams(parametrosCorrigidos)
    }
  }, [carregando, paginaUrl, paginaCatalogo, searchParams, setSearchParams])

  return (
    <section className="rg-pagina-enter rg-pagina-catalogo">
      <div className="rg-catalogo-banner">
        <img src={bannerCatalogoTvDesligada} alt="" className="rg-catalogo-banner-art" aria-hidden="true" />
        <img src={bannerCatalogoTv} alt="" className="rg-catalogo-banner-art rg-catalogo-banner-art--acesa" aria-hidden="true" />
        <span className="rg-catalogo-banner-pixels" aria-hidden="true" />
        <div className="rg-catalogo-banner-conteudo">
          <p className="rg-catalogo-banner-chamada">Catálogo de jogos retrô</p>
          <h1 className="rg-catalogo-titulo mb-2">Reviva os clássicos</h1>
          <p className="rg-catalogo-banner-descricao mb-0">
            Jogue os maiores clássicos dos videogames com a qualidade que você merece.
          </p>
        </div>
      </div>

      <div className="row g-4 align-items-start rg-catalogo-lista">
        <aside className="col-lg-3 rg-catalogo-filtros-col">
          <div className="rg-filtros-card" ref={filtrosRef}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h6 fw-bold mb-0 rg-filtros-titulo"><IconeCatalogo nome="filtros" />Filtros</h2>
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none rg-filtros-limpar"
                onClick={limparFiltros}
              >
                <IconeCatalogo nome="limpar" />
                Limpar filtros
              </button>
            </div>

            <form onSubmit={aoSubmeterBusca} className="mb-3">
              <label htmlFor="campo-busca" className="form-label small rg-filtro-label">
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
                <button type="submit" className="btn rg-filtros-buscar" aria-label="Buscar jogos" title="Buscar jogos">
                  <IconeCatalogo nome="busca" />
                </button>
              </div>
            </form>

            <div className="mb-3">
              <label htmlFor="filtro-plataforma" className="form-label small rg-filtro-label">
                <IconeControle />
                Plataforma
              </label>
              <details className="rg-seletor-personalizado">
                <summary id="filtro-plataforma" aria-label="Selecionar plataforma">
                  <span>{plataformas.find((plataforma) => String(plataforma.id) === idPlataformaUrl)?.nome ?? 'Todas as plataformas'}</span>
                  <span className="rg-seletor-seta" aria-hidden="true" />
                </summary>
                <div className="rg-seletor-opcoes" role="listbox" aria-label="Plataformas">
                  <button type="button" role="option" aria-selected={!idPlataformaUrl} onClick={(evento) => selecionarOpcao(evento, aoAlterarPlataforma, '')}>Todas as plataformas</button>
                  {plataformas.map((plataforma) => (
                    <button key={plataforma.id} type="button" role="option" aria-selected={idPlataformaUrl === String(plataforma.id)} onClick={(evento) => selecionarOpcao(evento, aoAlterarPlataforma, String(plataforma.id))}>{plataforma.nome}</button>
                  ))}
                </div>
              </details>
            </div>

            <div>
              <label htmlFor="filtro-genero" className="form-label small rg-filtro-label">
                <IconeCatalogo nome="genero" />
                Gênero
              </label>
              <details className="rg-seletor-personalizado">
                <summary id="filtro-genero" aria-label="Selecionar gênero">
                  <span>{generos.find((genero) => String(genero.id) === idGeneroUrl)?.nome ?? 'Todos os gêneros'}</span>
                  <span className="rg-seletor-seta" aria-hidden="true" />
                </summary>
                <div className="rg-seletor-opcoes" role="listbox" aria-label="Gêneros">
                  <button type="button" role="option" aria-selected={!idGeneroUrl} onClick={(evento) => selecionarOpcao(evento, aoAlterarGenero, '')}>Todos os gêneros</button>
                  {generos.map((genero) => (
                    <button key={genero.id} type="button" role="option" aria-selected={idGeneroUrl === String(genero.id)} onClick={(evento) => selecionarOpcao(evento, aoAlterarGenero, String(genero.id))}>{genero.nome}</button>
                  ))}
                </div>
              </details>
            </div>

            <div className="rg-filtro-preco">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label htmlFor="filtro-preco" className="form-label small mb-0 rg-filtro-label rg-filtro-label--preco">
                  <span className="rg-icone-moeda" aria-hidden="true" />
                  Preço máximo
                </label>
                <span className="rg-preco-filtro-valor">R$ {precoMaximoUrl}</span>
              </div>
              <input
                id="filtro-preco"
                className="rg-range-preco"
                type="range"
                min="0"
                step="10"
                max={maiorPrecoCadastrado}
                value={precoMaximoUrl}
                onChange={aoAlterarPreco}
                aria-label="Preço máximo em reais"
              />
              <div className="d-flex justify-content-between rg-range-limites">
                <span>R$ 0</span><span>R$ {maiorPrecoCadastrado}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="col-lg-9 rg-catalogo-jogos-col">
          {!carregando && !erro && (
            <div className="rg-catalogo-toolbar mb-3">
              <p className="rg-catalogo-contagem mb-0 small">
                <span>{jogosVisiveis.length === 1
                  ? 'Encontramos 1 jogo nesta página'
                  : `Encontramos ${jogosVisiveis.length} jogos nesta página`}</span>
              </p>
              <div className="rg-catalogo-toolbar-acoes">
                {totalPaginasCatalogo > 1 && (
                  <span className="rg-pagina-atual">
                    Página {paginaCatalogo} de {totalPaginasCatalogo}
                  </span>
                )}
                <details className="rg-ordenacao" ref={ordenacaoRef}>
                  <summary aria-label={`Ordenação: ${nomeOrdenacao}`}>
                    <span>Ordenar por</span>
                    <strong>{nomeOrdenacao}</strong>
                    <span className="rg-seletor-seta" aria-hidden="true" />
                  </summary>
                  <div className="rg-ordenacao-opcoes" role="listbox" aria-label="Ordenar jogos">
                    {ORDENACOES.map((opcao) => (
                      <button
                        key={opcao.valor}
                        type="button"
                        role="option"
                        aria-selected={ordenarPorUrl === opcao.valor}
                        onClick={() => aoAlterarOrdenacao(opcao.valor)}
                      >
                        {opcao.nome}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          )}

          {carregando && <Carregando mensagem="Carregando jogos..." />}

          {!carregando && erro && (
            <MensagemErro
              mensagem={erro}
              aoTentarNovamente={() => setTentativa((valor) => valor + 1)}
            />
          )}

          {!carregando && !erro && jogosVisiveis.length === 0 && (
            <EstadoVazio
              titulo="Ops! Nenhum jogo encontrado."
              descricao="Que tal explorar nosso catálogo novamente?"
              acao={
                temFiltrosAtivos ? (
                  <button type="button" className="btn rg-btn-primary" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                ) : (
                  <button type="button" className="btn rg-btn-primary" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                )
              }
            />
          )}

          {!carregando && !erro && jogosVisiveis.length > 0 && (
            <>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                {jogosVisiveis.map((jogo) => (
                  <div key={jogo.id} className="col">
                    <CardJogo jogo={jogo} />
                  </div>
                ))}
              </div>

              <Paginacao
                paginaAtual={paginaCatalogo}
                totalPaginas={totalPaginasCatalogo}
                aoMudarPagina={aoMudarPagina}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
