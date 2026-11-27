USE retrogames;

ALTER TABLE tb_jogo
  ADD COLUMN ds_imagem VARCHAR(260) NULL AFTER ds_jogo;
