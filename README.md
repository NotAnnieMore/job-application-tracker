# Job Application Tracker

Aplicação web privada para organizar candidaturas, empresas, recrutadores, entrevistas, notas e próximas ações.

## Estado atual

O projeto encontra-se na Fase 1. A base Next.js e os clientes Supabase estão configurados; a autenticação ainda não foi implementada.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript em modo estrito
- Tailwind CSS 4
- ESLint e Prettier
- Supabase e PostgreSQL nas próximas fases
- Vercel para publicação

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
- Os documentos que deram origem ao projeto encontram-se em `context/`.
