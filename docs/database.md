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

## Segurança nesta fase

Todas as tabelas têm Row Level Security ativo. A role `anon` não recebe permissões e a role `authenticated` recebe as operações necessárias, mas ainda não existem políticas RLS. Consequentemente, o acesso através da Data API permanece fechado.

As políticas que usam `auth.uid()` serão criadas na Fase 4 e testadas com duas contas antes de qualquer página privada usar dados reais.

## Aplicar no Supabase

1. Abrir o projeto no Supabase.
2. Entrar em **SQL Editor** e criar uma query nova.
3. Copiar todo o conteúdo de `supabase/migrations/20260802190000_create_initial_schema.sql`.
4. Executar uma única vez e confirmar que aparece `Success. No rows returned`.
5. Criar outra query com `supabase/tests/initial_schema_checks.sql` e executá-la.
6. Confirmar que são apresentadas oito tabelas e que `rls_ativo` está verdadeiro em todas.

A migração inicial e estas verificações foram executadas com sucesso no projeto Supabase em 2 de agosto de 2026.

A publishable key da aplicação não permite alterações de estrutura, por isso a migração deve ser executada no SQL Editor ou, futuramente, através da Supabase CLI autenticada.

## Dados de demonstração

`supabase/seed.sql` cria um conjunto pequeno de dados para a conta mais antiga do projeto. Só deve ser executado num ambiente de desenvolvimento, depois de existir uma conta de teste e nunca numa base de dados de produção.

## Tipos TypeScript

`src/types/database.types.ts` descreve as linhas, inserções, atualizações, enums e relações conhecidas pelo cliente Supabase. Os clientes do browser e do servidor usam estes tipos desde a Fase 3.

Quando a Supabase CLI for integrada, este ficheiro deve passar a ser gerado diretamente a partir do esquema remoto para evitar divergências manuais.
