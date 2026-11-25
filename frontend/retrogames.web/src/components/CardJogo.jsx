import { Link } from 'react-router-dom'
import { formatarPreco } from '../lib/formato'
import { IconeCarrinho } from './IconesNavbar'

const capasJogos = import.meta.glob('../assets/jogos/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

function normalizarNome(valor) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function obterCapa(nomeJogo) {
  const nomeNormalizado = normalizarNome(nomeJogo)
  const nomeArquivosEspecificos = {
    [normalizarNome('Phantasy Star IV')]: 'Phantasy_Star_EotM_cover_MegaDrive.jpg',
    [normalizarNome('Sonic the Hedgehog 2')]: 'Sonic_Megadrive.jpg',
    [normalizarNome('The Legend of Zelda Ocarina of Time')]: 'The_Legend_of_Zelda_nintendo64.jpg',
  }
  const arquivoEspecifico = Object.entries(nomeArquivosEspecificos)
    .find(([nomeBase]) => nomeNormalizado.includes(nomeBase))?.[1]
  if (arquivoEspecifico) {
    const encontrado = Object.entries(capasJogos).find(([caminho]) => caminho.endsWith(arquivoEspecifico))
    if (encontrado) return encontrado[1]
  }

  const entrada = Object.entries(capasJogos).find(([caminho]) =>
    nomeNormalizado.includes(normalizarNome(caminho.split('/').pop().replace(/\.[^.]+$/, '')))
      || normalizarNome(caminho.split('/').pop()).includes(nomeNormalizado),
  )

  return entrada?.[1]
}

export function CardJogo({ jogo }) {
  const esgotado = jogo.estoque <= 0
  const capa = obterCapa(jogo.nome)

  return (
    <article className={`rg-card-jogo ${esgotado ? 'rg-card-jogo--esgotado' : ''}`}>
      <div className="rg-card-capa">
        {capa && <img className="rg-card-capa-imagem" src={capa} alt={`Capa de ${jogo.nome}`} loading="lazy" />}
        <div className="d-flex align-items-start justify-content-between gap-2">
          <span className="rg-badge-plataforma">{jogo.nomePlataforma}</span>
          {esgotado ? (
            <span className="rg-badge-esgotado">ESGOTADO</span>
          ) : (
            <span className="rg-badge-disponivel">Disponível</span>
          )}
        </div>

        <div className="mt-3 d-flex align-items-end justify-content-between gap-2">
          <span className="small" style={{ color: 'var(--rg-text-secondary)' }}>
            Ano {jogo.anoLancamento}
          </span>
          <span className="small" style={{ color: 'var(--rg-violet)' }}>
            {jogo.descricaoCondicao}
          </span>
        </div>
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--rg-text-primary)' }}>
          {jogo.nome}
        </h2>

        {Array.isArray(jogo.generos) && jogo.generos.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {jogo.generos.map((genero) => (
              <span key={genero} className="rg-pill-genero">
                {genero}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between gap-2" style={{ borderColor: 'rgba(59, 31, 140, 0.55)' }}>
          <span className="rg-preco">{formatarPreco(jogo.preco)}</span>
          <Link to={`/jogos/${jogo.id}`} className="btn btn-sm rg-btn-secondary rg-card-detalhes">
            <IconeCarrinho />
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  )
}
