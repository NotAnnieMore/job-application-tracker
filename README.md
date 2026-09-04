<p align="center">
  <img src="public/app-icon.png" alt="Job Application Tracker" width="96" height="96" />
</p>

<h1 align="center">Job Application Tracker</h1>

<p align="center">
  Uma aplicação web para centralizar candidaturas, empresas, recrutadores, entrevistas e próximas tarefas durante a procura de emprego.
</p>

<p align="center">
  <a href="https://job-application-tracker-cyan-tau.vercel.app/"><strong>Abrir aplicação</strong></a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth%20%2B%20PostgreSQL-3FCF8E?logo=supabase&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel" />
</p>

![Dashboard em inglês, no modo claro, com dados fictícios](docs/screenshots/anonymized-v2/dashboard-light-en.png)

> As imagens de apresentação foram editadas com IA para substituir dados pessoais e de empresas por exemplos fictícios. São ilustrações da interface e podem apresentar pequenas diferenças visuais face à aplicação.

## Sobre o projeto

O Job Application Tracker foi criado para substituir folhas de cálculo e notas dispersas por um fluxo único de acompanhamento. Cada candidatura reúne a vaga, a empresa, o recrutador, as entrevistas, as notas e as tarefas relacionadas, permitindo consultar rapidamente o estado atual e o próximo passo.

A aplicação encontra-se publicada na Vercel e utiliza o Supabase para autenticação, base de dados e armazenamento. Cada conta acede exclusivamente aos seus próprios registos através de políticas de Row Level Security (RLS).

> [!NOTE]
> A aplicação está online e exige autenticação. Enquanto o projeto utilizar o serviço de email de teste do Supabase, a confirmação de novos registos externos pode estar limitada. Para disponibilizar o registo ao público é necessário configurar um serviço SMTP próprio.

## Funcionalidades

- Dashboard com métricas, taxa de resposta, candidaturas recentes e atalhos rápidos.
- Registo e gestão completa de candidaturas, empresas e oportunidades.
- Importação assistida de vagas através de dados estruturados ou texto colado pelo utilizador, com normalização de links do LinkedIn e Indeed.
- Aviso antes de confirmar uma importação quando a descrição ultrapassa o limite de 5 000 caracteres.
- Atalho de importação no dashboard, abrindo diretamente o importador da nova candidatura.
- Pesquisa, ordenação e filtros combináveis guardados no URL.
- Alteração rápida do estado diretamente na lista e no detalhe da candidatura.
- Página de detalhe com o contexto completo de cada candidatura.
- Gestão de recrutadores e respetivos contactos.
- Página de resumo para preparar, acompanhar e registar o resultado de entrevistas.
- Criação de entrevistas apenas para candidaturas enviadas ou a aguardar resposta, com validação também no servidor. As entrevistas anteriores continuam disponíveis para consulta e edição.
- Edição rápida do guião pessoal/CV e das perguntas para a empresa num modal, sem abandonar o resumo da entrevista.
- Registo rápido de feedback, notas e resultado num modal durante ou depois da entrevista.
- Tarefas com prioridade, prazo e estado, associadas a candidaturas.
- Agenda agregada com entrevistas, follow-ups e tarefas numa cronologia única.
- Gestão de logótipos de empresas, com pesquisa assistida e edição manual.
- Criação rápida de uma empresa durante o registo de uma candidatura, sem abandonar o formulário.
- Perfil com nome e avatar guardado no Supabase Storage.
- Modo claro e escuro com preferência persistente por browser.
- Interface em português de Portugal e inglês, com seleção no cabeçalho, autenticação e Definições. A preferência é guardada no browser; datas, contagens e mensagens acompanham o idioma.
- Interface responsiva para computador e telemóvel.
- Estados de carregamento com títulos reais e feedback imediato durante a navegação.
- Registo, login, logout e recuperação de palavra-passe.

## Galeria

Os exemplos mostram os dois idiomas e temas. Os dados escritos ou importados pelo utilizador — como nomes, descrições, notas e guiões — não são traduzidos automaticamente. Os modelos de email do Supabase também não são alterados pelo seletor de idioma.

### Pesquisa e organização de candidaturas

As candidaturas podem ser pesquisadas, filtradas por vários critérios e ordenadas. Os filtros ativos permanecem no URL, sobrevivendo a recargas e permitindo guardar ou partilhar a vista atual.

![Lista e filtros de candidaturas em inglês, com dados fictícios](docs/screenshots/anonymized-v2/applications-light-en.png)

### Preparação e acompanhamento de entrevistas

O resumo reúne data, duração, formato, contactos e preparação. O estado pode ser atualizado diretamente; o guião pessoal/CV, as perguntas para a empresa e as notas podem ser editados em janelas rápidas, sem abandonar a página.

![Resumo de entrevista em inglês, no modo claro, com dados fictícios](docs/screenshots/anonymized-v2/interview-light-en.png)

### Modo escuro

A preferência de tema é independente do idioma e mantém-se ao navegar e recarregar a página.

