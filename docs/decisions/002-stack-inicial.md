# 002 — Stack inicial

Data: 2 de agosto de 2026  
Estado: aceite

## Contexto

O MVP precisa de uma base full-stack moderna, tipada, responsiva e adequada a autenticação e isolamento de dados por utilizador.

## Decisão

- Next.js 16 com App Router e código dentro de `src/`.
- React 19.
- TypeScript em modo estrito.
- Tailwind CSS 4.
- ESLint para análise estática e Prettier para formatação.
- pnpm como gestor de pacotes.
- Alias `@/*` para importações a partir de `src/`.
- Supabase para PostgreSQL, autenticação e Row Level Security.
- Vercel como plataforma de publicação.

## Razões

- Uma única aplicação pode conter interface, componentes de servidor e rotas necessárias ao MVP.
- TypeScript e validação reduzem erros entre formulários, regras de negócio e base de dados.
- Supabase oferece autenticação e controlo de acesso ao nível das linhas sem exigir um backend separado no MVP.
- A stack tem um percurso direto de desenvolvimento local até à publicação na Vercel.

## Consequências

- O ambiente local requer Node.js 20.9 ou superior.
- A autenticação no servidor exigirá uma integração cuidada com cookies e renovação de sessão.
- As políticas de Row Level Security continuam a ser obrigatórias; a filtragem na interface não é uma medida de segurança.
- Atualizações de versões principais serão avaliadas deliberadamente e não aplicadas de forma automática.
