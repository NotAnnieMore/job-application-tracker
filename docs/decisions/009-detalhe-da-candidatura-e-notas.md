# Decisão 009 — Detalhe da candidatura e notas

Data: 8 de agosto de 2026

Estado: aceite

## Contexto

A edição da candidatura era o único local onde se conseguia consultar toda a
informação de um processo. Entrevistas e ações estavam em listas separadas e a
tabela `notes`, apesar de existir no esquema inicial, ainda não tinha interface.

## Decisão

- Usar `/candidaturas/[id]` como página central de consulta.
- Manter `/candidaturas/[id]/editar` apenas para alterações aos dados da vaga e
  da candidatura.
- Reunir no detalhe a empresa, o recrutador, entrevistas, ações, preparação e
  perguntas para a empresa.
- Apresentar as notas por ordem cronológica inversa, com criação, edição e
  eliminação no mesmo ecrã.
- Reutilizar a tabela `notes` e as políticas RLS existentes, sem criar uma nova
  migração.
- Fazer o título na listagem abrir o detalhe e reservar o ícone de lápis para a
  edição direta.
- Depois de editar a candidatura, regressar ao respetivo detalhe para confirmar
  os dados atualizados.
- Quando uma entrevista ou ação é aberta a partir do detalhe, preservar esse
  contexto ao guardar, cancelar ou eliminar; acessos iniciados nas listas
  continuam a regressar às listas correspondentes.

## Consequências

- O utilizador obtém o contexto completo de uma candidatura sem entrar num
  formulário.
- O guião pessoal e as perguntas para a empresa ficam visíveis junto das
  entrevistas a que se destinam.
- O histórico deixa de depender de um único campo de notas gerais e passa a
  preservar registos separados com datas de criação e atualização.
