export function obterMensagemErro(error) {
  return error.response?.data?.errorMessage ?? 'Não foi possível conectar ao servidor. Tente novamente.'
}

export function obterErrosDosCampos(error) {
  if (error.response?.data?.responseCode !== 3) return {}
  return error.response.data.data ?? {}
}
