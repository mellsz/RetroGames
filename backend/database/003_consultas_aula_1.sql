-- Aula 1, etapa 5: executar depois de 001_criar_banco_e_tabelas.sql
-- e 002_dados_exemplo.sql.
-- Consultas de catálogo para validação manual no MySQL Workbench.

-- Conferência dos dados de exemplo da etapa 4 (esperado: 7, 8 e 20).
SELECT
  (SELECT COUNT(*) FROM tb_plataforma) AS quantidade_plataformas,
  (SELECT COUNT(*) FROM tb_genero) AS quantidade_generos,
  (SELECT COUNT(*) FROM tb_jogo) AS quantidade_jogos;

-- Deve retornar zero linhas: todo jogo de exemplo tem ao menos um gênero.
SELECT j.co_seq_jogo, j.no_jogo
FROM tb_jogo AS j
LEFT JOIN tb_jogo_genero AS jg
  ON jg.co_jogo = j.co_seq_jogo
WHERE jg.co_jogo IS NULL;

-- Cada consulta deve retornar pelo menos uma linha.
SELECT co_seq_jogo, no_jogo
FROM tb_jogo
WHERE st_ativo = FALSE;

SELECT co_seq_jogo, no_jogo
FROM tb_jogo
WHERE qt_estoque = 0;

-- Esperado: 0 usuários (o administrador será criado em aula posterior).
SELECT COUNT(*) AS quantidade_usuarios
FROM tb_usuario;

-- 1. Catálogo: jogos ativos com plataforma e condição, ordenados por nome.
SELECT
  j.co_seq_jogo,
  j.no_jogo,
  p.no_plataforma,
  cj.ds_condicao_jogo,
  j.vl_preco,
  j.qt_estoque
FROM tb_jogo AS j
INNER JOIN tb_plataforma AS p
  ON p.co_seq_plataforma = j.co_plataforma
INNER JOIN tb_condicao_jogo AS cj
  ON cj.co_condicao_jogo = j.co_condicao_jogo
WHERE j.st_ativo = TRUE
ORDER BY j.no_jogo;

-- 2. Gêneros do jogo informado. Altere o ID se quiser consultar outro jogo.
SET @id_jogo_consulta = 1;
SELECT
  g.co_seq_genero,
  g.no_genero
FROM tb_jogo_genero AS jg
INNER JOIN tb_genero AS g
  ON g.co_seq_genero = jg.co_genero
WHERE jg.co_jogo = @id_jogo_consulta
ORDER BY g.no_genero;

-- 3. Jogos associados ao gênero informado. Altere o ID se quiser outro gênero.
SET @id_genero_consulta = 4;
SELECT
  j.co_seq_jogo,
  j.no_jogo,
  j.nu_ano_lancamento
FROM tb_jogo_genero AS jg
INNER JOIN tb_jogo AS j
  ON j.co_seq_jogo = jg.co_jogo
WHERE jg.co_genero = @id_genero_consulta
ORDER BY j.no_jogo;

-- 4. Quantidade de jogos por plataforma; Sega Saturn deve aparecer com 0.
SELECT
  p.co_seq_plataforma,
  p.no_plataforma,
  COUNT(j.co_seq_jogo) AS quantidade_jogos
FROM tb_plataforma AS p
LEFT JOIN tb_jogo AS j
  ON j.co_plataforma = p.co_seq_plataforma
GROUP BY p.co_seq_plataforma, p.no_plataforma
ORDER BY p.no_plataforma;

-- 5. Busca textual paginada, cinco itens por página.
-- O termo "a" deve retornar mais de cinco resultados com os dados de exemplo.
SET @termo_busca = 'a';

-- Primeira página (itens 1 a 5).
SELECT co_seq_jogo, no_jogo
FROM tb_jogo
WHERE no_jogo LIKE CONCAT('%', @termo_busca, '%')
ORDER BY no_jogo
LIMIT 5 OFFSET 0;

-- Segunda página (itens 6 a 10).
SELECT co_seq_jogo, no_jogo
FROM tb_jogo
WHERE no_jogo LIKE CONCAT('%', @termo_busca, '%')
ORDER BY no_jogo
LIMIT 5 OFFSET 5;
