# 014 — Testes e refinamento do MVP

Data: 9 de agosto de 2026

## Contexto

Com os fluxos principais implementados, a interface precisava de uma auditoria
transversal antes da publicação. Existiam controlos sem ação, feedback repetido
entre páginas e alguns casos de URL inválido que terminavam num erro técnico.

## Decisão

- transformar a pesquisa do cabeçalho num formulário real para candidaturas;
- remover o botão de notificações enquanto a funcionalidade não existe;
- uniformizar o feedback positivo através de toasts descartáveis que limpam o
  parâmetro de sucesso do URL;
- validar UUIDs de filtros antes de consultar a base de dados e centralizar a
  regra partilhada;
- adicionar uma ligação para saltar para o conteúdo, `aria-current` na
  navegação e contenção de foco no menu móvel;
- respeitar a preferência por movimento reduzido;
- definir títulos únicos em todos os ecrãs e estados de erro;
- acrescentar uma fronteira de erro global e melhorar a recuperação do erro da
  área privada;
- tornar mensagens de erro das ações rápidas visíveis;
- remover o componente de demonstração que já não era utilizado.

## Consequências

A aplicação deixa de apresentar controlos enganadores, tolera URLs adulterados
sem chegar à base de dados e fornece melhor contexto a utilizadores de teclado
e leitores de ecrã. A matriz manual fica registada em `docs/testing.md` para a
validação final e para futuros testes de regressão.
