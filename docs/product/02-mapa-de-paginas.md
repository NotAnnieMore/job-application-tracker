# Mapa de páginas

Estado: aprovado na Fase 0  
Data: 2 de agosto de 2026

## Área pública

| Página                  | Caminho proposto      | Objetivo                                                             |
| ----------------------- | --------------------- | -------------------------------------------------------------------- |
| Entrada                 | `/`                   | Encaminhar o utilizador para o login ou dashboard conforme a sessão. |
| Login                   | `/login`              | Iniciar sessão.                                                      |
| Registo                 | `/registo`            | Criar uma conta.                                                     |
| Recuperar palavra-passe | `/recuperar-password` | Pedir a recuperação da palavra-passe.                                |

## Área privada

| Página                 | Caminho proposto            | Objetivo                                                                      |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Dashboard              | `/dashboard`                | Mostrar indicadores, prioridades e atividade recente.                         |
| Candidaturas           | `/candidaturas`             | Pesquisar, filtrar, ordenar e consultar candidaturas.                         |
| Nova candidatura       | `/candidaturas/nova`        | Criar a oportunidade e a candidatura num fluxo único.                         |
| Detalhe da candidatura | `/candidaturas/[id]`        | Consultar resumo, empresa, recrutador, entrevistas, notas, ações e histórico. |
| Editar candidatura     | `/candidaturas/[id]/editar` | Alterar os dados da candidatura e oportunidade.                               |
| Empresas               | `/empresas`                 | Listar, pesquisar e gerir empresas.                                           |
| Detalhe da empresa     | `/empresas/[id]`            | Consultar dados, recrutadores, oportunidades e candidaturas relacionadas.     |
| Recrutadores           | `/recrutadores`             | Listar, pesquisar e gerir recrutadores.                                       |
| Detalhe do recrutador  | `/recrutadores/[id]`        | Consultar contactos e candidaturas relacionadas.                              |
| Entrevistas            | `/entrevistas`              | Consultar entrevistas futuras e passadas.                                     |
| Ações                  | `/acoes`                    | Consultar ações pendentes, concluídas e em atraso.                            |
| Definições             | `/definicoes`               | Gerir o perfil e opções essenciais da conta.                                  |

## Navegação principal

A navegação apresenta, por esta ordem:

1. Dashboard
2. Candidaturas
3. Empresas
4. Recrutadores
5. Entrevistas
6. Ações
7. Definições

No computador será usada uma sidebar recolhível. No telemóvel será usado um menu no cabeçalho.

As estatísticas ficam integradas no dashboard durante o MVP e não terão uma página própria.

## Fluxo principal

1. O utilizador entra na página de candidaturas.
2. Seleciona “Nova candidatura”.
3. Introduz o título da vaga, empresa, estado e data.
4. Pode selecionar dados existentes ou criar uma empresa, oportunidade e recrutador sem abandonar o fluxo.
5. Guarda a candidatura.
6. Consulta o detalhe e acrescenta entrevistas, notas ou ações ao longo do processo.
