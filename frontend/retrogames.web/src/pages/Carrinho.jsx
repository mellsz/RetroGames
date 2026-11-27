import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jogoApi, pedidoApi } from '../api/servicos'
import { obterMensagemErro } from '../api/erros'
import { useCarrinho } from '../contexts/CarrinhoContext'
import { useAutenticacao } from '../contexts/AutenticacaoContext'
import { formatarPreco } from '../lib/formato'

function useDetalhesCarrinho(itens) {
  const [jogos, setJogos] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const ids = itens.map((item) => item.idJogo).join(',')

  useEffect(() => {
    let ativo = true
    const idsParaBuscar = ids ? ids.split(',').map(Number) : []
    setCarregando(true)
    setErro('')
    Promise.allSettled(idsParaBuscar.map((idJogo) => jogoApi.buscarPorId(idJogo)))
      .then((resultados) => {
        if (!ativo) return
        const mapa = {}
        resultados.forEach((resultado, indice) => {
          if (resultado.status === 'fulfilled') mapa[idsParaBuscar[indice]] = resultado.value
        })
        setJogos(mapa)
        if (resultados.some((resultado) => resultado.status === 'rejected')) setErro('Alguns jogos não estão mais disponíveis. Remova-os antes de finalizar.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [ids])
  return { jogos, carregando, erro }
}

export function Carrinho() {
  const { itens, alterarQuantidade, remover } = useCarrinho()
  const { estaAutenticado } = useAutenticacao()
  const { jogos, carregando, erro } = useDetalhesCarrinho(itens)
  const total = itens.reduce((soma, item) => soma + (jogos[item.idJogo]?.preco ?? 0) * item.quantidade, 0)
  const haProblema = itens.some((item) => !jogos[item.idJogo] || jogos[item.idJogo].estoque < item.quantidade)
  const destinoFinalizacao = estaAutenticado
    ? '/finalizar-pedido'
    : `/login?voltarPara=${encodeURIComponent('/finalizar-pedido')}`

  return <section className="rg-compras rg-pagina-enter">
    <Link to="/" className="rg-admin-voltar">← Continuar comprando</Link>
    <p className="rg-admin-etiqueta">Sua seleção</p><h1>Carrinho de compras</h1>
    {carregando ? <p>Carregando preços e estoque...</p> : itens.length === 0 ? <div className="rg-compras-vazio"><p>Seu carrinho está vazio.</p><Link className="rg-btn-primary" to="/">Explorar catálogo</Link></div> : <div className="rg-compras-grade">
      <div className="rg-compras-itens">
        {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
        {itens.map((item) => {
          const jogo = jogos[item.idJogo]
          const maximo = Math.min(10, jogo?.estoque ?? 0)
          return <article className="rg-compras-item" key={item.idJogo}>
            {jogo?.imagem && <img src={jogo.imagem} alt="" />}
            <div className="rg-compras-item-info"><h2>{jogo?.nome ?? `Jogo #${item.idJogo} indisponível`}</h2><p>{jogo?.nomePlataforma}</p><strong>{jogo ? formatarPreco(jogo.preco) : 'Indisponível'}</strong></div>
            <div className="rg-compras-item-acoes"><label>Quantidade <select aria-label={`Quantidade de ${jogo?.nome ?? 'jogo'}`} value={item.quantidade} onChange={(evento) => alterarQuantidade(item.idJogo, Number(evento.target.value))}>{Array.from({ length: Math.max(maximo, item.quantidade) }, (_, indice) => indice + 1).filter((valor) => valor <= maximo || valor === item.quantidade).map((valor) => <option key={valor} value={valor}>{valor}</option>)}</select></label><b>{jogo ? formatarPreco(jogo.preco * item.quantidade) : '—'}</b><button type="button" onClick={() => remover(item.idJogo)}>Remover</button>{jogo && maximo < item.quantidade && <small role="alert">Estoque atual: {maximo}</small>}</div>
          </article>
        })}
      </div>
      <aside className="rg-compras-resumo"><h2>Resumo</h2><div><span>{itens.length} {itens.length === 1 ? 'jogo' : 'jogos'}</span><strong>{formatarPreco(total)}</strong></div><div className="rg-compras-total"><span>Total</span><strong>{formatarPreco(total)}</strong></div><Link className={`rg-btn-primary ${haProblema ? 'rg-compras-desabilitado' : ''}`} aria-disabled={haProblema} to={haProblema ? '/carrinho' : destinoFinalizacao}>Finalizar pedido →</Link>{!estaAutenticado && !haProblema && <p>Entre para confirmar seu pedido.</p>}<p>O preço e o estoque serão confirmados na finalização.</p></aside>
    </div>}
  </section>
}

export function FinalizarPedido() {
  const navigate = useNavigate()
  const { itens, limpar } = useCarrinho()
  const { usuario } = useAutenticacao()
  const { jogos, carregando, erro: erroDetalhes } = useDetalhesCarrinho(itens)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const valido = itens.length > 0 && itens.every((item) => jogos[item.idJogo]?.estoque >= item.quantidade)
  const total = itens.reduce((soma, item) => soma + (jogos[item.idJogo]?.preco ?? 0) * item.quantidade, 0)

  async function confirmar() {
    if (!valido || enviando) return
    setEnviando(true); setErro('')
    try {
      const pedido = await pedidoApi.criar(itens)
      limpar()
      navigate(`/meus-pedidos?confirmado=${pedido.id}`, { replace: true })
    } catch (error) {
      setErro(obterMensagemErro(error))
    } finally { setEnviando(false) }
  }

  return <section className="rg-compras rg-pagina-enter"><Link className="rg-admin-voltar" to="/carrinho">← Voltar ao carrinho</Link><p className="rg-admin-etiqueta">Última etapa</p><h1>Finalizar pedido</h1>
    <div className="rg-compras-final"><p>Comprando como <strong>{usuario?.nome}</strong> ({usuario?.email}).</p>
      {carregando ? <p>Conferindo jogos...</p> : <>{erroDetalhes && <p className="rg-form-alerta" role="alert">{erroDetalhes}</p>}{itens.map((item) => <div className="rg-compras-final-linha" key={item.idJogo}><span>{item.quantidade} × {jogos[item.idJogo]?.nome ?? 'Jogo indisponível'}</span><strong>{formatarPreco((jogos[item.idJogo]?.preco ?? 0) * item.quantidade)}</strong></div>)}<div className="rg-compras-total"><span>Total estimado</span><strong>{formatarPreco(total)}</strong></div><p>O valor final será calculado pela loja com os preços atuais.</p>{erro && <p className="rg-form-alerta" role="alert">{erro}</p>}<button className="rg-btn-primary" type="button" onClick={confirmar} disabled={!valido || enviando}>{enviando ? 'Finalizando...' : 'Confirmar pedido'}</button></>}
    </div></section>
}
