-- Aula 1, etapa 4: executar depois de 001_criar_banco_e_tabelas.sql.
-- O script deve ser executado em um schema retrogames recém-criado.
-- Não inserir usuários nesta etapa.

INSERT INTO tb_condicao_jogo (co_condicao_jogo, ds_condicao_jogo) VALUES
  (1, 'Novo'),
  (2, 'Usado'),
  (3, 'Recondicionado');

INSERT INTO tb_perfil (co_perfil, ds_perfil) VALUES
  (1, 'Administrador'),
  (2, 'Cliente');

INSERT INTO tb_plataforma
  (co_seq_plataforma, no_plataforma, no_fabricante, nu_ano_lancamento)
VALUES
  (1, 'Nintendo Entertainment System', 'Nintendo', 1983),
  (2, 'Super Nintendo Entertainment System', 'Nintendo', 1990),
  (3, 'Mega Drive', 'Sega', 1988),
  (4, 'PlayStation', 'Sony', 1994),
  (5, 'Nintendo 64', 'Nintendo', 1996),
  (6, 'Atari 2600', 'Atari', 1977),
  (7, 'Sega Saturn', 'Sega', 1994);

INSERT INTO tb_genero (co_seq_genero, no_genero) VALUES
  (1, 'Ação'),
  (2, 'Aventura'),
  (3, 'RPG'),
  (4, 'Plataforma'),
  (5, 'Corrida'),
  (6, 'Luta'),
  (7, 'Esporte'),
  (8, 'Puzzle');

INSERT INTO tb_jogo
  (co_seq_jogo, no_jogo, ds_jogo, nu_ano_lancamento, vl_preco, qt_estoque,
   st_ativo, dt_cadastro, co_plataforma, co_condicao_jogo)
VALUES
  (1, 'Super Mario Bros.', 'Clássico de plataforma da Nintendo.', 1985, 189.90, 4, TRUE, UTC_TIMESTAMP(), 1, 2),
  (2, 'The Legend of Zelda', 'Aventura clássica em Hyrule.', 1986, 219.90, 3, TRUE, UTC_TIMESTAMP(), 1, 2),
  (3, 'Mega Man 2', 'Ação e plataforma da série Mega Man.', 1988, 199.90, 2, TRUE, UTC_TIMESTAMP(), 1, 3),
  (4, 'Super Mario World', 'Aventura de plataforma no Reino dos Dinossauros.', 1990, 229.90, 5, TRUE, UTC_TIMESTAMP(), 2, 2),
  (5, 'Chrono Trigger', 'RPG com viagens no tempo.', 1995, 399.90, 1, TRUE, UTC_TIMESTAMP(), 2, 2),
  (6, 'Super Metroid', 'Aventura de ação no planeta Zebes.', 1994, 279.90, 2, TRUE, UTC_TIMESTAMP(), 2, 2),
  (7, 'Street Fighter II Turbo', 'Jogo de luta da série Street Fighter.', 1993, 249.90, 2, TRUE, UTC_TIMESTAMP(), 2, 3),
  (8, 'Sonic the Hedgehog 2', 'Aventura de plataforma com Sonic e Tails.', 1992, 179.90, 4, TRUE, UTC_TIMESTAMP(), 3, 2),
  (9, 'Streets of Rage 2', 'Ação cooperativa nas ruas de Wood Oak City.', 1992, 219.90, 2, TRUE, UTC_TIMESTAMP(), 3, 2),
  (10, 'Phantasy Star IV', 'RPG da série Phantasy Star.', 1993, 349.90, 1, TRUE, UTC_TIMESTAMP(), 3, 2),
  (11, 'Castlevania: Symphony of the Night', 'Ação e aventura no castelo de Drácula.', 1997, 329.90, 1, TRUE, UTC_TIMESTAMP(), 4, 2),
  (12, 'Final Fantasy VII', 'RPG da série Final Fantasy.', 1997, 199.90, 3, TRUE, UTC_TIMESTAMP(), 4, 2),
  (13, 'Tekken 3', 'Jogo de luta da série Tekken.', 1998, 159.90, 2, TRUE, UTC_TIMESTAMP(), 4, 2),
  (14, 'Gran Turismo 2', 'Simulador de corrida com diversos carros.', 1999, 139.90, 4, TRUE, UTC_TIMESTAMP(), 4, 2),
  (15, 'Super Mario 64', 'Aventura de plataforma em três dimensões.', 1996, 279.90, 2, TRUE, UTC_TIMESTAMP(), 5, 2),
  (16, 'The Legend of Zelda: Ocarina of Time', 'Aventura de Link pelo reino de Hyrule.', 1998, 319.90, 1, TRUE, UTC_TIMESTAMP(), 5, 2),
  (17, 'Mario Kart 64', 'Corridas com personagens do universo Mario.', 1996, 249.90, 3, TRUE, UTC_TIMESTAMP(), 5, 2),
  (18, 'Pitfall!', 'Aventura de exploração na selva.', 1982, 89.90, 1, TRUE, UTC_TIMESTAMP(), 6, 2),
  (19, 'Adventure', 'Aventura e exploração em um mundo de fantasia.', 1980, 99.90, 1, TRUE, UTC_TIMESTAMP(), 6, 2),
  (20, 'River Raid', 'Jogo de ação com combate aéreo.', 1982, 79.90, 0, FALSE, UTC_TIMESTAMP(), 6, 2);

INSERT INTO tb_jogo_genero (co_jogo, co_genero) VALUES
  (1, 4), (1, 1),
  (2, 2), (2, 1),
  (3, 1), (3, 4),
  (4, 4), (4, 2),
  (5, 3), (5, 2),
  (6, 1), (6, 2),
  (7, 6),
  (8, 4), (8, 1),
  (9, 1), (9, 6),
  (10, 3),
  (11, 1), (11, 2), (11, 3),
  (12, 3),
  (13, 6),
  (14, 5),
  (15, 4), (15, 2),
  (16, 2), (16, 1),
  (17, 5),
  (18, 2), (18, 4),
  (19, 2), (19, 8),
  (20, 1);
