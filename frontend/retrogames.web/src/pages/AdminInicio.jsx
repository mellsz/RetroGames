import { Link } from 'react-router-dom'

export function AdminInicio() {
  return (
    <section className="rg-admin-pagina rg-pagina-enter">
      <div className="rg-admin-topo">
        <p className="rg-admin-etiqueta">Painel administrativo</p>
        <Link className="rg-admin-voltar" to="/inicio">← Voltar à loja</Link>
      </div>
      <h1>Bem-vindo à RetroGames!</h1>
      <p className="rg-admin-intro">Gerencie o catálogo e mantenha sua loja atualizada.</p>
      <div className="rg-admin-atalhos">
        <article>
          <h2>Jogos</h2>
          <p>Consulte, cadastre, edite ou desative jogos do catálogo.</p>
          <Link className="rg-btn-primary" to="/admin/jogos">Gerenciar jogos</Link>
        </article>
        <article>
          <h2>Plataformas</h2>
          <p>Inclua, altere ou remova as plataformas cadastradas.</p>
          <Link className="rg-btn-primary" to="/admin/plataformas">Gerenciar plataformas</Link>
        </article>
        <article><h2>Gêneros</h2><p>Cadastre e organize os gêneros do catálogo.</p><Link className="rg-btn-primary" to="/admin/generos">Gerenciar gêneros</Link></article>
        <article><h2>Pedidos</h2><p>Consulte pedidos e atualize a situação de cada compra.</p><Link className="rg-btn-primary" to="/admin/pedidos">Gerenciar pedidos</Link></article>
      </div>
      <div className="rg-admin-acoes-rapidas">
        <strong>Ações rápidas</strong>
        <Link to="/admin/jogos/novo">Cadastrar novo jogo</Link>
        <Link to="/admin/plataformas">Cadastrar plataforma</Link>
      </div>
    </section>
  )
}
