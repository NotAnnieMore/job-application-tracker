# 003 — Integração inicial com Supabase

Data: 2 de agosto de 2026  
Estado: aceite

## Contexto

A aplicação precisa de aceder ao Supabase tanto a partir de componentes executados no browser como a partir do servidor, preservando sessões através de cookies.

## Decisão

- Usar `@supabase/supabase-js` como cliente base.
- Usar `@supabase/ssr` para integração com o App Router e sessões em cookies.
- Manter clientes separados em `src/lib/supabase/client.ts` e `src/lib/supabase/server.ts`.
- Ler apenas a Project URL e a publishable key a partir de `.env.local`.
- Criar `/api/health` para verificar a disponibilidade do serviço Auth sem consultar tabelas ou devolver informação sensível.
- Não adicionar secret keys nem a palavra-passe da base de dados à aplicação.

## Razões

- Componentes do browser e do servidor têm contextos e responsabilidades diferentes.
- A integração SSR permite que a sessão seja usada em Server Components, Server Actions e Route Handlers.
- Uma verificação independente das tabelas permite confirmar a configuração antes de existir um modelo de dados.
- A publishable key foi concebida para utilização pública em conjunto com permissões e políticas Row Level Security.

## Consequências

- A autenticação exigirá posteriormente um `proxy.ts` para renovar sessões.
- As tabelas continuarão inacessíveis até receberem permissões e políticas RLS explícitas.
- A rota de saúde indica apenas disponibilidade geral e não substitui testes de autenticação ou segurança.
