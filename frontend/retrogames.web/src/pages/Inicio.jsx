import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jogoApi } from '../api/servicos'
import fundoHero from '../assets/arcade/background-hero-inicio.png'
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
    [normalizarNome('The Legend of Zelda')]: 'The_Legend_of_Zelda_1_capa_nintendo.png',
    [normalizarNome('Sonic the Hedgehog 2')]: 'Sonic_Megadrive.jpg',
    [normalizarNome('Mega Man 2')]: 'Megaman2_box_Nintendo.jpg',
    [normalizarNome('Phantasy Star IV')]: 'Phantasy_Star_EotM_cover_MegaDrive.jpg',
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

export function Inicio() {
  const [destaques, setDestaques] = useState(DESTAQUES_LOCAIS)
  const [novidades, setNovidades] = useState(NOVIDADES_LOCAIS)
  const [rolando, setRolando] = useState(window.scrollY > 24)

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
    </section>
  )
}
