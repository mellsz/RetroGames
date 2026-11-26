import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jogoApi } from '../api/servicos'
import fundoHero from '../assets/arcade/background-hero-inicio.png'
import { IconeCarrinho } from '../components/IconesNavbar'
import { formatarPreco } from '../lib/formato'

const TAMANHO_LOTE = 50
const TITULOS_DESTAQUE = [
  'Super Mario Bros.',
  'The Legend of Zelda',
  'Sonic the Hedgehog 2',
  'Mega Man 2',
]
const TITULOS_NOVIDADES = [
  'Streets of Rage 2',
  'Phantasy Star IV',
  'Castlevania: Symphony of the Night',
  'Final Fantasy VII',
]
const TITULOS_TESOUROS = [
  'Mario Kart 64',
  'Super Mario 64',
  'Chrono Trigger',
  'Super Metroid',
]
const DESTAQUES_LOCAIS = [
  {
    id: 1,
    nome: 'Super Mario Bros.',
    descricao: 'Clássico de plataforma da Nintendo.',
    nomePlataforma: 'Nintendo Entertainment System',
    anoLancamento: 1985,
    preco: 189.9,
    estoque: 4,
    descricaoCondicao: 'Usado',
    generos: ['Plataforma', 'Ação'],
  },
  {
    id: 2,
    nome: 'The Legend of Zelda',
    descricao: 'Aventura clássica em Hyrule.',
    nomePlataforma: 'Nintendo Entertainment System',
    anoLancamento: 1986,
    preco: 219.9,
    estoque: 3,
    descricaoCondicao: 'Usado',
    generos: ['Aventura', 'Ação'],
  },
  {
    id: 8,
    nome: 'Sonic the Hedgehog 2',
    descricao: 'Aventura de plataforma com Sonic e Tails.',
    nomePlataforma: 'Mega Drive',
    anoLancamento: 1992,
    preco: 179.9,
    estoque: 4,
    descricaoCondicao: 'Usado',
    generos: ['Plataforma', 'Ação'],
  },
  {
    id: 3,
    nome: 'Mega Man 2',
    descricao: 'Ação e plataforma da série Mega Man.',
    nomePlataforma: 'Nintendo Entertainment System',
    anoLancamento: 1988,
    preco: 199.9,
    estoque: 2,
    descricaoCondicao: 'Recondicionado',
    generos: ['Ação', 'Plataforma'],
  },
]
const NOVIDADES_LOCAIS = [
  {
    id: 9,
    nome: 'Streets of Rage 2',
    descricao: 'Ação cooperativa nas ruas de Wood Oak City.',
    nomePlataforma: 'Mega Drive',
    anoLancamento: 1992,
    preco: 219.9,
    estoque: 2,
    descricaoCondicao: 'Usado',
    generos: ['Ação', 'Luta'],
  },
  {
    id: 10,
    nome: 'Phantasy Star IV',
    descricao: 'RPG da série Phantasy Star.',
    nomePlataforma: 'Mega Drive',
    anoLancamento: 1993,
    preco: 349.9,
    estoque: 1,
    descricaoCondicao: 'Usado',
    generos: ['RPG'],
  },
  {
    id: 11,
    nome: 'Castlevania: Symphony of the Night',
    descricao: 'Ação e aventura no castelo de Drácula.',
    nomePlataforma: 'PlayStation',
    anoLancamento: 1997,
    preco: 329.9,
    estoque: 1,
    descricaoCondicao: 'Usado',
    generos: ['Ação', 'Aventura', 'RPG'],
  },
  {
    id: 12,
    nome: 'Final Fantasy VII',
    descricao: 'RPG da série Final Fantasy.',
    nomePlataforma: 'PlayStation',
    anoLancamento: 1997,
    preco: 199.9,
    estoque: 3,
    descricaoCondicao: 'Usado',
    generos: ['RPG'],
  },
]
const TESOUROS_LOCAIS = [
  {
    id: 17,
    nome: 'Mario Kart 64',
    descricao: 'Corridas com personagens do universo Mario.',
    nomePlataforma: 'Nintendo 64',
    anoLancamento: 1996,
    preco: 249.9,
    estoque: 3,
    descricaoCondicao: 'Usado',
    generos: ['Corrida'],
  },
  {
    id: 15,
    nome: 'Super Mario 64',
    descricao: 'Aventura de plataforma em três dimensões.',
    nomePlataforma: 'Nintendo 64',
    anoLancamento: 1996,
    preco: 279.9,
    estoque: 2,
    descricaoCondicao: 'Usado',
    generos: ['Plataforma', 'Aventura'],
  },
  {
    id: 5,
    nome: 'Chrono Trigger',
    descricao: 'RPG com viagens no tempo.',
    nomePlataforma: 'Super Nintendo Entertainment System',
    anoLancamento: 1995,
    preco: 399.9,
    estoque: 1,
    descricaoCondicao: 'Usado',
    generos: ['RPG', 'Aventura'],
  },
  {
    id: 6,
    nome: 'Super Metroid',
    descricao: 'Aventura de ação no planeta Zebes.',
    nomePlataforma: 'Super Nintendo Entertainment System',
    anoLancamento: 1994,
    preco: 279.9,
    estoque: 2,
    descricaoCondicao: 'Usado',
    generos: ['Ação', 'Aventura'],
  },
]
const JOGO_EM_DESTAQUE_LOCAL = {
  id: 13,
  nome: 'Tekken 3',
  descricao: 'Jogo de luta da série Tekken.',
  nomePlataforma: 'PlayStation',
  anoLancamento: 1998,
  preco: 159.9,
  estoque: 2,
  descricaoCondicao: 'Usado',
  generos: ['Luta'],
}
const PERGUNTAS_FREQUENTES = [
  {
    pergunta: 'Como sei se um jogo está disponível?',
    resposta: 'Os cards do catálogo mostram o status de cada jogo. Também é possível conferir a disponibilidade na página de detalhes do título.',
  },
  {
    pergunta: 'Como descubro para qual console é o jogo?',
    resposta: 'A plataforma aparece identificada no card e nos detalhes do jogo. No catálogo, você também pode filtrar os títulos por plataforma.',
  },
  {
    pergunta: 'Qual é a condição dos jogos?',
    resposta: 'A condição de cada item é informada na página de detalhes, junto com as outras informações do produto.',
  },
  {
    pergunta: 'Como funciona o frete grátis?',
    resposta: 'A promoção de frete grátis vale para compras acima de R$ 200. Consulte as condições e o prazo de entrega durante a finalização do pedido.',
  },
  {
    pergunta: 'Como adiciono um jogo ao carrinho?',
    resposta: 'Abra o jogo pelo catálogo e use a opção de adicionar ao carrinho. Você pode conferir seus itens no ícone do carrinho na navegação.',
  },
  {
    pergunta: 'Os jogos são verificados antes de serem anunciados?',
    resposta: 'Sim. A RetroGames prioriza clássicos testados e prontos para jogar; cada anúncio também informa a condição do item.',
  },
  {
    pergunta: 'E se eu não encontrar o que procuro?',
    resposta: 'Envie uma mensagem pelo formulário abaixo. Conte qual jogo ou plataforma está procurando e nossa equipe poderá orientar você.',
  },
]

