export function obterMensagemErro(error) {
  return error.response?.data?.errorMessage ?? 'Não foi possível conectar ao servidor. Tente novamente.'
}
