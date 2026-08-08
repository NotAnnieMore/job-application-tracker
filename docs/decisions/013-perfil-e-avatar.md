# 013 — Perfil real e fotografia de conta

Data: 8 de agosto de 2026

## Decisão

A área de Definições mostra o nome e o email da conta autenticada. O nome pode
ser alterado na tabela `profiles`; o email continua apenas para consulta e é
gerido pelo Supabase Auth.

A fotografia é guardada no Supabase Storage, num bucket público chamado
`avatars`. Cada utilizador tem um único caminho fixo, `<user_id>/avatar`, que
pode substituir ou remover. O caminho é registado em `profiles.avatar_path`.

## Segurança e limites

- só o utilizador autenticado pode carregar, substituir, consultar pela API ou
  remover o seu objeto;
- o URL final da fotografia é público, comportamento adequado a uma imagem de
  apresentação sem dados sensíveis;
- são aceites apenas JPEG, PNG e WebP até 2 MB;
- a aplicação valida a extensão MIME e a assinatura binária do ficheiro;
- o caminho fixo evita acumular versões antigas no armazenamento.

## Consequências

O cabeçalho reflete o nome e a fotografia depois de guardar o perfil e funciona
também como atalho para `/definicoes`. Sem fotografia, são apresentadas as
iniciais do nome.
