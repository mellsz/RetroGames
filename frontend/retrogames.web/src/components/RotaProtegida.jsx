import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAutenticacao } from '../contexts/AutenticacaoContext'

export function RotaProtegida({ somenteAdministrador = false, somenteCliente = false }) {
  const localizacao = useLocation()
  const { carregando, estaAutenticado, ehAdministrador } = useAutenticacao()

  if (carregando) {
    return <p className="rg-autenticacao-verificando">Verificando sessão...</p>
  }

  if (!estaAutenticado) {
    const voltarPara = `${localizacao.pathname}${localizacao.search}`
    return <Navigate to={`/login?voltarPara=${encodeURIComponent(voltarPara)}`} replace />
  }

  if ((somenteAdministrador && !ehAdministrador) || (somenteCliente && ehAdministrador)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
