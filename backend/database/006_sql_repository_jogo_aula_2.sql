-- Aula 2, etapa 4: testar no Workbench antes de implementar
-- IJogoRepository / JogoRepository e IJogoGeneroRepository / JogoGeneroRepository.
-- Os comandos de INSERT, UPDATE e DELETE usam transações e ROLLBACK para
-- não deixar alterações permanentes nos dados de exemplo.

-- 1. JogoRepository.Listar: página ativa, sem filtros.
SELECT co_seq_jogo, no_jogo, ds_jogo, nu_ano_lancamento, vl_preco,
       qt_estoque, st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo
FROM tb_jogo
WHERE st_ativo = TRUE
ORDER BY no_jogo
LIMIT 5 OFFSET 0;

-- Total da mesma consulta: mesmo filtro, sem paginação.
SELECT COUNT(*) AS total_encontrado
FROM tb_jogo
WHERE st_ativo = TRUE;

-- 2. Listar com busca, plataforma e lista de IDs de jogo.
-- Os IDs 4 e 6 ilustram a lista de jogos que o Service obterá por gênero.
SELECT co_seq_jogo, no_jogo, nu_ano_lancamento, vl_preco, qt_estoque,
       st_ativo, co_plataforma, co_condicao_jogo
FROM tb_jogo
WHERE st_ativo = TRUE
  AND no_jogo LIKE '%Super%'
  AND co_plataforma = 2
  AND co_seq_jogo IN (4, 6)
ORDER BY no_jogo
LIMIT 5 OFFSET 0;

-- Contagem com exatamente os mesmos filtros da consulta anterior.
SELECT COUNT(*) AS total_encontrado
FROM tb_jogo
WHERE st_ativo = TRUE
  AND no_jogo LIKE '%Super%'
  AND co_plataforma = 2
  AND co_seq_jogo IN (4, 6);

-- 3. Listar inativos quando solicitado: deve incluir River Raid (ID 20).
SELECT co_seq_jogo, no_jogo, st_ativo
FROM tb_jogo
WHERE st_ativo = FALSE
ORDER BY no_jogo;

-- 4. Buscar por ID: River Raid (inativo).
SELECT co_seq_jogo, no_jogo, ds_jogo, nu_ano_lancamento, vl_preco,
       qt_estoque, st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo
FROM tb_jogo
WHERE co_seq_jogo = 20;

-- 5. Paginação no SQL: a segunda página também deve trazer resultados.
SELECT co_seq_jogo, no_jogo
FROM tb_jogo
WHERE no_jogo LIKE '%a%'
ORDER BY no_jogo
LIMIT 5 OFFSET 5;

-- 6. Inserir: deve retornar ID gerado. A transação será desfeita.
START TRANSACTION;
INSERT INTO tb_jogo
  (no_jogo, ds_jogo, nu_ano_lancamento, vl_preco, qt_estoque,
   st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo)
VALUES
  ('Jogo teste Repository', NULL, 1998, 10.00, 1,
   TRUE, UTC_TIMESTAMP(), 5, 2);
SELECT LAST_INSERT_ID() AS id_gerado;
ROLLBACK;

-- 7. Alterar: confira a alteração temporária; o ROLLBACK restaura o nome.
START TRANSACTION;
UPDATE tb_jogo
SET no_jogo = 'River Raid - teste'
WHERE co_seq_jogo = 20;
SELECT co_seq_jogo, no_jogo
FROM tb_jogo
WHERE co_seq_jogo = 20;
ROLLBACK;

-- 8. Desativar: deve fazer UPDATE em st_ativo; o ROLLBACK restaura o valor.
START TRANSACTION;
UPDATE tb_jogo
SET st_ativo = FALSE
WHERE co_seq_jogo = 1;
SELECT co_seq_jogo, no_jogo, st_ativo
FROM tb_jogo
WHERE co_seq_jogo = 1;
ROLLBACK;

-- 9. JogoGeneroRepository.ListarTodos: todos os vínculos.
SELECT co_jogo, co_genero
FROM tb_jogo_genero
ORDER BY co_jogo, co_genero;

-- 10. ListarPorJogos: lista de vínculos dos jogos 1 e 4 em uma consulta.
SELECT co_jogo, co_genero
FROM tb_jogo_genero
WHERE co_jogo IN (1, 4)
ORDER BY co_jogo, co_genero;

-- 11. Inserir vínculo: (jogo 1, gênero 5) não existe no seed. ROLLBACK desfaz.
START TRANSACTION;
INSERT INTO tb_jogo_genero (co_jogo, co_genero)
VALUES (1, 5);
SELECT co_jogo, co_genero
FROM tb_jogo_genero
WHERE co_jogo = 1 AND co_genero = 5;
ROLLBACK;

-- 12. Remover vínculos por jogo: confira a remoção temporária; ROLLBACK restaura.
START TRANSACTION;
DELETE FROM tb_jogo_genero
WHERE co_jogo = 1;
SELECT COUNT(*) AS vinculos_restantes
FROM tb_jogo_genero
WHERE co_jogo = 1;
ROLLBACK;
