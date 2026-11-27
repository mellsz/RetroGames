import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { IntroArcade } from './components/IntroArcade'
import { Layout } from './components/Layout'
import { RotaProtegida } from './components/RotaProtegida'
import { AdminInicio } from './pages/AdminInicio'
import { AdminJogos, FormularioJogo } from './pages/AdminJogos'
import { AdminPlataformas } from './pages/AdminPlataformas'
import { AdminGeneros } from './pages/AdminGeneros'
import { AdminPedidos } from './pages/AdminPedidos'
import { Carrinho, FinalizarPedido } from './pages/Carrinho'
import { MeusPedidos } from './pages/MeusPedidos'
import { Autenticacao } from './pages/Autenticacao'
import { Catalogo } from './pages/Catalogo/Catalogo'
import { DetalheJogo } from './pages/Catalogo/DetalheJogo'
import { Contato } from './pages/Contato'
import { Inicio } from './pages/Inicio'
import { NaoEncontrada } from './pages/NaoEncontrada'
import { Sobre } from './pages/Sobre'

function App() {
  const location = useLocation()
  const [introAberta, setIntroAberta] = useState(() => {
    const jaViuIntro = sessionStorage.getItem('rg_intro_vista') === '1'
    const entradaInicialCatalogo = location.pathname === '/' && location.search === ''
    return !jaViuIntro && entradaInicialCatalogo
  })

  function fecharIntro() {
    sessionStorage.setItem('rg_intro_vista', '1')
    setIntroAberta(false)
  }

  function abrirIntro() {
    setIntroAberta(true)
  }

  return (
    <>
      {introAberta && <IntroArcade aoEntrar={fecharIntro} />}

      <Routes>
        <Route element={<Layout aoAbrirIntro={abrirIntro} />}>
          <Route path="/" element={<Catalogo />} />
          <Route path="/inicio" element={<Inicio aoAbrirIntro={abrirIntro} />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/jogos/:id" element={<DetalheJogo />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/login" element={<Autenticacao modo="login" />} />
          <Route path="/cadastrar" element={<Autenticacao modo="cadastro" />} />
          <Route element={<RotaProtegida somenteCliente />}>
            <Route path="/finalizar-pedido" element={<FinalizarPedido />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
          </Route>
          <Route element={<RotaProtegida somenteAdministrador />}>
            <Route path="/admin" element={<AdminInicio />} />
            <Route path="/admin/jogos" element={<AdminJogos />} />
            <Route path="/admin/jogos/novo" element={<FormularioJogo />} />
            <Route path="/admin/jogos/:id/editar" element={<FormularioJogo />} />
            <Route path="/admin/plataformas" element={<AdminPlataformas />} />
            <Route path="/admin/generos" element={<AdminGeneros />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
          </Route>
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
