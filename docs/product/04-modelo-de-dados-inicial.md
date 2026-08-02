# Modelo inicial de dados

Estado: proposta funcional aprovada na Fase 0  
Data: 2 de agosto de 2026

Este documento define as entidades e relações necessárias para o produto. Tipos PostgreSQL, constraints, índices, políticas de Row Level Security e comportamentos de eliminação serão detalhados na Fase 3.

## Relações principais

- Um utilizador tem um perfil e é proprietário dos seus dados.
- Uma empresa pode ter vários recrutadores e oportunidades.
- Um recrutador pertence, no máximo, a uma empresa no MVP.
- Uma oportunidade pertence a uma empresa.
- Uma candidatura corresponde a uma oportunidade e pode ter um recrutador principal.
- Uma candidatura pode ter várias entrevistas, notas e ações.

## Entidades

### `profiles`

| Campo funcional                | Obrigatório | Observação                           |
| ------------------------------ | ----------- | ------------------------------------ |
| Utilizador                     | Sim         | Relacionado com a conta autenticada. |
| Nome                           | Sim         | Nome apresentado na interface.       |
| Datas de criação e atualização | Sim         | Auditoria básica.                    |

### `companies`

| Campo funcional                | Obrigatório |
| ------------------------------ | ----------- |
| Proprietário                   | Sim         |
| Nome                           | Sim         |
| Website                        | Não         |
| Localização                    | Não         |
| Setor                          | Não         |
| Modalidade de trabalho         | Não         |
| Notas                          | Não         |
| Datas de criação e atualização | Sim         |

### `recruiters`

| Campo funcional                | Obrigatório |
| ------------------------------ | ----------- |
| Proprietário                   | Sim         |
| Empresa                        | Não         |
| Nome                           | Sim         |
| Email                          | Não         |
| Telefone                       | Não         |
| Cargo                          | Não         |
| LinkedIn                       | Não         |
| Notas                          | Não         |
| Datas de criação e atualização | Sim         |

### `opportunities`

| Campo funcional                | Obrigatório          |
| ------------------------------ | -------------------- |
| Proprietário                   | Sim                  |
| Empresa                        | Sim                  |
| Título da vaga                 | Sim                  |
| Localização                    | Não                  |
| Modalidade                     | Não                  |
| Tipo de contrato               | Não                  |
| Salário mínimo e máximo        | Não                  |
| Moeda                          | Não; EUR por defeito |
| URL da vaga                    | Não                  |
| Tecnologias ou competências    | Não                  |
| Descrição resumida             | Não                  |
| Datas de criação e atualização | Sim                  |

### `applications`

| Campo funcional                | Obrigatório |
| ------------------------------ | ----------- |
| Proprietário                   | Sim         |
| Oportunidade                   | Sim         |
| Estado                         | Sim         |
| Data da candidatura            | Sim         |
| Fonte                          | Não         |
| Recrutador principal           | Não         |
| Salário esperado               | Não         |
| Notas resumidas                | Não         |
| Próxima ação resumida          | Não         |
| Data de follow-up              | Não         |
| Datas de criação e atualização | Sim         |

Enquanto o estado for “Interessado”, a data representa a data em que a oportunidade começou a ser acompanhada. Ao marcar “Candidatura enviada”, o utilizador pode corrigi-la para a data real de envio.

### `interviews`

| Campo funcional                | Obrigatório |
| ------------------------------ | ----------- |
| Proprietário                   | Sim         |
| Candidatura                    | Sim         |
| Tipo                           | Sim         |
| Data e hora                    | Sim         |
| Local ou ligação               | Não         |
| Participantes                  | Não         |
| Preparação                     | Não         |
| Resultado ou feedback          | Não         |
| Datas de criação e atualização | Sim         |

### `notes`

| Campo funcional                | Obrigatório |
| ------------------------------ | ----------- |
| Proprietário                   | Sim         |
| Candidatura                    | Sim         |
| Conteúdo                       | Sim         |
| Datas de criação e atualização | Sim         |

No MVP, as notas independentes pertencem à candidatura. Campos de texto específicos continuam disponíveis em empresas, recrutadores e entrevistas.

### `actions`

| Campo funcional                | Obrigatório |
| ------------------------------ | ----------- |
| Proprietário                   | Sim         |
| Candidatura                    | Sim         |
| Descrição                      | Sim         |
| Data limite                    | Não         |
| Estado                         | Sim         |
| Prioridade                     | Sim         |
| Data de conclusão              | Não         |
| Datas de criação e atualização | Sim         |

## Estados fixos da candidatura

1. Interessado
2. Candidatura enviada
3. Entrevista agendada
4. Entrevista concluída
5. A aguardar resposta
6. Proposta recebida
7. Rejeitada
8. Retirada

Os valores ficam fixos durante o MVP. A forma técnica de os representar será decidida na Fase 3, garantindo tipos consistentes no frontend e na base de dados.

## Segurança a detalhar

- Todas as tabelas funcionais devem identificar o proprietário.
- As políticas de Row Level Security devem impedir leitura e alteração entre utilizadores.
- As relações devem confirmar que todos os registos associados pertencem ao mesmo utilizador.
- A segurança será testada com duas contas distintas antes de a autenticação ser considerada concluída.

## Decisões ainda reservadas para a Fase 3

- Tipos exatos das colunas e identificadores.
- Constraints e índices.
- Regras para duplicados.
- Comportamento de eliminação de empresas, oportunidades e candidaturas.
- Histórico técnico das mudanças de estado.
- Forma de guardar tecnologias e participantes.
- Geração dos tipos TypeScript a partir da base de dados.
