-- Aula 2, etapa 3: testar no Workbench antes de implementar
-- IPlataformaRepository / PlataformaRepository.
-- Execução manual e resultados confirmados pela estudante no Workbench.
-- Os comandos de INSERT, UPDATE e DELETE usam transações e ROLLBACK para
-- não deixar alterações permanentes nos dados de exemplo.

-- 1. Listar: todas as plataformas por nome.
SELECT co_seq_plataforma, no_plataforma, no_fabricante, nu_ano_lancamento
FROM tb_plataforma
ORDER BY no_plataforma;

-- 2. Buscar por ID: esperado Nintendo Entertainment System.
SELECT co_seq_plataforma, no_plataforma, no_fabricante, nu_ano_lancamento
FROM tb_plataforma
WHERE co_seq_plataforma = 1;

-- 3a. Existe com nome, sem ID a ignorar: esperado TRUE.
SELECT COUNT(*) > 0 AS existe
FROM tb_plataforma
WHERE no_plataforma = 'Mega Drive';

-- 3b. Existe com nome, ignorando o ID da própria plataforma: esperado FALSE.
SELECT COUNT(*) > 0 AS existe
FROM tb_plataforma
WHERE no_plataforma = 'Mega Drive'
  AND co_seq_plataforma <> 3;

-- 4a. Possui jogos: plataforma 1, esperado TRUE.
SELECT COUNT(*) > 0 AS possui_jogos
FROM tb_jogo
WHERE co_plataforma = 1;

-- 4b. Possui jogos: plataforma 7 (Sega Saturn), esperado FALSE.
SELECT COUNT(*) > 0 AS possui_jogos
FROM tb_jogo
WHERE co_plataforma = 7;

-- 5. Inserir: deve retornar um ID gerado. A transação será desfeita.
START TRANSACTION;
INSERT INTO tb_plataforma (no_plataforma, no_fabricante, nu_ano_lancamento)
VALUES ('Plataforma teste Repository', 'Fabricante teste', 1999);
SELECT LAST_INSERT_ID() AS id_gerado;
ROLLBACK;

-- 6. Alterar: confira os valores temporários; depois o ROLLBACK restaura Sega Saturn.
START TRANSACTION;
UPDATE tb_plataforma
SET no_plataforma = 'Sega Saturn - teste',
    no_fabricante = 'Sega teste',
    nu_ano_lancamento = 1995
WHERE co_seq_plataforma = 7;
SELECT co_seq_plataforma, no_plataforma, no_fabricante, nu_ano_lancamento
FROM tb_plataforma
WHERE co_seq_plataforma = 7;
ROLLBACK;

-- 7. Excluir: plataforma 7 não possui jogos; confira a exclusão temporária.
START TRANSACTION;
DELETE FROM tb_plataforma
WHERE co_seq_plataforma = 7;
SELECT COUNT(*) AS registros_restantes
FROM tb_plataforma
WHERE co_seq_plataforma = 7;
ROLLBACK;
