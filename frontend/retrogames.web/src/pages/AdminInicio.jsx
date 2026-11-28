import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import iconeAdicionar from '../assets/admin-icons/add-outline.svg'
import iconeControle from '../assets/admin-icons/game-controller-outline.svg'
import iconeCamadas from '../assets/admin-icons/layers-outline.svg'
import iconeCubo from '../assets/admin-icons/cube-outline.svg'
import iconeEnergia from '../assets/admin-icons/power-outline.svg'
import iconePincel from '../assets/admin-icons/pencil-outline.svg'
import { jogoApi, plataformaApi } from '../api/servicos'

const gestoesPrincipais = [
  { nome: 'Jogos', descricao: 'Consulte, cadastre, edite ou desative jogos do catálogo.', destino: '/admin/jogos', acao: 'Gerenciar jogos', iconeClasse: 'rg-admin-dashboard-pixel-icone--classicos', classe: 'rg-admin-dashboard-card--jogos' },
  { nome: 'Plataformas', descricao: 'Inclua, altere ou remova as plataformas cadastradas.', destino: '/admin/plataformas', acao: 'Gerenciar plataformas', iconeClasse: 'rg-admin-dashboard-pixel-icone--plataformas', classe: 'rg-admin-dashboard-card--plataformas' },
]

export function AdminInicio() {
  const [resumo, setResumo] = useState({ totalJogos: '—', plataformas: '—', semEstoque: '—', inativos: '—' })

  useEffect(() => {
    let ativo = true

    async function carregarResumo() {
      try {
        const primeiraPagina = await jogoApi.listar({ pagina: 1, tamanhoPagina: 50, incluirInativos: true })
        const paginasRestantes = Array.from({ length: Math.max(0, primeiraPagina.totalPaginas - 1) }, (_, indice) =>
          jogoApi.listar({ pagina: indice + 2, tamanhoPagina: 50, incluirInativos: true }))
        const [paginas, plataformas] = await Promise.all([Promise.all(paginasRestantes), plataformaApi.listar()])
        const jogos = [primeiraPagina, ...paginas].flatMap((pagina) => pagina.itens)
        if (!ativo) return
        setResumo({
          totalJogos: jogos.filter((jogo) => jogo.ativo).length,
          plataformas: plataformas.length,
          semEstoque: jogos.filter((jogo) => jogo.ativo && jogo.estoque <= 0).length,
          inativos: jogos.filter((jogo) => !jogo.ativo).length,
        })
      } catch {
        // O dashboard continua navegável mesmo quando o resumo não puder ser carregado.
      }
    }

    carregarResumo()
    return () => { ativo = false }
  }, [])

  const indicadores = [
    { nome: 'Total de jogos', valor: resumo.totalJogos, icone: iconeControle, classe: 'rg-admin-dashboard-indicador--jogos' },
    { nome: 'Plataformas', valor: resumo.plataformas, icone: iconeCamadas, classe: 'rg-admin-dashboard-indicador--plataformas' },
    { nome: 'Sem estoque', valor: resumo.semEstoque, icone: iconeCubo, classe: 'rg-admin-dashboard-indicador--estoque' },
    { nome: 'Inativos', valor: resumo.inativos, icone: iconeEnergia, classe: 'rg-admin-dashboard-indicador--inativos' },
  ]

  return (
    <section className="rg-admin-dashboard rg-pagina-enter">
      <header className="rg-admin-dashboard-cabecalho">
        <div>
          <p className="rg-admin-etiqueta"><span>Painel administrativo</span></p>
          <span className="rg-admin-dashboard-etiqueta-linha" aria-hidden="true" />
          <h1>Bem-vindo à RetroGames!</h1>
          <p className="rg-admin-intro">Gerencie o catálogo e mantenha sua loja atualizada.</p>
        </div>
        <span className="rg-admin-pixel-rastro" aria-hidden="true" />
      </header>

      <div className="rg-admin-dashboard-layout">
        <div className="rg-admin-dashboard-conteudo">
          <div className="rg-admin-dashboard-destaques">
            {gestoesPrincipais.map((gestao) => (
              <article className={`rg-admin-dashboard-card ${gestao.classe}`} key={gestao.nome}>
                <div className="rg-admin-dashboard-card-icone"><span className={`rg-admin-dashboard-pixel-icone ${gestao.iconeClasse}`} aria-hidden="true" /></div>
                <div className="rg-admin-dashboard-card-conteudo">
                  <h2>{gestao.nome}</h2>
                  <p>{gestao.descricao}</p>
                  <Link className="rg-admin-dashboard-cta" to={gestao.destino}>{gestao.acao}<span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>

          <div className="rg-admin-dashboard-indicadores" aria-label="Visão geral do catálogo">
            {indicadores.map((indicador) => (
              <div className={`rg-admin-dashboard-indicador ${indicador.classe}`} key={indicador.nome}>
                <span className="rg-admin-dashboard-indicador-icone"><img src={indicador.icone} alt="" aria-hidden="true" /></span>
                <span><strong>{indicador.nome}</strong><b>{indicador.valor}</b></span>
              </div>
            ))}
          </div>

          <div className="rg-admin-dashboard-acoes">
            <h2><span>Menu</span></h2>
            <div>
              <Link to="/admin/jogos/novo"><img src={iconeAdicionar} alt="" aria-hidden="true" />Cadastrar novo jogo</Link>
              <Link to="/admin/plataformas"><img src={iconeCamadas} alt="" aria-hidden="true" />Cadastrar plataforma</Link>
              <Link to="/admin/generos"><img src={iconeCubo} alt="" aria-hidden="true" />Gerenciar gêneros</Link>
              <Link to="/admin/pedidos"><img src={iconeEnergia} alt="" aria-hidden="true" />Gerenciar pedidos</Link>
            </div>
          </div>
        </div>

        <aside className="rg-admin-dashboard-atividade" aria-labelledby="atividade-titulo">
          <div className="rg-admin-dashboard-atividade-cabecalho">
            <h2 id="atividade-titulo"><span className="rg-admin-dashboard-atividade-relogio" aria-hidden="true" />Atividade recente</h2>
            <span>Visão geral</span>
          </div>
          <div className="rg-admin-dashboard-atividade-vazia">
            <span className="rg-admin-dashboard-atividade-ponto" aria-hidden="true" />
            <strong>Seu painel está pronto</strong>
            <p>As alterações feitas nas gestões aparecerão aqui.</p>
          </div>
          <div className="rg-admin-dashboard-atividade-links">
            <Link to="/admin/generos"><span className="rg-admin-dashboard-atividade-icone"><img src={iconePincel} alt="" aria-hidden="true" /></span><span>Abrir gestão de gêneros</span><span aria-hidden="true">→</span></Link>
            <Link to="/admin/pedidos"><span className="rg-admin-dashboard-atividade-icone rg-admin-dashboard-atividade-icone--pedidos"><img src={iconeCamadas} alt="" aria-hidden="true" /></span><span>Abrir gestão de pedidos</span><span aria-hidden="true">→</span></Link>
          </div>
        </aside>
      </div>

    </section>
  )
}
