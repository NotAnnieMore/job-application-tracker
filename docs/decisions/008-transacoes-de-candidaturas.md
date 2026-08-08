# Decisão 008 — Transações de vagas e candidaturas

Data: 8 de agosto de 2026

Estado: aceite

## Contexto

O formulário de candidatura altera dois registos relacionados: a oportunidade contém os dados da vaga e a candidatura contém o acompanhamento do processo. Executar estas alterações como pedidos independentes poderia deixar dados parciais se um pedido falhasse.

## Decisão

- Criar funções PostgreSQL para criação, edição e eliminação conjuntas.
- Executar as funções como `security invoker`, mantendo as políticas RLS ativas.
- Obter o proprietário através de `auth.uid()` e nunca aceitar `user_id` do formulário.
- Limitar a uma candidatura por oportunidade e utilizador.
- Manter a leitura num Data Access Layer marcado como `server-only`.
- Validar sessão, empresa selecionada e todos os campos dentro das Server Actions.
- Atualizar automaticamente a listagem quando filtros de seleção mudam.

## Consequências

- As operações são atómicas: todos os dados são guardados ou nenhum é alterado.
- Uma URL manipulada não permite consultar ou alterar candidaturas de outra conta.
- A importação inicial pode reutilizar as mesmas relações e regras do fluxo manual.
- Eliminar uma candidatura também elimina a oportunidade criada para ela e os dados claramente dependentes.
