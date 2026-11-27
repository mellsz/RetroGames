import api from './api'

function extrairDados(response) {
  return response.data.data
}

export const plataformaApi = {
  listar: async () => extrairDados(await api.get('/Plataforma')),
  buscarPorId: async (id) => extrairDados(await api.get(`/Plataforma/${id}`)),
  inserir: async (dados) => extrairDados(await api.post('/Plataforma', dados)),
  alterar: async (id, dados) => extrairDados(await api.put(`/Plataforma/${id}`, dados)),
  excluir: async (id) => extrairDados(await api.delete(`/Plataforma/${id}`)),
}

export const generoApi = {
  listar: async () => extrairDados(await api.get('/Genero')),
  inserir: async (dados) => extrairDados(await api.post('/Genero', dados)),
  alterar: async (id, dados) => extrairDados(await api.put(`/Genero/${id}`, dados)),
  excluir: async (id) => extrairDados(await api.delete(`/Genero/${id}`)),
}

export const pedidoApi = {
  criar: async (itens) => extrairDados(await api.post('/Pedido', { itens })),
  meus: async () => extrairDados(await api.get('/Pedido/meus')),
  cancelar: async (id) => extrairDados(await api.post(`/Pedido/${id}/cancelar`)),
  buscarPorId: async (id) => extrairDados(await api.get(`/Pedido/${id}`)),
  listar: async (idSituacao) => extrairDados(await api.get('/Pedido', { params: idSituacao ? { idSituacao } : {} })),
  alterarSituacao: async (id, idSituacao) => extrairDados(await api.put(`/Pedido/${id}/situacao`, { idSituacao })),
  situacoes: async () => extrairDados(await api.get('/SituacaoPedido')),
}

export const condicaoJogoApi = {
  listar: async () => extrairDados(await api.get('/CondicaoJogo')),
}

export const jogoApi = {
  listar: async (filtros = {}) => extrairDados(await api.get('/Jogo', { params: filtros })),
  buscarPorId: async (id) => extrairDados(await api.get(`/Jogo/${id}`)),
  inserir: async (dados) => extrairDados(await api.post('/Jogo', dados)),
  alterar: async (id, dados) => extrairDados(await api.put(`/Jogo/${id}`, dados)),
  desativar: async (id) => extrairDados(await api.delete(`/Jogo/${id}`)),
  ativar: async (id) => extrairDados(await api.patch(`/Jogo/${id}/ativar`)),
}

export const autenticacaoApi = {
  entrar: async (dados) => extrairDados(await api.post('/Autenticacao/login', dados)),
  cadastrar: async (dados) => extrairDados(await api.post('/Autenticacao/cadastrar', dados)),
  sair: async () => extrairDados(await api.post('/Autenticacao/logout')),
  usuarioAtual: async () => extrairDados(await api.get('/Autenticacao/eu')),
}

export const mensagemContatoApi = {
  enviar: async (dados) => extrairDados(await api.post('/MensagemContato', dados)),
}