const FAQ_PIXEL_COLUNAS = 320
const FAQ_PIXEL_DENSIDADE = [0.84, 0.62, 0.4, 0.2]
const FAQ_PIXEL_OPACIDADE = [0.9, 0.74, 0.56, 0.38]
const FAQ_PIXELS = Array.from({ length: FAQ_PIXEL_COLUNAS * FAQ_PIXEL_DENSIDADE.length }, (_, indice) => {
  const coluna = indice % FAQ_PIXEL_COLUNAS
  const linha = Math.floor(indice / FAQ_PIXEL_COLUNAS)
  const ruidoDeGrupo = Math.sin((Math.floor(coluna / 4) + 1) * 127.1 + (linha + 1) * 311.7) * 43758.5453
  const ruidoLocal = Math.sin((coluna + 1) * 269.5 + (linha + 1) * 183.3) * 24634.6345
  const valorDeGrupo = ruidoDeGrupo - Math.floor(ruidoDeGrupo)
  const valorLocal = ruidoLocal - Math.floor(ruidoLocal)
  const preenchimento = valorDeGrupo * 0.75 + valorLocal * 0.25

  if (preenchimento >= FAQ_PIXEL_DENSIDADE[linha]) return null

  return {
    coluna,
    linha,
    opacidade: Math.max(0.2, FAQ_PIXEL_OPACIDADE[linha] + (valorLocal - 0.5) * 0.12),
  }
}).filter(Boolean)

