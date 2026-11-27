import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { jogoApi } from '../../api/servicos'
import { obterMensagemErro } from '../../api/erros'
import { formatarPreco } from '../../lib/formato'
import { Carregando, MensagemErro } from '../../components/MensagensEstado'
import { useCarrinho } from '../../contexts/CarrinhoContext'

export function DetalheJogo() {
  const { id } = useParams()

  const [jogo, setJogo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [adicionado, setAdicionado] = useState('')
  const { adicionar } = useCarrinho()

  useEffect(() => {
    let ativo = true

    async function carregarDetalhe() {
      setCarregando(true)
      setErro(null)

      try {
        const dados = await jogoApi.buscarPorId(id)
        if (ativo) {
          setJogo(dados)
        }
      } catch (error) {
        if (ativo) {
          setJogo(null)
          setErro(obterMensagemErro(error))
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarDetalhe()
    return () => {
      ativo = false
    }
  }, [id, tentativa])

  if (carregando) {
    return <Carregando mensagem="Carregando detalhes do jogo..." />
  }

  if (erro || !jogo) {
    return (
      <section className="rg-pagina-enter">
        <div className="mb-3">
          <Link to="/" className="text-decoration-none">
            ← Voltar ao catálogo
          </Link>
        </div>
        <MensagemErro
          mensagem={erro ?? 'Jogo não encontrado.'}
          aoTentarNovamente={() => setTentativa((valor) => valor + 1)}
        />
      </section>
    )
  }

  const esgotado = jogo.estoque <= 0
  const descricaoValida =
    typeof jogo.descricao === 'string' && jogo.descricao.trim() !== ''
      ? jogo.descricao.trim()
      : null

  return (
    <section className="rg-pagina-enter">
      <nav aria-label="Caminho de navegação" className="mb-3">
        <Link to="/" className="text-decoration-none fw-medium">
          ← Voltar ao catálogo
        </Link>
      </nav>

      <div className="rg-detalhe-card">
        <div className="row g-4 align-items-stretch">
          <div className="col-md-5">
            <div className="rg-detalhe-vitrine h-100">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <span className="rg-badge-plataforma">{jogo.nomePlataforma}</span>
                {esgotado ? (
                  <span className="rg-badge-esgotado">ESGOTADO</span>
                ) : (
                  <span className="rg-badge-disponivel">Disponível</span>
                )}
              </div>

              <div className="my-4 text-center">
                {jogo.imagem ? (
                  <img className="rg-detalhe-capa-upload" src={jogo.imagem} alt={`Capa de ${jogo.nome}`} />
                ) : (
                  <>
                    <p className="rg-font-pixel mb-2" style={{ fontSize: '0.78rem', color: 'var(--rg-violet)' }}>
                      CARTRIDGE EDITION
                    </p>
                    <h2 className="h4 fw-bold mb-1" style={{ color: 'var(--rg-yellow)' }}>
                      {jogo.nome}
                    </h2>
                    <p className="mb-0 small" style={{ color: 'var(--rg-text-secondary)' }}>
                      Lançamento: {jogo.anoLancamento}
                    </p>
                  </>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center small pt-2 border-top" style={{ borderColor: 'rgba(59, 31, 140, 0.5)' }}>
                <span style={{ color: 'var(--rg-text-secondary)' }}>Condição</span>
                <span className="fw-semibold">{jogo.descricaoCondicao}</span>
              </div>
            </div>
          </div>

          <div className="col-md-7 d-flex flex-column">
            <h1 className="h2 fw-bold mb-2">{jogo.nome}</h1>

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="rg-badge-plataforma">{jogo.nomePlataforma}</span>
              <span className="small" style={{ color: 'var(--rg-text-secondary)' }}>
                Ano {jogo.anoLancamento}
              </span>
              <span className="small" style={{ color: 'var(--rg-violet)' }}>
                · {jogo.descricaoCondicao}
              </span>
            </div>

            {Array.isArray(jogo.generos) && jogo.generos.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {jogo.generos.map((genero) => (
                  <span key={genero.id ?? genero.nome} className="rg-pill-genero">
                    {genero.nome}
                  </span>
                ))}
              </div>
            )}

            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <span className="rg-preco" style={{ fontSize: '1.75rem' }}>
                {formatarPreco(jogo.preco)}
              </span>
              {esgotado ? (
                <span className="rg-badge-esgotado">ESGOTADO</span>
              ) : (
                <span className="rg-badge-disponivel">
                  {jogo.estoque === 1 ? '1 unidade em estoque' : `${jogo.estoque} unidades em estoque`}
                </span>
              )}
            </div>

            <div className="mb-4">
              <h2 className="h6 fw-semibold mb-2">Sobre o jogo</h2>
              {descricaoValida ? (
                <p className="rg-detalhe-descricao mb-0">{descricaoValida}</p>
              ) : (
                <p className="mb-0 small" style={{ color: 'var(--rg-text-muted)' }}>
                  Nenhuma descrição cadastrada para este título.
                </p>
              )}
            </div>

            <div className="mt-auto d-grid gap-2">
              <button type="button" className="rg-btn-primary" disabled={esgotado || jogo.ativo === false} onClick={() => setAdicionado(adicionar(jogo) ? 'Jogo adicionado ao carrinho.' : 'Limite de quantidade ou estoque atingido.')}>{esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}</button>
              {adicionado && <p role="status" className="rg-form-sucesso">{adicionado} <Link to="/carrinho">Ver carrinho</Link></p>}
              <div className="rg-detalhe-selo">
                Mídia física original verificada · Funcionando perfeitamente
              </div>
              <div className="pt-2">
                <Link to="/" className="btn rg-btn-secondary">
                  Voltar ao catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
