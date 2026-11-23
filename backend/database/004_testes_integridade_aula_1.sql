-- Aula 1, etapa 5: executar depois de 001_criar_banco_e_tabelas.sql
-- e 002_dados_exemplo.sql.
-- Execute cada comando de teste separadamente no Workbench, pois alguns
-- devem falhar. Anote o resultado observado ao lado de cada teste.

-- Teste 1: deve falhar com erro 1452 (plataforma inexistente).
INSERT INTO tb_jogo
  (no_jogo, ds_jogo, nu_ano_lancamento, vl_preco, qt_estoque,
   st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo)
VALUES
  ('Teste FK plataforma', NULL, 1990, 10.00, 1,
   TRUE, UTC_TIMESTAMP(), 2147483647, 1);
-- Resultado informado pela estudante: erro 1452 (chave estrangeira).

-- Teste 2: deve falhar com erro 1062 (nome de plataforma duplicado).
INSERT INTO tb_plataforma (no_plataforma, no_fabricante, nu_ano_lancamento)
VALUES ('Nintendo Entertainment System', 'Nintendo', 1983);
-- Resultado informado pela estudante: erro 1062 (UNIQUE).

-- Teste 3: deve falhar com erro 1451 (plataforma possui jogos vinculados).
DELETE FROM tb_plataforma
WHERE co_seq_plataforma = 1;
-- Resultado informado pela estudante: erro 1451 (chave estrangeira).

-- Teste 4: deve falhar com erro 1048 (no_jogo não aceita NULL).
INSERT INTO tb_jogo
  (no_jogo, ds_jogo, nu_ano_lancamento, vl_preco, qt_estoque,
   st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo)
VALUES
  (NULL, NULL, 1990, 10.00, 1,
   TRUE, UTC_TIMESTAMP(), 1, 1);
-- Resultado informado pela estudante: erro 1048 (NOT NULL).

-- Teste 5: deve ser aceito pelo banco; preço > 0 é regra do Service (RN06).
INSERT INTO tb_jogo
  (no_jogo, ds_jogo, nu_ano_lancamento, vl_preco, qt_estoque,
   st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo)
VALUES
  ('Teste preço zero - remover', NULL, 1990, 0.00, 0,
   TRUE, UTC_TIMESTAMP(), 1, 1);
-- Resultado informado pela estudante: inserção aceita; registro temporário removido.

-- Após confirmar o teste 5, remova o registro temporário inserido.
DELETE FROM tb_jogo
WHERE no_jogo = 'Teste preço zero - remover';
