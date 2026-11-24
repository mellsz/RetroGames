import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { IntroArcade } from './components/IntroArcade'
import { Layout } from './components/Layout'
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
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
