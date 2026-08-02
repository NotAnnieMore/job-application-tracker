# 005 — Modelo de dados inicial

Data: 2 de agosto de 2026

Estado: aceite

## Contexto

A interface da Fase 2 usa dados de demonstração. Era necessário definir a estrutura persistente antes de implementar autenticação, formulários e operações CRUD.

## Decisão

- Separar empresas, recrutadores, oportunidades e candidaturas para evitar duplicação de informação.
- Manter um recrutador principal opcional por candidatura no MVP.
- Permitir várias entrevistas, notas e ações por candidatura.
- Usar UUIDs, `timestamptz` para auditoria e datas simples para candidatura, follow-up e prazos de ações.
- Usar enums PostgreSQL apenas para estados fixos, modalidade de trabalho, estado e prioridade de ações.
- Guardar tecnologias e participantes em arrays de texto nesta primeira versão.
- Usar chaves estrangeiras compostas com `user_id` para impedir relações entre proprietários diferentes.
- Bloquear a eliminação de empresas com vagas e de vagas com candidaturas.
- Eliminar em cascata entrevistas, notas e ações quando a respetiva candidatura for eliminada.
- Guardar o guião de entrevista e as perguntas para a empresa diretamente na candidatura.
- Ativar RLS sem criar políticas até à Fase 4.

## Razões

- A separação entre vaga e candidatura permite acompanhar uma oportunidade antes do envio e preserva dados próprios da vaga.
- Relações compostas reforçam o isolamento no nível da base de dados, além das futuras políticas RLS.
- Regras de eliminação conservadoras reduzem o risco de perder histórico por acidente.
- Arrays são suficientes para listas simples e evitam tabelas adicionais antes de existir uma necessidade real.
- Os campos de preparação por candidatura permitem personalizar o guião sem introduzir já um sistema de templates.
- Manter as tabelas inacessíveis até existirem políticas testadas evita exposição acidental pela Data API.

## Consequências

- A aplicação terá de enviar `user_id` coerente com o utilizador autenticado e as políticas RLS validarão esse valor.
- Eliminar empresas e vagas relacionadas exigirá uma decisão explícita na interface.
- Alterar os estados fixos exige uma migração.
- Participantes e tecnologias não têm metadados próprios no MVP.
- Uma biblioteca reutilizável de preparação poderá exigir uma tabela adicional no futuro.
- Os tipos TypeScript devem ser regenerados sempre que o esquema mudar depois da integração da Supabase CLI.
