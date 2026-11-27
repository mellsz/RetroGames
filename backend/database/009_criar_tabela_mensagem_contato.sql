USE retrogames;

CREATE TABLE IF NOT EXISTS tb_mensagem_contato (
  co_seq_mensagem_contato INT NOT NULL AUTO_INCREMENT,
  ds_mensagem VARCHAR(2000) NOT NULL,
  dt_envio DATETIME NOT NULL,
  co_usuario INT NOT NULL,
  CONSTRAINT pk_mensagem_contato PRIMARY KEY (co_seq_mensagem_contato),
  INDEX ix_mensagem_contato_usuario (co_usuario),
  CONSTRAINT fk_mensagem_contato_usuario
    FOREIGN KEY (co_usuario) REFERENCES tb_usuario (co_seq_usuario)
) ENGINE=InnoDB;
