import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'
import { condicaoJogoApi, generoApi, jogoApi, plataformaApi } from '../api/servicos'
import { formatarPreco } from '../lib/formato'
import iconeAdicionar from '../assets/admin-icons/add-outline.svg'
import iconeCasa from '../assets/admin-icons/home-outline.svg'
import iconePincel from '../assets/admin-icons/pencil-outline.svg'
import iconeLixeira from '../assets/admin-icons/trash-outline.svg'

const FORMULARIO_INICIAL = {
  nome: '', descricao: '', anoLancamento: '', preco: '', estoque: '', idPlataforma: '', idCondicaoJogo: '', idsGeneros: [], ativo: true,
}

function ErroCampo({ erros, nome }) {
  return erros[nome]?.[0] ? <small className="rg-form-erro">{erros[nome][0]}</small> : null
}

const capasJogos = import.meta.glob('../assets/jogos/*', { eager: true, query: '?url', import: 'default' })

function normalizarNomeCapa(valor) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function obterCapaAdmin(jogo) {
  if (jogo.imagem) return jogo.imagem
  const nomeNormalizado = normalizarNomeCapa(jogo.nome)
  const capasExatas = {
    [normalizarNomeCapa('Phantasy Star IV')]: 'Phantasy_Star_EotM_cover_MegaDrive.jpg',
    [normalizarNomeCapa('Sonic the Hedgehog 2')]: 'Sonic_Megadrive.jpg',
    [normalizarNomeCapa('River Raid')]: 'River_Raid_Atari2600.jpg',
    [normalizarNomeCapa('The Legend of Zelda Ocarina of Time')]: 'The_Legend_of_Zelda_nintendo64.jpg',
  }
  const capaExata = capasExatas[nomeNormalizado]
  if (capaExata) {
    const encontrada = Object.entries(capasJogos).find(([caminho]) => caminho.endsWith(capaExata))
    if (encontrada) return encontrada[1]
  }
  const arquivo = Object.entries(capasJogos).find(([caminho]) => {
    const nomeArquivo = normalizarNomeCapa(caminho.split('/').pop().replace(/\.[^.]+$/, ''))
    return nomeNormalizado.includes(nomeArquivo) || nomeArquivo.includes(nomeNormalizado)
  })
  return arquivo?.[1]
}

function SeletorFiltroAdmin({ label, value, options, onChange }) {
  const selecionada = options.find((opcao) => opcao.value === value) ?? options[0]

  function selecionar(evento, proximoValor) {
    evento.currentTarget.closest('details')?.removeAttribute('open')
    onChange(proximoValor)
  }

  return (
    <label className="rg-admin-jogos-seletor">
      <span>{label}</span>
      <details className="rg-seletor-personalizado">
        <summary aria-label={`Selecionar ${label.toLowerCase()}`}>
          <span>{selecionada.label}</span>
          <span className="rg-seletor-seta" aria-hidden="true" />
        </summary>
        <div className="rg-seletor-opcoes" role="listbox" aria-label={label}>
          {options.map((opcao) => (
            <button key={opcao.value || 'todos'} type="button" role="option" aria-selected={opcao.value === value} onClick={(evento) => selecionar(evento, opcao.value)}>{opcao.label}</button>
          ))}
        </div>
      </details>
    </label>
  )
}