const arquivosCapas = import.meta.glob('../assets/jogos/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

function normalizarNome(valor) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function obterCapa(jogo) {
  const capasExatas = {
    [normalizarNome('Super Mario Bros.')]: 'Super_Mario_Bros._box_nintendo.png',
    [normalizarNome('Tekken 3')]: 'Tekken_3_capa_playstation.png',
    [normalizarNome('The Legend of Zelda')]: 'The_Legend_of_Zelda_1_capa_nintendo.png',
    [normalizarNome('Sonic the Hedgehog 2')]: 'Sonic_Megadrive.jpg',
    [normalizarNome('Mega Man 2')]: 'Megaman2_box_Nintendo.jpg',
    [normalizarNome('Phantasy Star IV')]: 'Phantasy_Star_EotM_cover_MegaDrive.jpg',
    [normalizarNome('Mario Kart 64')]: 'Mario_Kart_64_nintendo64.jpg',
    [normalizarNome('Super Mario 64')]: 'Super_Mario_64_front_nintendo64.jpg',
    [normalizarNome('Chrono Trigger')]: 'Chrono_Trigger_SuperNintendo.jpg',
    [normalizarNome('Super Metroid')]: 'Super_Metroid_SuperNintendo.jpg',
  }
  const arquivo = capasExatas[normalizarNome(jogo.nome)]
    ?? Object.keys(arquivosCapas).find((caminho) => normalizarNome(caminho.split('/').pop()).includes(normalizarNome(jogo.nome)))

  return arquivo
    ? Object.entries(arquivosCapas).find(([caminho]) => caminho.endsWith(arquivo))?.[1]
      ?? arquivosCapas[arquivo]
    : undefined
}

function CartaoJogoInicio({ jogo }) {
  const capa = obterCapa(jogo)

  return (
    <article className="rg-inicio-jogo">
      <div className="rg-inicio-jogo-capa">
        {capa ? (
          <img src={capa} alt={`Capa de ${jogo.nome}`} loading="lazy" />
        ) : (
          <span className="rg-inicio-jogo-sem-capa">{jogo.nome}</span>
        )}
        <div className="rg-inicio-jogo-etiquetas">
          <span className="rg-badge-plataforma">{jogo.nomePlataforma}</span>
          {jogo.estoque <= 0 ? (
            <span className="rg-badge-esgotado">ESGOTADO</span>
          ) : (
            <span className="rg-badge-disponivel">Disponível</span>
          )}
        </div>
      </div>
      <div className="rg-inicio-jogo-conteudo">
        <p className="rg-inicio-jogo-genero">{jogo.generos?.[0] ?? 'Clássico'} · {jogo.anoLancamento}</p>
        <h3>{jogo.nome}</h3>
        <div className="rg-inicio-jogo-rodape">
          <strong className="rg-preco">{formatarPreco(jogo.preco)}</strong>
          <Link to={`/jogos/${jogo.id}`} className="rg-inicio-jogo-detalhes">
            Ver detalhes <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

function FaixaPixelsFaq({ posicao }) {
  return (
    <div className={`rg-inicio-faq-pixel-banda rg-inicio-faq-pixel-banda--${posicao}`} aria-hidden="true">
      {FAQ_PIXELS.map(({ coluna, linha, opacidade }) => (
        <i
          key={`${coluna}-${linha}`}
          style={{ gridColumnStart: coluna + 1, gridRowStart: linha + 2, opacity: opacidade }}
        />
      ))}
    </div>
  )
}

function ordenarDestaques(jogos) {
  const selecionados = TITULOS_DESTAQUE
    .map((titulo) => jogos.find((jogo) => normalizarNome(jogo.nome) === normalizarNome(titulo)))
    .filter(Boolean)
  const idsSelecionados = new Set(selecionados.map((jogo) => jogo.id))
  return [...selecionados, ...jogos.filter((jogo) => !idsSelecionados.has(jogo.id))].slice(0, 4)
}

function ordenarNovidades(jogos) {
  const idsDestaques = new Set(TITULOS_DESTAQUE
    .map((titulo) => jogos.find((jogo) => normalizarNome(jogo.nome) === normalizarNome(titulo)))
    .filter(Boolean)
    .map((jogo) => jogo.id))
  const selecionados = TITULOS_NOVIDADES
    .map((titulo) => jogos.find((jogo) => normalizarNome(jogo.nome) === normalizarNome(titulo)))
    .filter(Boolean)
  const idsSelecionados = new Set(selecionados.map((jogo) => jogo.id))
  const restantes = jogos.filter((jogo) => !idsDestaques.has(jogo.id) && !idsSelecionados.has(jogo.id))

  return [...selecionados, ...restantes].slice(0, 4)
}

function ordenarTesouros(jogos) {
  return TITULOS_TESOUROS
    .map((titulo) => jogos.find((jogo) => normalizarNome(jogo.nome) === normalizarNome(titulo)))
    .filter(Boolean)
}

function atualizarInclinacaoBeneficio(event) {
  if (event.pointerType !== 'mouse') return

  const cartao = event.currentTarget
  const limites = cartao.getBoundingClientRect()
  const posicaoX = (event.clientX - limites.left) / limites.width
  const posicaoY = (event.clientY - limites.top) / limites.height

  cartao.style.setProperty('--rg-beneficio-tilt-x', `${(0.5 - posicaoY) * 8}deg`)
  cartao.style.setProperty('--rg-beneficio-tilt-y', `${(posicaoX - 0.5) * 8}deg`)
  cartao.style.setProperty('--rg-beneficio-luz-x', `${posicaoX * 100}%`)
  cartao.style.setProperty('--rg-beneficio-luz-y', `${posicaoY * 100}%`)
}

function resetarInclinacaoBeneficio(event) {
  const cartao = event.currentTarget
  cartao.style.setProperty('--rg-beneficio-tilt-x', '0deg')
  cartao.style.setProperty('--rg-beneficio-tilt-y', '0deg')
  cartao.style.setProperty('--rg-beneficio-luz-x', '50%')
  cartao.style.setProperty('--rg-beneficio-luz-y', '50%')
}

export function Inicio() {
  const [destaques, setDestaques] = useState(DESTAQUES_LOCAIS)
  const [novidades, setNovidades] = useState(NOVIDADES_LOCAIS)
  const [tesouros, setTesouros] = useState(TESOUROS_LOCAIS)
  const [jogoEmDestaque, setJogoEmDestaque] = useState(JOGO_EM_DESTAQUE_LOCAL)
  const [rolando, setRolando] = useState(window.scrollY > 24)
  const [perguntasAbertas, setPerguntasAbertas] = useState({})
  const capaDoJogoEmDestaque = obterCapa(jogoEmDestaque)

  useEffect(() => {
    function acompanharRolagem() {
      setRolando(window.scrollY > 24)
    }

    window.addEventListener('scroll', acompanharRolagem, { passive: true })
    return () => window.removeEventListener('scroll', acompanharRolagem)
  }, [])
  useEffect(() => {
    let ativo = true

    async function carregarDestaques() {
      try {
        const pagina = await jogoApi.listar({ pagina: 1, tamanhoPagina: TAMANHO_LOTE })
        const jogos = [...pagina.itens]

        for (let numeroPagina = 2; numeroPagina <= pagina.totalPaginas; numeroPagina += 1) {
          const proximaPagina = await jogoApi.listar({ pagina: numeroPagina, tamanhoPagina: TAMANHO_LOTE })
          jogos.push(...proximaPagina.itens)
        }

        if (ativo) {
          setDestaques(ordenarDestaques(jogos))
          setNovidades(ordenarNovidades(jogos))
          const tesourosDoCatalogo = ordenarTesouros(jogos)
          if (tesourosDoCatalogo.length === TITULOS_TESOUROS.length) {
            setTesouros(tesourosDoCatalogo)
          }
          const tekken = jogos.find(
            (jogo) => normalizarNome(jogo.nome) === normalizarNome('Tekken 3'),
          )
          if (tekken) setJogoEmDestaque(tekken)
        }
      } catch {
        // Os destaques locais mantêm a página preenchida enquanto a API não responde.
      }
    }

    carregarDestaques()
    return () => {
      ativo = false
    }
  }, [])

  return (
    <section className={`rg-pagina-enter rg-inicio ${rolando ? 'rg-inicio--rolando' : ''}`}>
      <div className="rg-hero-inicio">
        <img src={fundoHero} alt="" className="rg-hero-inicio-fundo" aria-hidden="true" />
        <div className="rg-hero-inicio-conteudo">
          <p className="rg-hero-inicio-chamada"><span aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m5 3 5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Retro Games · Testados · Prontos para jogar</p>
          <h1 className="rg-hero-inicio-titulo">
            <span>Os clássicos<br />da sua infância<br />merecem</span>
            <strong>mais uma<br />partida</strong>
          </h1>
          <p className="rg-hero-inicio-descricao">
            Confira nossa coleção de clássicos e embarque nessa nostalgia.
          </p>
          <div className="rg-hero-inicio-acoes">
            <Link to="/" className="rg-hero-inicio-botao">
              Explorar Catálogo
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/sobre" className="rg-hero-inicio-sobre">
              <span className="rg-hero-inicio-sobre-icone" aria-hidden="true">
                <svg viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32">
                  <path d="M64 256c0 106 86 192 192 192s192-86 192-192S362 64 256 64 64 150 64 256Z" strokeMiterlimit="10" />
                  <path d="m216 352 96-96-96-96" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Sobre nós
            </Link>
          </div>
        </div>
      </div>
      <a className="rg-hero-inicio-rolagem" href="#destaques" aria-label="Rolar para os clássicos em destaque">
        <span className="rg-hero-inicio-mouse" aria-hidden="true"><i /></span>
        <span className="rg-hero-inicio-seta" aria-hidden="true" />
      </a>

      <div className="rg-inicio-faixa-promocional" aria-label="Promoções da RetroGames">
        <div className="rg-inicio-faixa-trilho">
          {[0, 1].map((grupo) => (
            <div className="rg-inicio-faixa-grupo bebas-neue-regular" key={grupo} aria-hidden={grupo === 1}>
              <span>Novidades toda semana</span><i>★</i>
              <span>Use nosso cupom e ganhe 10% de desconto</span><i>★</i>
              <span>Insira uma moeda</span><i>★</i>
              <span>Frete grátis acima de R$ 200</span><i>★</i>
              <span>Clássicos testados e prontos para jogar</span><i>★</i>
            </div>
          ))}
        </div>
      </div>

      <section id="destaques" className="rg-inicio-semana" aria-labelledby="titulo-destaques">
        <div className="rg-inicio-semana-cabecalho">
          <div className="rg-inicio-semana-titulos">
            <p className="rg-inicio-semana-etiqueta">Mais procurados</p>
            <h2 id="titulo-destaques">Clássicos em destaque</h2>
          </div>
          <Link to="/" className="rg-inicio-ver-todos">
            Ver todos <span aria-hidden="true">➜</span>
          </Link>
        </div>
        {destaques.length > 0 && (
          <div className="rg-inicio-jogos">
            {destaques.map((jogo) => (
              <CartaoJogoInicio key={jogo.id} jogo={jogo} />
            ))}
          </div>
        )}
      </section>

      <section id="novidades" className="rg-inicio-semana rg-inicio-semana--novidades" aria-labelledby="titulo-novidades">
        <div className="rg-inicio-semana-cabecalho">
          <div className="rg-inicio-semana-titulos">
            <p className="rg-inicio-semana-etiqueta">Acabaram de chegar</p>
            <h2 id="titulo-novidades">Novidades</h2>
          </div>
          <Link to="/" className="rg-inicio-ver-todos">
            Ver todos <span aria-hidden="true">➜</span>
          </Link>
        </div>
        {novidades.length > 0 && (
          <div className="rg-inicio-jogos">
            {novidades.map((jogo) => (
              <CartaoJogoInicio key={jogo.id} jogo={jogo} />
            ))}
          </div>
        )}
      </section>

      <section className="rg-inicio-destaque" aria-labelledby="titulo-jogo-em-destaque">
        <div className="rg-inicio-destaque-capa">
          {capaDoJogoEmDestaque ? (
            <img
              src={capaDoJogoEmDestaque}
              alt={`Capa de ${jogoEmDestaque.nome}`}
              loading="lazy"
            />
          ) : (
            <span className="rg-inicio-jogo-sem-capa">{jogoEmDestaque.nome}</span>
          )}
          <span className="rg-inicio-destaque-selo">Destaque da semana</span>
        </div>

        <div className="rg-inicio-destaque-conteudo">
          <div className="rg-inicio-destaque-meta">
            <p className="rg-inicio-destaque-etiqueta">
              {[jogoEmDestaque.generos?.[0], jogoEmDestaque.anoLancamento, jogoEmDestaque.nomePlataforma]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {jogoEmDestaque.estoque > 0 ? (
              <span className="rg-badge-disponivel">Disponível</span>
            ) : (
              <span className="rg-badge-esgotado">Esgotado</span>
            )}
          </div>
          <h2 id="titulo-jogo-em-destaque">{jogoEmDestaque.nome}</h2>
          <p className="rg-inicio-destaque-descricao">
            {jogoEmDestaque.descricao?.trim() || 'Descrição não cadastrada para este jogo.'}
          </p>

          <div className="rg-inicio-destaque-compra">
            <div className="rg-inicio-destaque-preco">
              <span>Por</span>
              <strong>{formatarPreco(jogoEmDestaque.preco)}</strong>
            </div>
            <button
              type="button"
              className="rg-inicio-destaque-botao"
              disabled={jogoEmDestaque.estoque <= 0}
            >
              {jogoEmDestaque.estoque <= 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
              <IconeCarrinho />
            </button>
          </div>
        </div>
      </section>

      <section className="rg-inicio-semana rg-inicio-semana--tesouros" aria-labelledby="titulo-tesouros">
        <div className="rg-inicio-semana-cabecalho">
          <div className="rg-inicio-semana-titulos">
            <p className="rg-inicio-semana-etiqueta">Jogos clássicos e raridades</p>
            <h2 id="titulo-tesouros">Tesouros do Arcade</h2>
          </div>
          <Link to="/" className="rg-inicio-ver-todos">
            Ver todos <span aria-hidden="true">➜</span>
          </Link>
        </div>
        {tesouros.length > 0 && (
          <div className="rg-inicio-jogos">
            {tesouros.map((jogo) => (
              <CartaoJogoInicio key={jogo.id} jogo={jogo} />
            ))}
          </div>
        )}
      </section>

      <section className="rg-inicio-beneficios" aria-labelledby="titulo-beneficios">
        <header className="rg-inicio-beneficios-cabecalho">
          <p className="rg-inicio-beneficios-sobre">Sobre a RetroGames</p>
          <h2 id="titulo-beneficios">Por que escolher a RetroGames?</h2>
          <span className="rg-inicio-beneficios-sublinhado" aria-hidden="true" />
          <p className="rg-inicio-beneficios-descricao">
            Mais do que jogos, uma viagem por gerações de histórias e aventuras.
          </p>
        </header>

        <div className="rg-inicio-beneficios-grade">
          <article className="rg-inicio-beneficio" onPointerMove={atualizarInclinacaoBeneficio} onPointerLeave={resetarInclinacaoBeneficio}>
            <span className="rg-inicio-beneficio-icone rg-inicio-beneficio-icone--classicos" aria-hidden="true" />
            <h3>Clássicos inesquecíveis</h3>
            <p>Reviva jogos que marcaram gerações e fizeram história.</p>
          </article>
          <article className="rg-inicio-beneficio" onPointerMove={atualizarInclinacaoBeneficio} onPointerLeave={resetarInclinacaoBeneficio}>
            <span className="rg-inicio-beneficio-icone rg-inicio-beneficio-icone--plataformas" aria-hidden="true" />
            <h3>Diversidade de plataformas</h3>
            <p>Explore jogos de diferentes consoles e gerações.</p>
          </article>
          <article className="rg-inicio-beneficio" onPointerMove={atualizarInclinacaoBeneficio} onPointerLeave={resetarInclinacaoBeneficio}>
            <span className="rg-inicio-beneficio-icone rg-inicio-beneficio-icone--aventuras" aria-hidden="true" />
            <h3>Descubra novas aventuras</h3>
            <p>Encontre títulos, gêneros e experiências para explorar.</p>
          </article>
          <article className="rg-inicio-beneficio" onPointerMove={atualizarInclinacaoBeneficio} onPointerLeave={resetarInclinacaoBeneficio}>
            <span className="rg-inicio-beneficio-icone rg-inicio-beneficio-icone--nostalgia" aria-hidden="true" />
            <h3>Nostalgia em cada jogo</h3>
            <p>Uma experiência dedicada aos apaixonados pelo universo.</p>
          </article>
        </div>
      </section>

      <section className="rg-inicio-faq" aria-labelledby="titulo-inicio-faq">
        <header className="rg-inicio-faq-cabecalho">
          <p className="rg-inicio-faq-etiqueta">Central do jogador</p>
          <h2 id="titulo-inicio-faq" className="rg-inicio-faq-titulo">
            A gente entende<br />de <span>retrô</span>
          </h2>
          <div className="rg-inicio-faq-pacman-trilha" aria-hidden="true">
            <span className="rg-inicio-faq-pacman-pontos">
              {Array.from({ length: 30 }, (_, indice) => <i key={indice} />)}
            </span>
            <span className="rg-inicio-faq-pacman" />
          </div>
          <p className="rg-inicio-faq-subtitulo">
            Tire suas dúvidas e aproveite cada clássico com tranquilidade.
          </p>
        </header>

        <div className="rg-inicio-faq-lista-area">
          <div className="rg-inicio-faq-lista-titulo">
            <h3>Perguntas frequentes</h3>
            <span aria-hidden="true" />
          </div>
          <div className="rg-inicio-faq-lista">
            {PERGUNTAS_FREQUENTES.map(({ pergunta, resposta }, indice) => {
              const aberta = Boolean(perguntasAbertas[pergunta])
              const idPergunta = `inicio-faq-pergunta-${indice}`
              const idResposta = `inicio-faq-resposta-${indice}`

              return (
                <article
                  className={`rg-inicio-faq-item${aberta ? ' rg-inicio-faq-item--aberto' : ''}`}
                  key={pergunta}
                >
                  <button
                    id={idPergunta}
                    type="button"
                    className="rg-inicio-faq-pergunta"
                    aria-expanded={aberta}
                    aria-controls={idResposta}
                    onClick={() => setPerguntasAbertas((atuais) => ({
                      ...atuais,
                      [pergunta]: !atuais[pergunta],
                    }))}
                  >
                    <span>{pergunta}</span>
                    <i aria-hidden="true" />
                  </button>
                  <div
                    id={idResposta}
                    className="rg-inicio-faq-resposta"
                    role="region"
                    aria-labelledby={idPergunta}
                    aria-hidden={!aberta}
                  >
                    <p>{resposta}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="rg-inicio-faq-cenario">
          <FaixaPixelsFaq posicao="topo" />
          <div className="rg-inicio-faq-formulario">
            <p className="rg-inicio-faq-formulario-etiqueta">Suporte ao jogador</p>
            <h3>Fale conosco</h3>
            <p className="rg-inicio-faq-formulario-intro">
              Ficou com alguma dúvida? Mande uma mensagem para a equipe RetroGames.
            </p>
            <form action="mailto:atendimento@retrogames.local?subject=Contato%20pelo%20site" method="post" encType="text/plain">
              <div className="rg-inicio-faq-formulario-campos">
                <label>
                  <span>Seu nome</span>
                  <input type="text" name="Nome" placeholder="Como podemos chamar você?" autoComplete="name" required />
                </label>
                <label>
                  <span>Seu e-mail</span>
                  <input type="email" name="E-mail" placeholder="voce@exemplo.com" autoComplete="email" required />
                </label>
              </div>
              <label className="rg-inicio-faq-formulario-mensagem">
                <span>Sua mensagem</span>
                <textarea name="Mensagem" rows="4" placeholder="Escreva sua dúvida ou mensagem..." required />
              </label>
              <button type="submit" className="rg-inicio-faq-enviar">Enviar mensagem</button>
            </form>
          </div>
          <FaixaPixelsFaq posicao="base" />
        </div>
      </section>
    </section>
  )
}
