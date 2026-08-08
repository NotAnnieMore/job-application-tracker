# Base de dados

Estado: migração inicial aplicada e validada na Fase 3

Data: 2 de agosto de 2026

## Objetivo

O modelo guarda empresas, contactos, vagas, candidaturas e toda a atividade associada. Cada registo funcional identifica o respetivo utilizador através de `user_id`.

## Estrutura

| Tabela          | Responsabilidade                                                  |
| --------------- | ----------------------------------------------------------------- |
| `profiles`      | Nome e dados de apresentação ligados à conta Supabase.            |
| `companies`     | Empresas acompanhadas pelo utilizador.                            |
| `recruiters`    | Contactos, opcionalmente associados a uma empresa.                |
| `opportunities` | Vagas existentes numa empresa.                                    |
| `applications`  | Estado, datas, follow-up e preparação de cada candidatura.        |
| `interviews`    | Entrevistas e respetiva preparação, participantes e feedback.     |
| `notes`         | Histórico cronológico de notas de uma candidatura.                |
| `actions`       | Tarefas pendentes, concluídas ou canceladas para uma candidatura. |

Uma empresa pode ter vários recrutadores e vagas. Uma candidatura corresponde a uma vaga, pode ter um recrutador principal e pode ter várias entrevistas, notas e ações.

## Preparação para entrevistas

`applications` inclui dois campos opcionais:

- `interview_preparation`: guião específico da candidatura com respostas, exemplos e pontos do CV a preparar;
- `questions_for_company`: perguntas que o candidato quer fazer à empresa.

Uma biblioteca reutilizável de respostas comuns pode ser acrescentada depois do MVP. Nesta fase, manter a preparação na candidatura reduz a complexidade e permite adaptar o conteúdo a cada empresa.

## Integridade dos dados

- Os identificadores são UUIDs gerados pelo PostgreSQL.
- Nomes, títulos, notas e descrições obrigatórias não podem estar vazios.
- Valores salariais não podem ser negativos e o mínimo não pode exceder o máximo.
- A moeda usa um código de três letras e começa em `EUR`.
- O nome de uma empresa não pode repetir-se para o mesmo utilizador, ignorando maiúsculas e espaços nas extremidades.
- Os campos `updated_at` são atualizados automaticamente por trigger.
- Relações compostas por `user_id` impedem associar registos pertencentes a utilizadores diferentes, mesmo que a aplicação tenha um erro.

## Regras de eliminação

| Operação                                       | Comportamento                                        |
| ---------------------------------------------- | ---------------------------------------------------- |
| Eliminar a conta                               | Elimina todos os dados pertencentes ao utilizador.   |
| Eliminar empresa com vagas                     | Bloqueado até as vagas serem tratadas.               |
| Eliminar empresa associada apenas a recrutador | Mantém o recrutador e remove a associação à empresa. |
| Eliminar vaga com candidatura                  | Bloqueado para evitar perda acidental de histórico.  |
| Eliminar recrutador principal                  | Mantém a candidatura sem recrutador principal.       |
| Eliminar candidatura                           | Elimina entrevistas, notas e ações associadas.       |

As eliminações em cascata ficam limitadas a dados claramente dependentes. As operações visíveis na interface terão confirmação numa fase posterior.

## Estados fixos

Os valores são guardados em inglês e traduzidos na interface:

| Valor técnico         | Texto na interface   |
| --------------------- | -------------------- |
| `interested`          | Interessado          |
| `applied`             | Candidatura enviada  |
| `interview_scheduled` | Entrevista agendada  |
| `interview_completed` | Entrevista concluída |
| `awaiting_response`   | A aguardar resposta  |
| `offer_received`      | Proposta recebida    |
| `rejected`            | Rejeitada            |
| `withdrawn`           | Retirada             |

As ações usam os estados `pending`, `completed` e `cancelled`, com prioridades `low`, `medium` e `high`.

## Segurança

Todas as tabelas têm Row Level Security ativo. A role `anon` não recebe permissões. As 30 políticas que usam `auth.uid()` foram criadas e testadas com duas contas na Fase 4. Cada tabela funcional permite consultar, criar, editar e eliminar apenas linhas pertencentes ao utilizador autenticado.

## Integração da tabela `companies`

Na Fase 5, a página `/empresas` passou a consultar dados reais. A integração inclui:

