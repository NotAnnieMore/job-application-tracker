# Job Application Tracker

Aplicação web privada para organizar candidaturas, empresas, recrutadores, entrevistas, notas e próximas ações.

## Estado atual

O projeto concluiu a Fase 3. A base Next.js, os clientes Supabase, o sistema visual, a navegação responsiva e o modelo inicial de dados estão configurados. As páginas continuam a usar dados de demonstração até a autenticação com políticas RLS ser concluída.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript em modo estrito
- Tailwind CSS 4
- ESLint e Prettier
- Supabase e PostgreSQL nas próximas fases
- Vercel para publicação

## Páginas disponíveis

- `/` e `/dashboard` — dashboard responsivo
- `/candidaturas` e `/candidaturas/nova`
- `/empresas`
- `/recrutadores`
- `/entrevistas`
- `/acoes`
- `/definicoes`
- `/login` e `/registo`

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
- O esquema e as instruções da base de dados encontram-se em `docs/database.md`.
- Os documentos que deram origem ao projeto encontram-se em `context/`.
