-- Aula 2, etapa 5: testar no Workbench antes de implementar
-- GeneroRepository e CondicaoJogoRepository.

-- GeneroRepository.Listar: gêneros ordenados pelo nome.
SELECT co_seq_genero, no_genero
FROM tb_genero
ORDER BY no_genero;

-- CondicaoJogoRepository.Listar: condições ordenadas pela descrição.
SELECT co_condicao_jogo, ds_condicao_jogo
FROM tb_condicao_jogo
ORDER BY ds_condicao_jogo;
