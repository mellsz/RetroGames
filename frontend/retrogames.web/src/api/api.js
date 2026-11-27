import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url ?? '').toLowerCase()
    const naoInterrompeSessao = [
      '/autenticacao/eu',
      '/autenticacao/login',
      '/autenticacao/cadastrar',
    ].some((rota) => url.endsWith(rota))

    if (error.response?.status === 401 && !naoInterrompeSessao) {
      window.dispatchEvent(new Event('sessao:expirada'))
    }

    return Promise.reject(error)
  },
)

export default api