export function AdminJogos() {
  const TAMANHO_PAGINA = 5
  const [resultado, setResultado] = useState({ itens: [] })
  const [busca, setBusca] = useState('')
  const [filtroPlataforma, setFiltroPlataforma] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('')
  const [ordemPreco, setOrdemPreco] = useState('')
  const [plataformas, setPlataformas] = useState([])
  const [pagina, setPagina] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const filtrosRef = useRef(null)

  async function carregar(opcoes = {}) {
    setCarregando(true)
    setErro('')
    try {
      const termoBusca = opcoes.busca !== undefined ? opcoes.busca : busca
      const idPlataforma = opcoes.idPlataforma !== undefined ? opcoes.idPlataforma : filtroPlataforma
      const filtros = { busca: termoBusca.trim() || undefined, idPlataforma: idPlataforma ? Number(idPlataforma) : undefined, incluirInativos: true, pagina: 1, tamanhoPagina: 50 }
      const primeiraPagina = await jogoApi.listar(filtros)
      const paginasRestantes = Array.from({ length: Math.max(0, primeiraPagina.totalPaginas - 1) }, (_, indice) =>
        jogoApi.listar({ ...filtros, pagina: indice + 2 }))
      const paginas = await Promise.all(paginasRestantes)
      setResultado({ itens: [primeiraPagina, ...paginas].flatMap((paginaAtual) => paginaAtual.itens) })
    } catch (error) {
      setErro(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    let ativo = true
    plataformaApi.listar().then((dados) => { if (ativo) setPlataformas(dados) }).catch(() => {})
    carregar()
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    function fecharSeletores(evento) {
      if (!filtrosRef.current?.contains(evento.target)) {
        filtrosRef.current?.querySelectorAll('details[open]').forEach((seletor) => seletor.removeAttribute('open'))
      }
    }

    function fecharComEsc(evento) {
      if (evento.key === 'Escape') filtrosRef.current?.querySelectorAll('details[open]').forEach((seletor) => seletor.removeAttribute('open'))
    }

    document.addEventListener('pointerdown', fecharSeletores)
    document.addEventListener('keydown', fecharComEsc)
    return () => {
      document.removeEventListener('pointerdown', fecharSeletores)
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [])

  function pesquisar(evento) {
    evento.preventDefault()
    setPagina(1)
    carregar()
  }

  function alterarBusca(evento) {
    const valor = evento.target.value
    setBusca(valor)
    if (!valor.trim()) {
      setPagina(1)
      carregar({ busca: '' })
    }
  }

  function ordenarPreco(direcao) {
    setOrdemPreco((atual) => atual === direcao ? '' : direcao)
    setPagina(1)
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

  const jogosFiltrados = resultado.itens
    .filter((jogo) => !filtroSituacao || (filtroSituacao === 'ativo' ? jogo.ativo : !jogo.ativo))
    .sort((a, b) => ordemPreco === 'asc' ? a.preco - b.preco : ordemPreco === 'desc' ? b.preco - a.preco : 0)
  const totalPaginas = Math.max(1, Math.ceil(jogosFiltrados.length / TAMANHO_PAGINA))
  const jogosPagina = jogosFiltrados.slice((pagina - 1) * TAMANHO_PAGINA, pagina * TAMANHO_PAGINA)
  const primeiroItem = jogosFiltrados.length === 0 ? 0 : (pagina - 1) * TAMANHO_PAGINA + 1
  const ultimoItem = Math.min(pagina * TAMANHO_PAGINA, jogosFiltrados.length)

  return (
    <section className="rg-admin-jogos rg-pagina-enter">
      <nav className="rg-admin-jogos-breadcrumb" aria-label="Caminho de navegação">
        <Link className="rg-admin-jogos-casa" to="/admin" aria-label="Voltar ao painel administrativo"><img src={iconeCasa} alt="" aria-hidden="true" /></Link>
        <Link className="rg-admin-jogos-breadcrumb-link" to="/admin">Administração</Link>
        <b aria-hidden="true">›</b>
        <strong>Jogos</strong>
      </nav>
      <div className="rg-admin-jogos-cabecalho">
        <div><h1>Gestão de jogos</h1><p>Consulte, cadastre, edite ou desative os jogos do catálogo.</p></div>
        <Link className="rg-admin-jogos-adicionar" to="/admin/jogos/novo"><img src={iconeAdicionar} alt="" aria-hidden="true" />Adicionar jogo</Link>
      </div>
      <form className="rg-admin-jogos-filtros" ref={filtrosRef} onSubmit={pesquisar}>
        <label className="rg-admin-jogos-busca"><span aria-hidden="true">⌕</span><input value={busca} onChange={alterarBusca} placeholder="Buscar por nome do jogo..." /></label>
        <SeletorFiltroAdmin label="Plataforma" value={filtroPlataforma} options={[{ value: '', label: 'Todas' }, ...plataformas.map((plataforma) => ({ value: String(plataforma.id), label: plataforma.nome }))]} onChange={(valor) => { setFiltroPlataforma(valor); setPagina(1); carregar({ idPlataforma: valor }) }} />
        <SeletorFiltroAdmin label="Situação" value={filtroSituacao} options={[{ value: '', label: 'Todos' }, { value: 'ativo', label: 'Ativos' }, { value: 'inativo', label: 'Inativos' }]} onChange={(valor) => { setFiltroSituacao(valor); setPagina(1) }} />
        <button className="rg-admin-jogos-filtro-enviar" aria-label="Buscar jogos">Buscar</button>
      </form>
      {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
      {carregando && <p className="rg-admin-jogos-estado">Carregando jogos...</p>}
      {!carregando && jogosFiltrados.length === 0 && <p className="rg-admin-jogos-estado">Nenhum jogo encontrado.</p>}
      {!carregando && jogosFiltrados.length > 0 && <div className="rg-admin-jogos-tabela-wrap"><table className="rg-admin-jogos-tabela"><thead><tr><th>Jogo</th><th>Plataforma</th><th><span className="rg-admin-jogos-preco-cabecalho">Preço <span className="rg-admin-jogos-ordenadores"><button type="button" className={ordemPreco === 'asc' ? 'ativo' : ''} title="Menor preço primeiro" aria-label="Ordenar preço do menor para o maior" onClick={() => ordenarPreco('asc')}>↑</button><button type="button" className={ordemPreco === 'desc' ? 'ativo' : ''} title="Maior preço primeiro" aria-label="Ordenar preço do maior para o menor" onClick={() => ordenarPreco('desc')}>↓</button></span></span></th><th>Situação</th><th>Ações</th></tr></thead><tbody>{jogosPagina.map((jogo) => <tr key={jogo.id}><td><div className="rg-admin-jogos-identidade">{obterCapaAdmin(jogo) ? <img src={obterCapaAdmin(jogo)} alt={`Capa de ${jogo.nome}`} loading="lazy" /> : <span className="rg-admin-jogos-capa-vazia" aria-hidden="true" />}<span><strong>{jogo.nome}</strong><small>{jogo.generos?.[0] ?? 'Clássico'} · {jogo.anoLancamento}</small></span></div></td><td><span className="rg-admin-jogos-plataforma">{jogo.nomePlataforma}</span></td><td>{formatarPreco(jogo.preco)}</td><td><span className={jogo.ativo ? 'rg-admin-jogos-status rg-admin-jogos-status--ativo' : 'rg-admin-jogos-status rg-admin-jogos-status--inativo'}><i aria-hidden="true" />{jogo.ativo ? 'Ativo' : 'Inativo'}</span></td><td><div className="rg-admin-jogos-acoes"><Link to={`/admin/jogos/${jogo.id}/editar`} title={`Editar ${jogo.nome}`} aria-label={`Editar ${jogo.nome}`}><img src={iconePincel} alt="" aria-hidden="true" /></Link>{jogo.ativo ? <button type="button" title={`Desativar ${jogo.nome}`} aria-label={`Desativar ${jogo.nome}`} onClick={() => desativar(jogo)}><img src={iconeLixeira} alt="" aria-hidden="true" /></button> : <button type="button" className="rg-admin-jogos-ativar" onClick={() => ativar(jogo)}>Ativar</button>}</div></td></tr>)}</tbody></table></div>}
      {!carregando && jogosFiltrados.length > 0 && <div className="rg-admin-jogos-rodape"><span>Exibindo {primeiroItem}–{ultimoItem} de {jogosFiltrados.length} jogos</span>{totalPaginas > 1 && <div className="rg-admin-jogos-paginacao"><button type="button" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina((atual) => atual - 1)}>‹</button>{Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => <button type="button" className={numero === pagina ? 'ativo' : ''} key={numero} onClick={() => setPagina(numero)}>{numero}</button>)}<button type="button" aria-label="Próxima página" disabled={pagina >= totalPaginas} onClick={() => setPagina((atual) => atual + 1)}>›</button></div>}</div>}
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
