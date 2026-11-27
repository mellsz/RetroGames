import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pedidoApi } from '../api/servicos'
import { obterMensagemErro } from '../api/erros'
import { formatarPreco } from '../lib/formato'

export function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [situacoes, setSituacoes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [alterando, setAlterando] = useState(null)
  const [aberto, setAberto] = useState(null)

  async function carregar(idSituacao) {
    setCarregando(true); setErro('')
    try { setPedidos(await pedidoApi.listar(idSituacao || null)) }
    catch (error) { setErro(obterMensagemErro(error)) }
    finally { setCarregando(false) }
  }
  useEffect(() => { pedidoApi.situacoes().then(setSituacoes).catch((error) => setErro(obterMensagemErro(error))) }, [])
  useEffect(() => { carregar(filtro) }, [filtro])

  async function mudarSituacao(pedido, idSituacao) {
    if (pedido.idSituacao === idSituacao) return
    if (!window.confirm(`Alterar a situação do pedido #${pedido.id}?`)) return
    setAlterando(pedido.id); setErro(''); setSucesso('')
    try { await pedidoApi.alterarSituacao(pedido.id, idSituacao); setSucesso('Situação atualizada.'); await carregar(filtro) }
    catch (error) { setErro(obterMensagemErro(error)) }
    finally { setAlterando(null) }
  }

  return <section className="rg-admin-pagina rg-pagina-enter"><Link className="rg-admin-voltar" to="/admin">← Voltar ao painel</Link><p className="rg-admin-etiqueta">Administração</p><h1>Pedidos</h1>
    <label className="rg-admin-filtro">Situação <select value={filtro} onChange={(evento) => setFiltro(evento.target.value)}><option value="">Todas</option>{situacoes.map((situacao) => <option value={situacao.id} key={situacao.id}>{situacao.descricao}</option>)}</select></label>
    {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}{sucesso && <p className="rg-form-sucesso" role="status">{sucesso}</p>}{carregando ? <p>Carregando pedidos...</p> : pedidos.length === 0 ? <p>Nenhum pedido encontrado.</p> : <div className="rg-admin-listagem table-responsive"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Situação</th><th>Ações</th></tr></thead><tbody>{pedidos.map((pedido) => <tr key={pedido.id}><td>#{pedido.id}</td><td>{pedido.nomeCliente || `#${pedido.idUsuario}`}</td><td>{new Date(`${pedido.dataPedido}Z`.replace('ZZ', 'Z')).toLocaleDateString('pt-BR')}</td><td>{formatarPreco(pedido.total)}</td><td><select aria-label={`Situação do pedido ${pedido.id}`} value={pedido.idSituacao} disabled={alterando === pedido.id} onChange={(evento) => mudarSituacao(pedido, Number(evento.target.value))}>{situacoes.map((situacao) => <option value={situacao.id} key={situacao.id}>{situacao.descricao}</option>)}</select></td><td><button type="button" className="rg-btn-secondary" onClick={() => setAberto(aberto === pedido.id ? null : pedido.id)}>{aberto === pedido.id ? 'Ocultar' : 'Detalhes'}</button>{aberto === pedido.id && <ul className="rg-admin-pedido-itens">{pedido.itens.map((item) => <li key={item.idJogo}>{item.quantidade} × {item.nomeJogo} — {formatarPreco(item.valorUnitario)} cada</li>)}</ul>}</td></tr>)}</tbody></table></div>}
  </section>
}
