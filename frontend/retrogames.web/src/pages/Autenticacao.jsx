import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import fundoHero from '../assets/arcade/background-hero-inicio.png'
import { obterErrosDosCampos, obterMensagemErro } from '../api/erros'
import { useAutenticacao } from '../contexts/AutenticacaoContext'

function MensagemCampo({ mensagem }) {
  return mensagem ? <small className="rg-form-erro">{mensagem}</small> : null
}

export function Autenticacao({ modo }) {
  const navegar = useNavigate()
  const localizacao = useLocation()
  const [parametros] = useSearchParams()
  const { entrar, cadastrar } = useAutenticacao()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [confirmacaoSenhaVisivel, setConfirmacaoSenhaVisivel] = useState(false)
  const cadastro = modo === 'cadastro'

  function destinoAposAutenticacao(usuario) {
    const voltarPara = parametros.get('voltarPara')
    if (voltarPara?.startsWith('/') && !voltarPara.startsWith('//')) return voltarPara
    return usuario.perfil === 'Administrador' ? '/admin' : '/inicio'
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setErrosCampos({})
    const dados = new FormData(evento.currentTarget)
    const senha = String(dados.get('senha') ?? '')

    if (cadastro && senha !== String(dados.get('confirmacaoSenha') ?? '')) {
      setErrosCampos({ confirmacaoSenha: ['As senhas devem ser iguais.'] })
      return
    }

    setEnviando(true)
    try {
      const usuario = cadastro
        ? await cadastrar({
          nome: String(dados.get('nome') ?? ''),
          email: String(dados.get('email') ?? ''),
          senha,
        })
        : await entrar({ email: String(dados.get('email') ?? ''), senha })
      navegar(destinoAposAutenticacao(usuario), { replace: true })
    } catch (error) {
      setErrosCampos(obterErrosDosCampos(error))
      setErro(obterMensagemErro(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="rg-autenticacao" aria-labelledby="titulo-autenticacao">
      <img className="rg-autenticacao-fundo" src={fundoHero} alt="" aria-hidden="true" />
      <div className="rg-autenticacao-sombra" aria-hidden="true" />
      <div className="rg-autenticacao-cartao">
        <span className="rg-autenticacao-icone" aria-hidden="true">🎮</span>
        <h1 id="titulo-autenticacao">{cadastro ? 'Criar sua conta' : 'Bem-vindo de volta!'}</h1>
        <p>
          {cadastro
            ? 'Cadastre-se para acompanhar seus pedidos e salvar seus favoritos.'
            : 'Faça login para continuar sua jornada no mundo dos games.'}
        </p>

        <form onSubmit={aoEnviar} noValidate>
          {cadastro && (
            <label className="rg-form-campo">
              <span>Nome de usuário</span>
              <input name="nome" autoComplete="name" placeholder="Como podemos chamar você?" />
              <MensagemCampo mensagem={errosCampos.nome?.[0]} />
            </label>
          )}
          <label className="rg-form-campo">
            <span>E-mail</span>
            <input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />
            <MensagemCampo mensagem={errosCampos.email?.[0]} />
          </label>
          <label className="rg-form-campo">
            <span>Senha</span>
            <span className="rg-form-senha">
              <input name="senha" type={senhaVisivel ? 'text' : 'password'} autoComplete={cadastro ? 'new-password' : 'current-password'} placeholder="Sua senha" />
              <button type="button" onClick={() => setSenhaVisivel((visivel) => !visivel)} aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}>{senhaVisivel ? '◉' : '◌'}</button>
            </span>
            <MensagemCampo mensagem={errosCampos.senha?.[0]} />
          </label>
          {cadastro && (
            <label className="rg-form-campo">
              <span>Confirmar senha</span>
              <span className="rg-form-senha">
                <input name="confirmacaoSenha" type={confirmacaoSenhaVisivel ? 'text' : 'password'} autoComplete="new-password" placeholder="Repita a senha" />
                <button type="button" onClick={() => setConfirmacaoSenhaVisivel((visivel) => !visivel)} aria-label={confirmacaoSenhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}>{confirmacaoSenhaVisivel ? '◉' : '◌'}</button>
              </span>
              <MensagemCampo mensagem={errosCampos.confirmacaoSenha?.[0]} />
            </label>
          )}

          {erro && <p className="rg-form-alerta" role="alert">{erro}</p>}
          <button className="rg-btn-primary rg-autenticacao-enviar" disabled={enviando} type="submit">
            {enviando ? 'Aguarde...' : cadastro ? 'Cadastrar' : 'Entrar'} <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="rg-autenticacao-alternar">
          {cadastro ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
          <Link to={cadastro ? '/login' : `/cadastrar${localizacao.search}`}>{cadastro ? 'Fazer login' : 'Cadastre-se'}</Link>
        </p>
      </div>
    </section>
  )
}
