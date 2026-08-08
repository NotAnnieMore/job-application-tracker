# Decisão 012 — Agenda agregada

Data: 8 de agosto de 2026

Estado: aceite

## Contexto

Entrevistas, follow-ups e ações tinham datas e listas próprias, mas o utilizador
precisava de consultar várias páginas para perceber as prioridades do dia. Uma
integração com calendários externos e notificações push continua fora do MVP.

## Decisão

- Criar `/agenda` como uma vista cronológica calculada no servidor.
- Combinar entrevistas agendadas, follow-ups de candidaturas ativas e ações
  pendentes que tenham data.
- Destacar itens em atraso e agrupar os restantes pelo dia no fuso
  `Europe/Lisbon`.
- Permitir filtros por tipo e período, guardados nos parâmetros do URL.
- Contabilizar ações pendentes sem data e encaminhar o utilizador para a lista
  filtrada onde pode atribuir um prazo.
- Encaminhar cada item para a respetiva lista ou para o detalhe da candidatura,
  sem abrir diretamente um formulário de edição.

## Consequências

- O utilizador obtém uma vista operacional única sem duplicar dados.
- Alterações feitas nas candidaturas, entrevistas ou ações refletem-se
  automaticamente na Agenda.
- A solução não envia alertas fora da aplicação e não sincroniza com serviços
  externos.
- Não é necessária uma nova tabela ou migração no Supabase.
