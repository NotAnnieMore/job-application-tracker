# Decisão 011 — Filtros no URL

Data: 8 de agosto de 2026

Estado: aceite

## Contexto

As listas de candidaturas, entrevistas e ações já permitiam alguns filtros,
mas faltavam intervalos de datas e formas de combinar os critérios mais úteis.
Também era importante que uma recarga da página não perdesse a vista atual.

## Decisão

- Guardar todos os filtros nos parâmetros de pesquisa do URL através de
  formulários `GET`.
- Aplicar automaticamente os filtros de seleção e usar um botão explícito para
  pesquisa livre e intervalos de datas.
- Validar no servidor estados, prioridades, modalidades, ordenações e datas,
  ignorando valores que não pertençam às listas permitidas.
- Mostrar um resumo dos filtros ativos e uma ação única para os limpar.
- Interpretar o dia das entrevistas no fuso `Europe/Lisbon`.

## Consequências

- Os filtros sobrevivem a recargas, podem ser guardados nos favoritos e podem
  ser partilhados sem estado adicional no browser.
- As combinações são aplicadas no servidor e continuam protegidas pela sessão
  e pelas políticas RLS existentes.
- Não é necessária uma nova tabela, migração ou dependência externa.
