import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { generoApi } from '../api/servicos'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'

export function AdminGeneros() {
  const [generos, setGeneros] = useState([])
  const [nome, setNome] = useState('')
  const [idEdicao, setIdEdicao] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [erroCampo, setErroCampo] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    try { setGeneros(await generoApi.listar()) } catch (error) { setErro(obterMensagemErro(error)) } finally { setCarregando(false) }
  }
  useEffect(() => { carregar() }, [])

  async function enviar(evento) {
    evento.preventDefault(); setEnviando(true); setErro(''); setSucesso(''); setErroCampo('')
    try {
      if (idEdicao) await generoApi.alterar(idEdicao, { nome })
      else await generoApi.inserir({ nome })
      setSucesso(idEdicao ? 'Gênero atualizado.' : 'Gênero cadastrado.')
      setNome(''); setIdEdicao(null); await carregar()
    } catch (error) { setErro(obterMensagemErro(error)); setErroCampo(obterErrosDosCampos(error).nome?.[0] ?? '') } finally { setEnviando(false) }
  }

  async function excluir(genero) {
    if (!window.confirm(`Excluir o gênero ${genero.nome}?`)) return
    setErro(''); setSucesso('')
    try { await generoApi.excluir(genero.id); setSucesso('Gênero excluído.'); await carregar() }
    catch (error) { setErro(obterMensagemErro(error)) }
  }

  return <section className="rg-admin-pagina rg-pagina-enter"><Link className="rg-admin-voltar" to="/admin">← Voltar ao painel</Link><p className="rg-admin-etiqueta">Administração</p><h1>Gêneros</h1>
    <div className="rg-admin-grade"><form className="rg-admin-formulario" onSubmit={enviar} noValidate><h2>{idEdicao ? 'Editar gênero' : 'Novo gênero'}</h2><label>Nome<input value={nome} maxLength={50} onChange={(evento) => setNome(evento.target.value)} /></label>{erroCampo && <small className="rg-form-erro">{erroCampo}</small>}<div className="rg-admin-botoes"><button className="rg-btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>{idEdicao && <button type="button" className="rg-btn-secondary" onClick={() => { setIdEdicao(null); setNome('') }}>Cancelar</button>}</div></form>
      <div className="rg-admin-listagem"><h2>Gêneros cadastrados</h2>{carregando ? <p>Carregando...</p> : <div className="table-responsive"><table><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>{generos.map((genero) => <tr key={genero.id}><td>{genero.nome}</td><td className="rg-tabela-acoes"><button type="button" onClick={() => { setIdEdicao(genero.id); setNome(genero.nome); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Editar</button><button type="button" onClick={() => excluir(genero)}>Excluir</button></td></tr>)}</tbody></table></div>}</div></div>
    {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}{sucesso && <p className="rg-form-sucesso" role="status">{sucesso}</p>}
  </section>
}
