import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jogoApi } from '../api/servicos'
import fundoHero from '../assets/arcade/background-hero-inicio.webp'
import { formatarPreco } from '../lib/formato'

const TAMANHO_LOTE = 50
const TITULOS_DESTAQUE = [
  'Super Mario Bros.',
  'The Legend of Zelda',
  'Sonic the Hedgehog 2',
  'Mega Man 2',
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
  },
  { id: 2, nome: 'The Legend of Zelda' },
  { id: 8, nome: 'Sonic the Hedgehog 2' },
  { id: 3, nome: 'Mega Man 2' },
  { id: 6, nome: 'Super Metroid' },
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
    [normalizarNome('Super Metroid')]: 'Super_Metroid_SuperNintendo.jpg',
  }
  const arquivo = capasExatas[normalizarNome(jogo.nome)]
    ?? Object.keys(arquivosCapas).find((caminho) => normalizarNome(caminho.split('/').pop()).includes(normalizarNome(jogo.nome)))

  return arquivo
    ? Object.entries(arquivosCapas).find(([caminho]) => caminho.endsWith(arquivo))?.[1]
      ?? arquivosCapas[arquivo]
    : undefined
}

function ordenarDestaques(jogos) {
  const selecionados = TITULOS_DESTAQUE
    .map((titulo) => jogos.find((jogo) => normalizarNome(jogo.nome) === normalizarNome(titulo)))
    .filter(Boolean)
  const idsSelecionados = new Set(selecionados.map((jogo) => jogo.id))
  return [...selecionados, ...jogos.filter((jogo) => !idsSelecionados.has(jogo.id))].slice(0, 5)
}

export function Inicio() {
  const [destaques, setDestaques] = useState(DESTAQUES_LOCAIS)
  const jogoEmDestaque = destaques[0]

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

        if (ativo) setDestaques(ordenarDestaques(jogos))
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
    <section className="rg-pagina-enter rg-inicio">
      <div className="rg-hero-inicio">
        <img src={fundoHero} alt="" className="rg-hero-inicio-fundo" aria-hidden="true" />
        <div className="rg-hero-inicio-conteudo">
          <p className="rg-hero-inicio-chamada">Jogos clássicos, novas aventuras</p>
          <h1 className="rg-hero-inicio-titulo">
            <span>Reviva a<br />magia dos</span>
            <strong>jogos retrô!</strong>
          </h1>
          <p className="rg-hero-inicio-descricao">
            Confira nossa coleção de clássicos e embarque nessa nostalgia.
          </p>
          <Link to="/" className="btn rg-btn-primary rg-hero-inicio-botao">
            Explorar Catálogo
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <section className="rg-inicio-semana" aria-labelledby="titulo-destaques">
        <div className="rg-inicio-semana-cabecalho">
          <h2 id="titulo-destaques"><span aria-hidden="true">✦</span> Clássicos em destaque</h2>
          <Link to="/" className="rg-inicio-ver-todos">
            Ver todos <span aria-hidden="true">→</span>
          </Link>
        </div>

        {destaques.length > 0 && (
          <div className="rg-inicio-jogos">
            {destaques.map((jogo) => (
              <Link key={jogo.id} to={`/jogos/${jogo.id}`} className="rg-inicio-jogo" aria-label={`Ver ${jogo.nome}`}>
                {obterCapa(jogo) ? (
                  <img src={obterCapa(jogo)} alt={`Capa de ${jogo.nome}`} loading="lazy" />
                ) : (
                  <span className="rg-inicio-jogo-sem-capa">{jogo.nome}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {jogoEmDestaque && (
        <section className="rg-inicio-classico" aria-labelledby="titulo-classico">
          <div className="rg-inicio-classico-capa">
            {obterCapa(jogoEmDestaque) && (
              <img src={obterCapa(jogoEmDestaque)} alt={`Capa de ${jogoEmDestaque.nome}`} loading="lazy" />
            )}
          </div>
          <div className="rg-inicio-classico-conteudo">
            <p className="rg-inicio-classico-etiqueta">JOGO EM DESTAQUE</p>
            <h2 id="titulo-classico">{jogoEmDestaque.nome}</h2>
            {jogoEmDestaque.descricao && <p className="rg-inicio-classico-descricao">{jogoEmDestaque.descricao}</p>}
            {jogoEmDestaque.nomePlataforma && (
              <div className="rg-inicio-classico-dados">
                <span>{jogoEmDestaque.nomePlataforma}</span>
                <span>{jogoEmDestaque.anoLancamento}</span>
                <strong>{formatarPreco(jogoEmDestaque.preco)}</strong>
              </div>
            )}
            <Link to={`/jogos/${jogoEmDestaque.id}`} className="btn rg-btn-primary rg-inicio-classico-botao">
              Descobrir este jogo
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </section>
  )
}
