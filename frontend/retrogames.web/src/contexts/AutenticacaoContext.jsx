import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { autenticacaoApi } from '../api/servicos'

const AutenticacaoContext = createContext(null)

export function AutenticacaoProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function recuperarSessao() {
      try {
        const usuarioAtual = await autenticacaoApi.usuarioAtual()
        if (ativo) setUsuario(usuarioAtual)
      } catch {
        if (ativo) setUsuario(null)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    function aoExpirarSessao() {
      setUsuario(null)
    }

    recuperarSessao()
    window.addEventListener('sessao:expirada', aoExpirarSessao)
    return () => {
      ativo = false
      window.removeEventListener('sessao:expirada', aoExpirarSessao)
    }
  }, [])

  async function entrar(dados) {
    const usuarioAutenticado = await autenticacaoApi.entrar(dados)
    setUsuario(usuarioAutenticado)
    return usuarioAutenticado
  }

  async function cadastrar(dados) {
    const usuarioAutenticado = await autenticacaoApi.cadastrar(dados)
    setUsuario(usuarioAutenticado)
    return usuarioAutenticado
  }

  async function sair() {
    try {
      await autenticacaoApi.sair()
    } finally {
      setUsuario(null)
    }
  }

  const valor = useMemo(() => ({
    usuario,
    carregando,
    estaAutenticado: Boolean(usuario),
    ehAdministrador: usuario?.perfil === 'Administrador',
    entrar,
    cadastrar,
    sair,
  }), [usuario, carregando])

  return <AutenticacaoContext.Provider value={valor}>{children}</AutenticacaoContext.Provider>
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext)
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvider.')
  return contexto
}