- Data Access Layer executado apenas no servidor;
- listagem limitada ao utilizador autenticado;
- criação, edição e eliminação através de Server Actions;
- nova validação da sessão e dos dados em cada operação;
- mensagens próprias para nomes duplicados e empresas com vagas associadas;
- contagem de candidaturas derivada das relações com vagas;
- estados de carregamento, erro e lista vazia.

Os fluxos foram testados no browser com uma conta real, incluindo criação, edição, rejeição de duplicados e eliminação.

### Identidade visual das empresas

`companies.logo_url` guarda opcionalmente um endereço HTTPS para o logótipo. A
interface tenta mostrar essa imagem e regressa sempre às iniciais da empresa se
o campo estiver vazio ou se a imagem falhar. O endereço pode ser introduzido
manualmente ou escolhido nos resultados da pesquisa assistida do Brandfetch.

A pesquisa é feita por uma Route Handler autenticada, para que apenas
utilizadores com sessão possam consultar o serviço a partir da aplicação. O
Client ID fica configurado em `BRANDFETCH_CLIENT_ID`; sem essa variável, o URL
manual e as iniciais continuam disponíveis.

A página `/empresas/logotipos` pesquisa em grupos pequenos todas as empresas sem
imagem. Nenhuma sugestão é aplicada automaticamente: o utilizador confirma as
correspondências corretas e envia todas as escolhas numa única Server Action.
Essa ação volta a validar a sessão, os identificadores, a propriedade dos
registos e os endereços HTTPS antes de atualizar cada empresa.

## Integração de vagas e candidaturas

Na Fase 5, `/candidaturas` e o respetivo formulário passaram a usar dados reais. O fluxo inclui:

- criação conjunta de uma vaga e candidatura;
- edição conjunta dos dois registos;
- eliminação da candidatura, da vaga e dos dados claramente dependentes;
- pesquisa por vaga, empresa ou recrutador;
- filtros por estado, empresa e modalidade;
- ordenação por data da candidatura ou próximo follow-up;
- atualização automática ao alterar filtros de seleção;
- campos de preparação pessoal/CV e perguntas para a empresa.

As operações que abrangem as duas tabelas usam funções PostgreSQL transacionais com `security invoker`. As funções obtêm o utilizador através de `auth.uid()`, respeitam as políticas RLS e não aceitam um `user_id` enviado pelo browser.

A migração `20260808160000_add_application_transactions.sql` também garante que uma oportunidade só pode ter uma candidatura por utilizador. O catálogo e as permissões das três funções foram validados com `application_transactions_catalog_checks.sql`.

## Aplicar no Supabase

1. Abrir o projeto no Supabase.
2. Entrar em **SQL Editor** e criar uma query nova.
3. Copiar todo o conteúdo de `supabase/migrations/20260802190000_create_initial_schema.sql`.
4. Executar uma única vez e confirmar que aparece `Success. No rows returned`.
5. Criar outra query com `supabase/tests/initial_schema_checks.sql` e executá-la.
6. Confirmar que são apresentadas oito tabelas e que `rls_ativo` está verdadeiro em todas.

A migração inicial e estas verificações foram executadas com sucesso no projeto Supabase em 2 de agosto de 2026.

A publishable key da aplicação não permite alterações de estrutura, por isso a migração deve ser executada no SQL Editor ou, futuramente, através da Supabase CLI autenticada.

Depois da configuração inicial, as alterações seguintes devem ser aplicadas
pela ordem do nome do ficheiro. Para a identidade visual das empresas, executar
`supabase/migrations/20260808190000_add_company_logos.sql` e validar com
`supabase/tests/company_logos_catalog_checks.sql`.

## Dados de demonstração

`supabase/seed.sql` cria um conjunto pequeno de dados para a conta mais antiga do projeto. Só deve ser executado num ambiente de desenvolvimento, depois de existir uma conta de teste e nunca numa base de dados de produção.

## Tipos TypeScript

`src/types/database.types.ts` descreve as linhas, inserções, atualizações, enums e relações conhecidas pelo cliente Supabase. Os clientes do browser e do servidor usam estes tipos desde a Fase 3.

Quando a Supabase CLI for integrada, este ficheiro deve passar a ser gerado diretamente a partir do esquema remoto para evitar divergências manuais.
