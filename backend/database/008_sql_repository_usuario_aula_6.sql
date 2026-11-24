-- Aula 6, etapa 1: consultas testadas manualmente no MySQL Workbench.
-- Cada comando consulta apenas tb_usuario e os valores devem ser parâmetros no Repository.

-- BuscarPorEmailAsync(@email)
SELECT co_seq_usuario, no_usuario, ds_email, ds_senha_hash,
       st_ativo, dt_cadastro, co_perfil
FROM tb_usuario
WHERE ds_email = @email;

-- BuscarPorIdAsync(@id)
SELECT co_seq_usuario, no_usuario, ds_email, ds_senha_hash,
       st_ativo, dt_cadastro, co_perfil
FROM tb_usuario
WHERE co_seq_usuario = @id;

-- ExisteAdministradorAsync()
SELECT co_seq_usuario
FROM tb_usuario
WHERE co_perfil = @idPerfil
LIMIT 1;

-- InserirAsync(...)
INSERT INTO tb_usuario
    (no_usuario, ds_email, ds_senha_hash, st_ativo, dt_cadastro, co_perfil)
VALUES
    (@nome, @email, @senhaHash, @ativo, @dataCadastro, @idPerfil);
