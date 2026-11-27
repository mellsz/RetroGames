import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { pedidoApi } from '../api/servicos'
import { obterMensagemErro } from '../api/erros'
import { formatarPreco } from '../lib/formato'

export function MeusPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [cancelando, setCancelando] = useState(null)
  const [params] = useSearchParams()
  async function carregar() {
    setCarregando(true); setErro('')
    try { setPedidos(await pedidoApi.meus()) }
    catch (error) { setErro(obterMensagemErro(error)) }
    finally { setCarregando(false) }
  }
  useEffect(() => { carregar() }, [])
  async function cancelar(pedido) {
    if (!window.confirm(`Cancelar o pedido #${pedido.id}? As unidades voltarão ao estoque.`)) return
    setCancelando(pedido.id); setErro(''); setSucesso('')
    try { await pedidoApi.cancelar(pedido.id); setSucesso(`Pedido #${pedido.id} cancelado. O estoque foi atualizado.`); await carregar() }
    catch (error) { setErro(obterMensagemErro(error)) }
    finally { setCancelando(null) }
  }
  return <section className="rg-compras rg-pagina-enter"><Link className="rg-admin-voltar" to="/">← Voltar ao catálogo</Link><p className="rg-admin-etiqueta">Área do cliente</p><h1>Meus pedidos</h1>
    {params.get('confirmado') && <p className="rg-form-sucesso" role="status">Pedido #{params.get('confirmado')} recebido com sucesso.</p>}{sucesso && <p className="rg-form-sucesso" role="status">{sucesso}</p>}
    {carregando && <p>Carregando pedidos...</p>}{erro && <p className="rg-form-alerta" role="alert">{erro}</p>}{!carregando && !erro && pedidos.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}
    <div className="rg-pedidos-lista">{pedidos.map((pedido) => <article key={pedido.id} className="rg-pedido-card"><header><div><h2>Pedido #{pedido.id}</h2><time dateTime={pedido.dataPedido}>{new Date(`${pedido.dataPedido}Z`.replace('ZZ', 'Z')).toLocaleDateString('pt-BR')}</time></div><span className="rg-status-ativo">{pedido.situacao}</span></header><ul>{pedido.itens.map((item) => <li key={item.idJogo}>{item.quantidade} × {item.nomeJogo} — {formatarPreco(item.valorUnitario)} cada</li>)}</ul><strong>Total: {formatarPreco(pedido.total)}</strong>{pedido.idSituacao === 1 && <button type="button" className="rg-btn-secondary" disabled={cancelando === pedido.id} onClick={() => cancelar(pedido)}>{cancelando === pedido.id ? 'Cancelando...' : 'Cancelar pedido'}</button>}</article>)}</div>
  </section>
}
