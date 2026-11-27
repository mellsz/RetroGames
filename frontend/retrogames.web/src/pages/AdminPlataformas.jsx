import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'
import { plataformaApi } from '../api/servicos'

const FORMULARIO_INICIAL = { nome: '', fabricante: '', anoLancamento: '' }

function ErroCampo({ erros, nome }) {
  return erros[nome]?.[0] ? <small className="rg-form-erro">{erros[nome][0]}</small> : null
}

export function AdminPlataformas() {
  const [plataformas, setPlataformas] = useState([])
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [idEdicao, setIdEdicao] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    setCarregando(true)
    try {
      setPlataformas(await plataformaApi.listar())
    } catch (error) {
      setErro(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function atualizarCampo(evento) {
    setFormulario((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function cancelarEdicao() {
    setFormulario(FORMULARIO_INICIAL)
    setIdEdicao(null)
    setErrosCampos({})
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
    <section className="rg-admin-pagina rg-pagina-enter">
      <Link className="rg-admin-voltar" to="/admin">← Voltar ao painel</Link>
      <p className="rg-admin-etiqueta">Administração</p>
      <h1>Plataformas</h1>
      <div className="rg-admin-grade">
        <form className="rg-admin-formulario" onSubmit={enviar} noValidate>
          <h2>{idEdicao ? 'Editar plataforma' : 'Nova plataforma'}</h2>
          <label>Nome<input name="nome" value={formulario.nome} onChange={atualizarCampo} /></label><ErroCampo erros={errosCampos} nome="nome" />
          <label>Fabricante<input name="fabricante" value={formulario.fabricante} onChange={atualizarCampo} /></label><ErroCampo erros={errosCampos} nome="fabricante" />
          <label>Ano de lançamento<input name="anoLancamento" type="number" value={formulario.anoLancamento} onChange={atualizarCampo} /></label><ErroCampo erros={errosCampos} nome="anoLancamento" />
          <div className="rg-admin-botoes"><button className="rg-btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : idEdicao ? 'Salvar alterações' : 'Cadastrar plataforma'}</button>{idEdicao && <button type="button" className="rg-btn-secondary" onClick={cancelarEdicao}>Cancelar</button>}</div>
        </form>
        <div className="rg-admin-listagem">
          <h2>Plataformas cadastradas</h2>
          {carregando && <p>Carregando plataformas...</p>}
          {!carregando && plataformas.length === 0 && <p>Nenhuma plataforma cadastrada.</p>}
          {!carregando && plataformas.length > 0 && <div className="table-responsive"><table><thead><tr><th>Nome</th><th>Fabricante</th><th>Ano</th><th>Ações</th></tr></thead><tbody>{plataformas.map((plataforma) => <tr key={plataforma.id}><td>{plataforma.nome}</td><td>{plataforma.fabricante}</td><td>{plataforma.anoLancamento}</td><td className="rg-tabela-acoes"><button type="button" onClick={() => editar(plataforma)}>Editar</button><button type="button" onClick={() => excluir(plataforma)}>Excluir</button></td></tr>)}</tbody></table></div>}
        </div>
      </div>
      {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
      {sucesso && <p className="rg-form-sucesso" role="status">{sucesso}</p>}
    </section>
  )
}
