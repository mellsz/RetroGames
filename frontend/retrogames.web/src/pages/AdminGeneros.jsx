import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'
import { generoApi } from '../api/servicos'
import iconeAdicionar from '../assets/admin-icons/add-outline.svg'
import iconeCasa from '../assets/admin-icons/home-outline.svg'
import iconePincel from '../assets/admin-icons/pencil-outline.svg'
import iconeLixeira from '../assets/admin-icons/trash-outline.svg'

const TAMANHO_PAGINA = 6

function ErroCampo({ erros, nome }) {
  return erros[nome]?.[0] ? <small className="rg-form-erro">{erros[nome][0]}</small> : null
}

export function AdminGeneros() {
  const [generos, setGeneros] = useState([])
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [nome, setNome] = useState('')
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
      setGeneros(await generoApi.listar())
    } catch (error) {
      setErro(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const generosFiltrados = generos.filter((genero) => {
    const termo = busca.trim().toLowerCase()
    return !termo || genero.nome.toLowerCase().includes(termo)
  })
  const totalPaginas = Math.max(1, Math.ceil(generosFiltrados.length / TAMANHO_PAGINA))
  const generosPagina = generosFiltrados.slice((pagina - 1) * TAMANHO_PAGINA, pagina * TAMANHO_PAGINA)
  const primeiroItem = generosFiltrados.length === 0 ? 0 : (pagina - 1) * TAMANHO_PAGINA + 1
  const ultimoItem = Math.min(pagina * TAMANHO_PAGINA, generosFiltrados.length)

  function abrirNovo() {
    setNome('')
    setIdEdicao(null)
    setErrosCampos({})
    setErro('')
    setSucesso('')
    setFormularioAberto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setNome('')
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
    try {
      if (idEdicao) {
        await generoApi.alterar(idEdicao, { nome })
        setSucesso('Gênero atualizado com sucesso.')
      } else {
        await generoApi.inserir({ nome })
        setSucesso('Gênero cadastrado com sucesso.')
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

  function editar(genero) {
    setIdEdicao(genero.id)
    setNome(genero.nome)
    setErro('')
    setSucesso('')
    setErrosCampos({})
    setFormularioAberto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluir(genero) {
    if (!window.confirm(`Excluir o gênero ${genero.nome}?`)) return
    setErro('')
    setSucesso('')
    try {
      await generoApi.excluir(genero.id)
      setSucesso('Gênero excluído com sucesso.')
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
        <strong>Gêneros</strong>
      </nav>

      <header className="rg-admin-plataformas-cabecalho">
        <div><h1>Gestão de gêneros</h1><p>Gerencie os gêneros usados para classificar os jogos do catálogo.</p></div>
        <button type="button" className="rg-admin-plataformas-adicionar" onClick={abrirNovo}><img src={iconeAdicionar} alt="" aria-hidden="true" />Adicionar gênero</button>
      </header>

      {formularioAberto && <form className="rg-admin-plataformas-form" onSubmit={enviar} noValidate>
        <div className="rg-admin-plataformas-form-titulo"><h2>{idEdicao ? 'Editar gênero' : 'Novo gênero'}</h2><button type="button" onClick={cancelarEdicao} aria-label="Fechar formulário">×</button></div>
        <div className="rg-admin-plataformas-form-grid rg-admin-genero-form-grid">
          <div><label htmlFor="genero-nome">Nome do gênero <em>*</em></label><input id="genero-nome" name="nome" maxLength={50} value={nome} onChange={(evento) => setNome(evento.target.value)} /><ErroCampo erros={errosCampos} nome="nome" /></div>
        </div>
        <div className="rg-admin-plataformas-form-acoes"><button type="button" className="rg-btn-secondary" onClick={cancelarEdicao}>Cancelar</button><button className="rg-admin-plataformas-salvar" disabled={enviando}>{enviando ? 'Salvando...' : idEdicao ? 'Salvar alterações' : 'Cadastrar gênero'}</button></div>
      </form>}

      {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
      {sucesso && <p className="rg-form-sucesso" role="status">{sucesso}</p>}
      <label className="rg-admin-plataformas-busca"><span aria-hidden="true">⌕</span><input value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1) }} placeholder="Buscar gêneros..." /></label>

      {carregando && <p className="rg-admin-jogos-estado">Carregando gêneros...</p>}
      {!carregando && generosFiltrados.length === 0 && <p className="rg-admin-jogos-estado">Nenhum gênero encontrado.</p>}
      {!carregando && generosFiltrados.length > 0 && <div className="rg-admin-plataformas-tabela-wrap"><table className="rg-admin-plataformas-tabela rg-admin-generos-tabela"><thead><tr><th>Gênero</th><th>Ações</th></tr></thead><tbody>{generosPagina.map((genero) => <tr key={genero.id}><td><strong>{genero.nome}</strong></td><td><div className="rg-admin-plataformas-acoes"><button type="button" title={`Editar ${genero.nome}`} aria-label={`Editar ${genero.nome}`} onClick={() => editar(genero)}><img src={iconePincel} alt="" aria-hidden="true" /></button><button type="button" title={`Excluir ${genero.nome}`} aria-label={`Excluir ${genero.nome}`} onClick={() => excluir(genero)}><img src={iconeLixeira} alt="" aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div>}
      {!carregando && generosFiltrados.length > 0 && <div className="rg-admin-plataformas-rodape"><span>Mostrando {primeiroItem}–{ultimoItem} de {generosFiltrados.length} gêneros</span>{totalPaginas > 1 && <div className="rg-admin-plataformas-paginacao"><button type="button" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina((atual) => atual - 1)}>‹</button>{Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => <button type="button" className={numero === pagina ? 'ativo' : ''} key={numero} onClick={() => setPagina(numero)}>{numero}</button>)}<button type="button" aria-label="Próxima página" disabled={pagina >= totalPaginas} onClick={() => setPagina((atual) => atual + 1)}>›</button></div>}</div>}
    </section>
  )
}
