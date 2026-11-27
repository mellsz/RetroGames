import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'
import { condicaoJogoApi, generoApi, jogoApi, plataformaApi } from '../api/servicos'
import { formatarPreco } from '../lib/formato'

const FORMULARIO_INICIAL = {
  nome: '', descricao: '', anoLancamento: '', preco: '', estoque: '', idPlataforma: '', idCondicaoJogo: '', idsGeneros: [], ativo: true,
}

function ErroCampo({ erros, nome }) {
  return erros[nome]?.[0] ? <small className="rg-form-erro">{erros[nome][0]}</small> : null
}

export function AdminJogos() {
  const [resultado, setResultado] = useState({ itens: [], pagina: 1, totalPaginas: 0, totalItens: 0 })
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      setResultado(await jogoApi.listar({ busca: busca.trim() || undefined, incluirInativos: true, pagina, tamanhoPagina: 10 }))
    } catch (error) {
      setErro(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [pagina])

  function pesquisar(evento) {
    evento.preventDefault()
    setPagina(1)
    if (pagina === 1) carregar()
  }

  async function desativar(jogo) {
    if (!window.confirm(`Desativar ${jogo.nome}? O jogo deixará de aparecer no catálogo.`)) return
    try {
      await jogoApi.desativar(jogo.id)
      await carregar()
    } catch (error) {
      setErro(obterMensagemErro(error))
    }
  }

  async function ativar(jogo) {
    if (!window.confirm(`Ativar ${jogo.nome}? O jogo voltará a aparecer no catálogo.`)) return
    try {
      await jogoApi.ativar(jogo.id)
      await carregar()
    } catch (error) {
      setErro(obterMensagemErro(error))
    }
  }

  return (
    <section className="rg-admin-pagina rg-pagina-enter">
      <div className="rg-admin-cabecalho-lista">
        <div><Link className="rg-admin-voltar" to="/admin">← Voltar ao painel</Link><p className="rg-admin-etiqueta">Administração</p><h1>Jogos</h1></div>
        <Link className="rg-btn-primary" to="/admin/jogos/novo">Novo jogo</Link>
      </div>
      <form className="rg-admin-busca" onSubmit={pesquisar}><input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Procurar jogos..." /><button className="rg-btn-secondary">Buscar</button></form>
      {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
      {carregando && <p>Carregando jogos...</p>}
      {!carregando && <div className="table-responsive"><table><thead><tr><th>Jogo</th><th>Plataforma</th><th>Preço</th><th>Situação</th><th>Ações</th></tr></thead><tbody>{resultado.itens.map((jogo) => <tr key={jogo.id}><td><strong>{jogo.nome}</strong><small>{jogo.anoLancamento}</small></td><td>{jogo.nomePlataforma}</td><td>{formatarPreco(jogo.preco)}</td><td><span className={jogo.ativo ? 'rg-status-ativo' : 'rg-status-inativo'}>{jogo.ativo ? 'Ativo' : 'Inativo'}</span></td><td className="rg-tabela-acoes"><Link to={`/admin/jogos/${jogo.id}/editar`}>Editar</Link>{jogo.ativo ? <button type="button" onClick={() => desativar(jogo)}>Desativar</button> : <button type="button" className="rg-acao-ativar" onClick={() => ativar(jogo)}>Ativar</button>}</td></tr>)}</tbody></table></div>}
      {!carregando && resultado.itens.length === 0 && <p>Nenhum jogo encontrado.</p>}
      {resultado.totalPaginas > 1 && <div className="rg-admin-paginacao"><button disabled={pagina <= 1} onClick={() => setPagina((atual) => atual - 1)}>Anterior</button><span>Página {resultado.pagina} de {resultado.totalPaginas}</span><button disabled={pagina >= resultado.totalPaginas} onClick={() => setPagina((atual) => atual + 1)}>Próxima</button></div>}
    </section>
  )
}

export function FormularioJogo() {
  const { id } = useParams()
  const navegar = useNavigate()
  const editando = Boolean(id)
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [plataformas, setPlataformas] = useState([])
  const [condicoes, setCondicoes] = useState([])
  const [generos, setGeneros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})
  const [arquivoImagem, setArquivoImagem] = useState(null)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const [listaPlataformas, listaCondicoes, listaGeneros, jogo] = await Promise.all([
          plataformaApi.listar(), condicaoJogoApi.listar(), generoApi.listar(), editando ? jogoApi.buscarPorId(id) : Promise.resolve(null),
        ])
        if (!ativo) return
        setPlataformas(listaPlataformas)
        setCondicoes(listaCondicoes)
        setGeneros(listaGeneros)
        if (jogo) {
          setFormulario({
            nome: jogo.nome, descricao: jogo.descricao ?? '', anoLancamento: String(jogo.anoLancamento), preco: String(jogo.preco), estoque: String(jogo.estoque),
            idPlataforma: String(jogo.idPlataforma), idCondicaoJogo: String(jogo.idCondicaoJogo), idsGeneros: jogo.generos.map((genero) => genero.id), ativo: jogo.ativo,
          })
        }
      } catch (error) {
        if (ativo) setErro(obterMensagemErro(error))
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [id, editando])

  function atualizarCampo(evento) {
    const { name, value, type, checked } = evento.target
    setFormulario((atual) => ({ ...atual, [name]: type === 'checkbox' ? checked : value }))
  }

  function alternarGenero(idGenero) {
    setFormulario((atual) => ({
      ...atual,
      idsGeneros: atual.idsGeneros.includes(idGenero) ? atual.idsGeneros.filter((idAtual) => idAtual !== idGenero) : [...atual.idsGeneros, idGenero],
    }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setErrosCampos({})
    setEnviando(true)
    const dados = new FormData()
    dados.append('nome', formulario.nome)
    dados.append('descricao', formulario.descricao)
    dados.append('anoLancamento', formulario.anoLancamento)
    dados.append('preco', formulario.preco)
    dados.append('estoque', formulario.estoque)
    dados.append('idPlataforma', formulario.idPlataforma)
    dados.append('idCondicaoJogo', formulario.idCondicaoJogo)
    dados.append('ativo', String(formulario.ativo))
    formulario.idsGeneros.forEach((idGenero) => dados.append('idsGeneros', String(idGenero)))
    if (arquivoImagem) dados.append('imagem', arquivoImagem)
    try {
      if (editando) await jogoApi.alterar(id, dados)
      else await jogoApi.inserir(dados)
      navegar('/admin/jogos', { replace: true })
    } catch (error) {
      setErrosCampos(obterErrosDosCampos(error))
      setErro(obterMensagemErro(error))
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <p className="rg-autenticacao-verificando">Carregando formulário...</p>

  return (
    <section className="rg-admin-pagina rg-pagina-enter">
      <Link className="rg-admin-voltar" to="/admin/jogos">← Voltar para jogos</Link>
      <p className="rg-admin-etiqueta">Administração · Jogos</p>
      <h1>{editando ? 'Editar jogo' : 'Novo jogo'}</h1>
      {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
      <form className="rg-admin-formulario rg-admin-formulario--jogo" onSubmit={enviar} noValidate>
        <label>Nome<input name="nome" value={formulario.nome} onChange={atualizarCampo} /></label><ErroCampo erros={errosCampos} nome="nome" />
        <label>Descrição<textarea name="descricao" rows="4" value={formulario.descricao} onChange={atualizarCampo} /></label><ErroCampo erros={errosCampos} nome="descricao" />
        <label>Capa do jogo<input name="imagem" type="file" accept="image/png,image/jpeg,image/webp" onChange={(evento) => setArquivoImagem(evento.target.files?.[0] ?? null)} /></label>
        {editando && !arquivoImagem && <p className="rg-admin-ajuda">Envie outra imagem somente se quiser substituir a capa atual.</p>}
        <div className="rg-admin-formulario-linha"><label>Ano<input name="anoLancamento" type="number" value={formulario.anoLancamento} onChange={atualizarCampo} /></label><label>Preço<input name="preco" type="number" step="0.01" min="0" value={formulario.preco} onChange={atualizarCampo} /></label><label>Estoque<input name="estoque" type="number" min="0" value={formulario.estoque} onChange={atualizarCampo} /></label></div>
        <div className="rg-admin-formulario-linha"><label>Plataforma<select name="idPlataforma" value={formulario.idPlataforma} onChange={atualizarCampo}><option value="">Selecione</option>{plataformas.map((plataforma) => <option key={plataforma.id} value={plataforma.id}>{plataforma.nome}</option>)}</select></label><label>Condição<select name="idCondicaoJogo" value={formulario.idCondicaoJogo} onChange={atualizarCampo}><option value="">Selecione</option>{condicoes.map((condicao) => <option key={condicao.id} value={condicao.id}>{condicao.descricao}</option>)}</select></label></div>
        <ErroCampo erros={errosCampos} nome="idPlataforma" /><ErroCampo erros={errosCampos} nome="idCondicaoJogo" />
        <fieldset><legend>Gêneros</legend><div className="rg-admin-generos">{generos.map((genero) => <label key={genero.id}><input type="checkbox" checked={formulario.idsGeneros.includes(genero.id)} onChange={() => alternarGenero(genero.id)} /> {genero.nome}</label>)}</div></fieldset><ErroCampo erros={errosCampos} nome="idsGeneros" />
        {editando && <label className="rg-admin-checkbox"><input type="checkbox" name="ativo" checked={formulario.ativo} onChange={atualizarCampo} /> Jogo ativo no catálogo</label>}
        <div className="rg-admin-botoes"><button className="rg-btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar jogo'}</button><button type="button" className="rg-btn-secondary" onClick={() => navegar('/admin/jogos')}>Cancelar</button></div>
      </form>
    </section>
  )
}