![Dashboard em inglês, no modo escuro, com dados fictícios](docs/screenshots/anonymized-v2/dashboard-dark-en.png)

<details>
<summary>Ver também a preparação de entrevista em português</summary>

![Resumo de entrevista em português, no modo escuro, com dados fictícios](docs/screenshots/anonymized-v2/interview-dark-pt.png)

</details>

### No telemóvel

Os blocos e controlos adaptam-se ao ecrã pequeno, permitindo consultar a preparação e atualizar a entrevista durante a conversa.

<img src="docs/screenshots/anonymized-v2/interview-mobile-dark-pt.png" alt="Resumo de entrevista em português no telemóvel, com modo escuro e dados fictícios" width="320" />

[Detalhes da anonimização e galeria completa](docs/screenshots/anonymized-v2/README.md).

## Arquitetura

```mermaid
flowchart LR
    U["Utilizador"] --> N["Next.js na Vercel"]
    N --> A["Supabase Auth"]
    A -->|"sessão e JWT"| N
    N --> R["Supabase API + RLS"]
    R --> D["PostgreSQL"]
    N --> S["Supabase Storage"]
```

- O Next.js utiliza o App Router e combina componentes de servidor, ações de servidor e componentes interativos.
- O Supabase Auth gere as contas e sessões.
- O PostgreSQL guarda os dados relacionais da aplicação.
- As políticas RLS validam o utilizador autenticado em todas as tabelas privadas.
- O Supabase Storage guarda os avatares dos utilizadores.
- A Vercel publica automaticamente a aplicação a partir do repositório GitHub.

## Stack tecnológica

| Área         | Tecnologia                        |
| ------------ | --------------------------------- |
| Aplicação    | Next.js 16, React 19 e App Router |
| Linguagem    | TypeScript em modo estrito        |
| Interface    | Tailwind CSS 4 e Lucide Icons     |
| Idiomas      | next-intl, pt-PT e en-GB          |
| Autenticação | Supabase Auth com suporte SSR     |
| Dados        | Supabase PostgreSQL com RLS       |
| Ficheiros    | Supabase Storage                  |
| Qualidade    | ESLint, Prettier e TypeScript     |
| Publicação   | Vercel                            |

## Segurança

- Todas as páginas da aplicação exigem uma sessão válida.
- Cada tabela privada inclui políticas RLS que isolam os dados por `user_id`.
- Os filtros e identificadores recebidos pelo URL são validados antes das consultas.
- O importador de vagas exige autenticação, limita o tamanho das respostas e bloqueia endereços locais ou privados.
- O LinkedIn é consultado apenas através da página pública da vaga, sem cookies ou credenciais da conta; o texto colado permanece disponível como fallback.
- Os avatares aceitam apenas JPEG, PNG ou WebP até 2 MB e são validados antes do upload.
- As credenciais do Supabase permanecem em variáveis de ambiente e não são incluídas no repositório.

## Executar localmente

### Requisitos

- Node.js 20.9 ou superior
- pnpm 11
- Um projeto Supabase

### Instalação

1. Clonar o repositório e entrar na pasta:

   ```bash
   git clone https://github.com/NotAnnieMore/job-application-tracker.git
   cd job-application-tracker
   ```

2. Instalar as dependências:

   ```bash
   pnpm install
   ```

3. Copiar `.env.example` para `.env.local` e preencher as variáveis:

   | Variável                               | Obrigatória | Finalidade                      |
   | -------------------------------------- | ----------- | ------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`             | Sim         | URL do projeto Supabase         |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sim         | Chave pública do Supabase       |
   | `NEXT_PUBLIC_SITE_URL`                 | Sim         | URL local ou endereço publicado |
   | `BRANDFETCH_CLIENT_ID`                 | Não         | Pesquisa assistida de logótipos |

4. Aplicar, por ordem, as migrações disponíveis em [`supabase/migrations`](supabase/migrations). As instruções detalhadas encontram-se em [`docs/database.md`](docs/database.md).

5. Iniciar o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000). O estado da ligação pode ser confirmado em [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Verificações de qualidade

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test:i18n
pnpm test:companies-recruiters
pnpm test:tasks-calendar
pnpm test:remaining-validation
pnpm test:job-import-messages
pnpm test:interview-eligibility
pnpm build
```

## Documentação

- [Âmbito do produto](docs/product/01-ambito-mvp.md)
- [Mapa de páginas](docs/product/02-mapa-de-paginas.md)
- [Design e experiência](docs/product/03-design-e-experiencia.md)
- [Modelo de dados](docs/database.md)
- [Autenticação e segurança](docs/authentication.md)
- [Testes e validação](docs/testing.md)
- [Interface PT/EN: cobertura e decisões](docs/decisions/018-idiomas-pt-en.md)
- [Decisões técnicas e funcionais](docs/decisions)

Os documentos de contexto usados durante a conceção permanecem apenas na pasta local ignorada `context/` e não fazem parte do repositório.
