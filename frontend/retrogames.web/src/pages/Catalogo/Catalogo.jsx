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
    <section className="rg-pagina-enter">
      <div className="rg-catalogo-banner">
        <img src={bannerCatalogoTvDesligada} alt="" className="rg-catalogo-banner-art" aria-hidden="true" />
        <img src={bannerCatalogoTv} alt="" className="rg-catalogo-banner-art rg-catalogo-banner-art--acesa" aria-hidden="true" />
        <div className="rg-catalogo-banner-conteudo">
          <p className="rg-catalogo-banner-chamada">Clássicos para jogar e colecionar</p>
          <h1 className="rg-catalogo-titulo mb-2">Catálogo de jogos</h1>
          <p className="rg-catalogo-banner-descricao mb-0">
            Encontre seu próximo clássico por plataforma, gênero ou faixa de preço.
          </p>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <aside className="col-lg-3">
          <div className="rg-filtros-card" ref={filtrosRef}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h6 fw-bold mb-0">Filtros</h2>
              {temFiltrosAtivos && (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  onClick={limparFiltros}
                >
                  Limpar tudo
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
              <label htmlFor="filtro-genero" className="form-label small" style={{ color: 'var(--rg-text-secondary)' }}>
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
                <label htmlFor="filtro-preco" className="form-label small mb-0">Preço máximo</label>
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

        <div className="col-lg-9">
          {!carregando && !erro && (
            <div className="rg-catalogo-toolbar mb-3">
              <p className="rg-catalogo-contagem mb-0 small">
                {jogosVisiveis.length === 1
                  ? 'Encontramos 1 jogo nesta página'
                  : `Encontramos ${jogosVisiveis.length} jogos nesta página`}
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
