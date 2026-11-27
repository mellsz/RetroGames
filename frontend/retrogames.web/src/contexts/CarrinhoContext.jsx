import { createContext, useContext, useEffect, useState } from 'react'

const CHAVE = 'rg_carrinho'
const CarrinhoContext = createContext(null)

function lerItens() {
  try {
    const valor = JSON.parse(localStorage.getItem(CHAVE) || '[]')
    return Array.isArray(valor)
      ? valor.filter((item) => Number.isInteger(item.idJogo) && item.idJogo > 0 && Number.isInteger(item.quantidade) && item.quantidade >= 1 && item.quantidade <= 10)
      : []
  } catch {
    return []
  }
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(lerItens)

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(itens))
  }, [itens])

  function adicionar(jogo) {
    if (!jogo || jogo.estoque < 1 || jogo.ativo === false) return false
    const idJogo = Number(jogo.id)
    const atual = itens.find((item) => item.idJogo === idJogo)
    if (atual && atual.quantidade >= Math.min(10, jogo.estoque)) return false
    setItens((anteriores) => {
      const existente = anteriores.find((item) => item.idJogo === idJogo)
      if (existente) return anteriores.map((item) => item.idJogo === idJogo ? { ...item, quantidade: item.quantidade + 1 } : item)
      return [...anteriores, { idJogo, quantidade: 1 }]
    })
    return true
  }

  function alterarQuantidade(idJogo, quantidade) {
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) return
    setItens((anteriores) => anteriores.map((item) => item.idJogo === idJogo ? { ...item, quantidade } : item))
  }

  function remover(idJogo) {
    setItens((anteriores) => anteriores.filter((item) => item.idJogo !== idJogo))
  }

  function limpar() { setItens([]) }

  const valor = {
    itens, adicionar, alterarQuantidade, remover, limpar,
    totalItens: itens.reduce((soma, item) => soma + item.quantidade, 0),
  }

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext)
  if (!contexto) throw new Error('CarrinhoProvider não encontrado.')
  return contexto
}
