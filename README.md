# Job Application Tracker

Aplicação web privada para organizar candidaturas, empresas, recrutadores, entrevistas, notas e próximas ações.

## Estado atual

O projeto está na Fase 10. A base Next.js, os clientes Supabase, o sistema visual, a navegação responsiva, o modelo inicial de dados e a autenticação estão configurados. As páginas privadas exigem uma sessão válida e as políticas RLS isolam os dados de cada utilizador. Empresas, vagas, candidaturas, recrutadores, entrevistas, ações, notas e o dashboard estatístico já usam dados reais do Supabase. As listas operacionais incluem pesquisa, filtros combináveis e intervalos de datas guardados no URL. A Agenda agrega entrevistas, follow-ups e ações numa cronologia única.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript em modo estrito
- Tailwind CSS 4
- ESLint e Prettier
- Supabase Auth e PostgreSQL com Row Level Security
- Vercel para publicação

## Páginas disponíveis

- `/` e `/dashboard` — dashboard responsivo
- `/agenda` — agenda cronológica de entrevistas, follow-ups e ações
- `/candidaturas`, `/candidaturas/nova`, `/candidaturas/[id]` e `/candidaturas/[id]/editar`
- `/empresas`, `/empresas/nova` e `/empresas/[id]/editar`
- `/empresas/logotipos` — pesquisa e confirmação de logótipos em lote
- `/recrutadores`, `/recrutadores/novo` e `/recrutadores/[id]/editar`
- `/entrevistas`, `/entrevistas/nova` e `/entrevistas/[id]/editar`
- `/acoes`, `/acoes/nova` e `/acoes/[id]/editar`
- `/definicoes`
- `/login`, `/registo`, `/recuperar-password` e `/atualizar-password`

## Requisitos

- Node.js 20.9 ou superior
- pnpm 11

O Node.js disponível por defeito no computador durante a criação do projeto era o 16.13.0 e terá de ser atualizado para executar esta versão do Next.js fora do ambiente do Codex.

## Configuração local

1. Instalar as dependências:

   ```bash
   pnpm install
   ```

2. Copiar `.env.example` para `.env.local` e preencher a URL e a publishable key do projeto Supabase.

   Para ativar a pesquisa assistida de logótipos, criar uma conta gratuita no
   Brandfetch e preencher também `BRANDFETCH_CLIENT_ID`. Sem esta variável, é
   possível continuar a usar as iniciais ou introduzir um URL de imagem
   manualmente.

3. Iniciar o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

4. Abrir [http://localhost:3000](http://localhost:3000).

5. Confirmar a ligação ao Supabase em [http://localhost:3000/api/health](http://localhost:3000/api/health). A resposta não inclui credenciais nem detalhes internos do projeto.

## Verificações

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

Para formatar os ficheiros automaticamente:

```bash
pnpm format
```

## Documentação

- A definição do produto encontra-se em `docs/product/`.
- As decisões importantes encontram-se em `docs/decisions/`.
- O esquema e as instruções da base de dados encontram-se em `docs/database.md`.
- A autenticação e os respetivos testes encontram-se documentados em `docs/authentication.md`.
- Os documentos que deram origem ao projeto permanecem apenas na pasta local ignorada `context/`.
