# Decisões de design e experiência

Estado: aprovado na Fase 0  
Data: 2 de agosto de 2026

## Identidade

- Nome: Job Application Tracker.
- Personalidade: profissional, moderna e simples.
- Referência principal: `context/exampleEndResult.png`.
- Aspeto: aplicação SaaS minimalista, com elevada legibilidade e bastante espaço visual.
- Não é necessário criar um logótipo personalizado para o MVP; pode ser usado um símbolo simples associado a emprego ou candidaturas.

## Cores e tema

- Apenas modo claro no MVP.
- Azul como cor principal para navegação, ligações e ações primárias.
- Fundos brancos ou cinzento muito claro.
- Texto principal escuro e texto secundário cinzento.
- Contraste e significado nunca devem depender apenas da cor.

### Cores semânticas dos estados

| Estado              | Cor indicativa |
| ------------------- | -------------- |
| Candidatura enviada | Azul           |
| Entrevista agendada | Roxo           |
| A aguardar resposta | Amarelo/âmbar  |
| Proposta recebida   | Verde          |
| Rejeitada           | Vermelho       |
| Retirada            | Neutro         |

As tonalidades finais serão validadas por contraste durante a implementação.

## Navegação responsiva

- Computador: sidebar recolhível e cabeçalho com pesquisa e conta do utilizador.
- Telemóvel: menu no cabeçalho.
- O item da página atual deve estar claramente identificado.
- A ação “Nova candidatura” deve estar facilmente acessível.

## Dashboard

- Organização em cartões e listas, seguindo a imagem de referência.
- Primeira área: indicadores principais.
- Segunda área: candidaturas recentes e próximas entrevistas.
- Terceira área: candidaturas por estado, próximas tarefas e atividade recente.
- O layout reduz o número de colunas progressivamente em ecrãs menores.
- O gráfico será introduzido na fase do dashboard, depois de os cálculos estarem validados.

## Listas

- Candidaturas em tabela no computador.
- Candidaturas em cartões no telemóvel.
- Sem vista Kanban no MVP.
- Badges coloridos identificam os estados.
- A lista principal mostra: vaga, empresa, estado, data, próxima tarefa, follow-up e recrutador.
- O estado pode ser alterado diretamente sem abrir o formulário completo.
- As tarefas rápidas não devem tornar a tabela visualmente pesada; o detalhe continua a ser o ponto principal de gestão.

## Formulários

- Formulário de candidatura numa página própria e dividido por secções.
- Um único fluxo permite escolher ou criar os dados relacionados.
- Formulários simples podem usar modais ou painéis laterais quando isso não dificultar a utilização em telemóvel.
- Campos obrigatórios claramente assinalados.
- Validação junto ao campo e resumo útil para erros gerais.
- Confirmação antes de operações destrutivas.

## Detalhe da candidatura

A página inclui:

- resumo;
- oportunidade;
- empresa;
- recrutador principal;
- entrevistas;
- notas;
- próximas tarefas;
- histórico.

No computador, as secções podem ser organizadas em separadores e cartões. No telemóvel, devem formar um percurso vertical simples.

## Linguagem

- Português de Portugal.
- Tom profissional, simples e direto.
- Termos preferidos: “Nova candidatura”, “Eliminar”, “A guardar” e “A aguardar resposta”.
- Nomes internos do código, tabelas e colunas podem permanecer em inglês.

## Estados da interface

Todas as áreas de dados devem prever:

- carregamento;
- estado vazio com indicação da próxima ação;
- erro recuperável com explicação clara;
- sucesso após guardar ou eliminar;
- confirmação antes de eliminar;
- navegação e foco através do teclado.
