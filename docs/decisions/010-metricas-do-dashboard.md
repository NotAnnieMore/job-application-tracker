# Decisão 010 — Métricas do Dashboard

Data: 8 de agosto de 2026

Estado: aceite

## Contexto

O Dashboard já apresentava totais, listas e a distribuição por estado, mas não
permitia avaliar rapidamente resultados, taxa de resposta ou evolução ao longo
do tempo. Também não existia uma vista agregada das alterações recentes.

## Decisão

- Calcular as estatísticas no servidor com os dados protegidos pelo utilizador.
- Considerar enviada qualquer candidatura cujo estado já não seja
  `interested`.
- Considerar resposta os estados `interview_scheduled`,
  `interview_completed`, `offer_received` e `rejected`.
- Mostrar a evolução das candidaturas pelos seis meses de calendário mais
  recentes usando `application_date`.
- Derivar a atividade recente de `created_at` e `updated_at`, sem introduzir uma
  tabela de auditoria durante o MVP.
- Construir o gráfico com HTML e CSS, evitando uma dependência adicional para
  uma visualização simples.
- Tornar os indicadores clicáveis e encaminhá-los para as listas principais.

## Consequências

- A definição da taxa de resposta fica visível, reproduzível e pode ser
  refinada mais tarde sem alterar o esquema.
- A atividade recente é um resumo operacional e não um histórico de auditoria;
  registos eliminados deixam de aparecer.
- Não é necessária qualquer migração ou biblioteca de gráficos nesta fase.
