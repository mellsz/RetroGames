import api from './api'

function extrairDados(response) {
  return response.data.data
}

export const plataformaApi = {
  listar: async () => extrairDados(await api.get('/Plataforma')),
}

export const generoApi = {
  listar: async () => extrairDados(await api.get('/Genero')),
}

export const condicaoJogoApi = {
  listar: async () => extrairDados(await api.get('/CondicaoJogo')),
}

export const jogoApi = {
  listar: async (filtros = {}) => extrairDados(await api.get('/Jogo', { params: filtros })),
  buscarPorId: async (id) => extrairDados(await api.get(`/Jogo/${id}`)),
}
