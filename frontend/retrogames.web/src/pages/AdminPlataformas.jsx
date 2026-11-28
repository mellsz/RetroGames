import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'
import { jogoApi, plataformaApi } from '../api/servicos'
import iconeAdicionar from '../assets/admin-icons/add-outline.svg'
import iconeCasa from '../assets/admin-icons/home-outline.svg'
import iconePincel from '../assets/admin-icons/pencil-outline.svg'
import iconeLixeira from '../assets/admin-icons/trash-outline.svg'

const FORMULARIO_INICIAL = { nome: '', fabricante: '', anoLancamento: '' }
const TAMANHO_PAGINA = 6

function ErroCampo({ erros, nome }) {
  return erros[nome]?.[0] ? <small className="rg-form-erro">{erros[nome][0]}</small> : null
}

export function AdminPlataformas() {
  const [plataformas, setPlataformas] = useState([])
  const [jogos, setJogos] = useState([])
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [idEdicao, setIdEdicao] = useState(null)
  const [formularioAberto, setFormularioAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [listaPlataformas, primeiraPagina] = await Promise.all([
        plataformaApi.listar(),
        jogoApi.listar({ incluirInativos: true, pagina: 1, tamanhoPagina: 50 }),
      ])
      const paginasRestantes = Array.from({ length: Math.max(0, primeiraPagina.totalPaginas - 1) }, (_, indice) =>
        jogoApi.listar({ incluirInativos: true, pagina: indice + 2, tamanhoPagina: 50 }))
      const paginas = await Promise.all(paginasRestantes)
      setPlataformas(listaPlataformas)
      setJogos([primeiraPagina, ...paginas].flatMap((paginaAtual) => paginaAtual.itens))
    } catch (error) {
      setErro(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const quantidadePorPlataforma = useMemo(() => jogos.reduce((quantidades, jogo) => {
    const nome = jogo.nomePlataforma?.toLowerCase()
    if (nome) quantidades[nome] = (quantidades[nome] ?? 0) + 1
    return quantidades
  }, {}), [jogos])

  const plataformasFiltradas = plataformas.filter((plataforma) => {
    const termo = busca.trim().toLowerCase()
    return !termo || `${plataforma.nome} ${plataforma.fabricante}`.toLowerCase().includes(termo)
  })
  const totalPaginas = Math.max(1, Math.ceil(plataformasFiltradas.length / TAMANHO_PAGINA))
  const plataformasPagina = plataformasFiltradas.slice((pagina - 1) * TAMANHO_PAGINA, pagina * TAMANHO_PAGINA)
  const primeiroItem = plataformasFiltradas.length === 0 ? 0 : (pagina - 1) * TAMANHO_PAGINA + 1
  const ultimoItem = Math.min(pagina * TAMANHO_PAGINA, plataformasFiltradas.length)

  function atualizarCampo(evento) {
    setFormulario((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function abrirNovo() {
    setFormulario(FORMULARIO_INICIAL)
    setIdEdicao(null)
    setErrosCampos({})
    setErro('')
    setSucesso('')
    setFormularioAberto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setFormulario(FORMULARIO_INICIAL)
    setIdEdicao(null)
    setErrosCampos({})
    setFormularioAberto(false)
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setSucesso('')
    setErrosCampos({})
    setEnviando(true)
    const dados = { ...formulario, anoLancamento: Number(formulario.anoLancamento) }
    try {
      if (idEdicao) {
        await plataformaApi.alterar(idEdicao, dados)
        setSucesso('Plataforma atualizada com sucesso.')
      } else {
        await plataformaApi.inserir(dados)
        setSucesso('Plataforma cadastrada com sucesso.')
      }
      cancelarEdicao()
      await carregar()
    } catch (error) {
      setErrosCampos(obterErrosDosCampos(error))
      setErro(obterMensagemErro(error))
    } finally {
      setEnviando(false)
    }
  }

  function editar(plataforma) {
    setIdEdicao(plataforma.id)
    setFormulario({ nome: plataforma.nome, fabricante: plataforma.fabricante, anoLancamento: String(plataforma.anoLancamento) })
    setErro('')
    setSucesso('')
    setErrosCampos({})
    setFormularioAberto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluir(plataforma) {
    if (!window.confirm(`Excluir a plataforma ${plataforma.nome}?`)) return
    setErro('')
    setSucesso('')
    try {
      await plataformaApi.excluir(plataforma.id)
      setSucesso('Plataforma excluída com sucesso.')
      await carregar()
    } catch (error) {
      setErro(obterMensagemErro(error))
    }
  }

  return (
    <section className="rg-admin-plataformas-page rg-pagina-enter">
      <nav className="rg-admin-jogos-breadcrumb" aria-label="Caminho de navegação">
        <Link className="rg-admin-jogos-casa" to="/admin" aria-label="Voltar ao painel administrativo"><img src={iconeCasa} alt="" aria-hidden="true" /></Link>
        <Link className="rg-admin-jogos-breadcrumb-link" to="/admin">Administração</Link>
        <b aria-hidden="true">›</b>
        <strong>Plataformas</strong>
      </nav>
      <header className="rg-admin-plataformas-cabecalho">
        <div><h1>Gestão de plataformas</h1><p>Gerencie as plataformas disponíveis no catálogo da RetroGames.</p></div>
        <button type="button" className="rg-admin-plataformas-adicionar" onClick={abrirNovo}><img src={iconeAdicionar} alt="" aria-hidden="true" />Adicionar plataforma</button>
      </header>

      {formularioAberto && <form className="rg-admin-plataformas-form" onSubmit={enviar} noValidate>
        <div className="rg-admin-plataformas-form-titulo"><h2>{idEdicao ? 'Editar plataforma' : 'Nova plataforma'}</h2><button type="button" onClick={cancelarEdicao}>×</button></div>
        <div className="rg-admin-plataformas-form-grid">
          <div><label htmlFor="plataforma-nome">Nome da plataforma <em>*</em></label><input id="plataforma-nome" name="nome" value={formulario.nome} onChange={atualizarCampo} /><ErroCampo erros={errosCampos} nome="nome" /></div>
          <div><label htmlFor="plataforma-fabricante">Fabricante <em>*</em></label><input id="plataforma-fabricante" name="fabricante" value={formulario.fabricante} onChange={atualizarCampo} /><ErroCampo erros={errosCampos} nome="fabricante" /></div>
          <div><label htmlFor="plataforma-ano">Ano de lançamento <em>*</em></label><input id="plataforma-ano" name="anoLancamento" type="number" value={formulario.anoLancamento} onChange={atualizarCampo} /><ErroCampo erros={errosCampos} nome="anoLancamento" /></div>
        </div>
        <div className="rg-admin-plataformas-form-acoes"><button type="button" className="rg-btn-secondary" onClick={cancelarEdicao}>Cancelar</button><button className="rg-admin-plataformas-salvar" disabled={enviando}>{enviando ? 'Salvando...' : idEdicao ? 'Salvar alterações' : 'Cadastrar plataforma'}</button></div>
      </form>}

      {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
      {sucesso && <p className="rg-form-sucesso" role="status">{sucesso}</p>}
      <label className="rg-admin-plataformas-busca"><span aria-hidden="true">⌕</span><input value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1) }} placeholder="Buscar plataformas..." /></label>
      {carregando && <p className="rg-admin-jogos-estado">Carregando plataformas...</p>}
      {!carregando && plataformasFiltradas.length === 0 && <p className="rg-admin-jogos-estado">Nenhuma plataforma encontrada.</p>}
      {!carregando && plataformasFiltradas.length > 0 && <div className="rg-admin-plataformas-tabela-wrap"><table className="rg-admin-plataformas-tabela"><thead><tr><th>Plataforma</th><th>Fabricante</th><th>Ano</th><th>Jogos</th><th>Status</th><th>Ações</th></tr></thead><tbody>{plataformasPagina.map((plataforma) => { const quantidade = quantidadePorPlataforma[plataforma.nome.toLowerCase()] ?? 0; return <tr key={plataforma.id}><td><strong>{plataforma.nome}</strong></td><td>{plataforma.fabricante}</td><td>{plataforma.anoLancamento}</td><td>{quantidade}</td><td><span className="rg-admin-plataformas-status"><i aria-hidden="true" />Ativa</span></td><td><div className="rg-admin-plataformas-acoes"><button type="button" title={`Editar ${plataforma.nome}`} aria-label={`Editar ${plataforma.nome}`} onClick={() => editar(plataforma)}><img src={iconePincel} alt="" aria-hidden="true" /></button><button type="button" title={`Excluir ${plataforma.nome}`} aria-label={`Excluir ${plataforma.nome}`} onClick={() => excluir(plataforma)}><img src={iconeLixeira} alt="" aria-hidden="true" /></button></div></td></tr> })}</tbody></table></div>}
      {!carregando && plataformasFiltradas.length > 0 && <div className="rg-admin-plataformas-rodape"><span>Mostrando {primeiroItem}–{ultimoItem} de {plataformasFiltradas.length} plataformas</span>{totalPaginas > 1 && <div className="rg-admin-plataformas-paginacao"><button type="button" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina((atual) => atual - 1)}>‹</button>{Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => <button type="button" className={numero === pagina ? 'ativo' : ''} key={numero} onClick={() => setPagina(numero)}>{numero}</button>)}<button type="button" aria-label="Próxima página" disabled={pagina >= totalPaginas} onClick={() => setPagina((atual) => atual + 1)}>›</button></div>}</div>}
    </section>
  )
}
