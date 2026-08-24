# ADR 016 — Importação assistida e detalhe de entrevistas

Estado: aceite
Data: 24 de agosto de 2026

## Contexto

O registo manual de uma candidatura repete informação já presente na página da vaga. Ao mesmo tempo, a lista de entrevistas encaminhava diretamente para o formulário de edição, mesmo quando o utilizador queria apenas consultar a preparação.

## Decisão

### Importação de vagas

- O formulário disponibiliza um importador autenticado e sempre sujeito a revisão.
- O dashboard liga diretamente à nova candidatura com o importador aberto.
- Páginas externas podem ser consultadas quando publicam dados estruturados `JobPosting` em JSON-LD.
- O pedido bloqueia hosts locais, endereços privados, respostas demasiado grandes, protocolos inesperados e cadeias excessivas de redirecionamentos.
- Uma ação explícita do utilizador pode consultar uma única página pública do LinkedIn, sem cookies, sessão ou credenciais da conta. O parser extrai apenas os campos visíveis da vaga; não percorre resultados, perfis ou vagas relacionadas.
- Links de resultados do LinkedIn são reduzidos ao `currentJobId`; links do Indeed usam `jk` ou `vjk`. Os parâmetros de pesquisa e rastreio são removidos antes da consulta e do armazenamento.
- Como a página normal do Indeed bloqueia consultas feitas pelo servidor, a aplicação consulta a representação móvel incorporada da mesma vaga e preserva o endereço normalizado para utilização pelo utilizador. O texto continua disponível como fallback caso esse endpoint também não responda.
- O texto colado permanece como fallback para vagas removidas, privadas ou páginas cuja estrutura deixou de ser reconhecida.
- A extração preenche título, empresa, localização, modalidade, descrição, link e fonte.
- Descrições acima do limite da candidatura são truncadas para 5 000 caracteres durante a análise e produzem um aviso visível antes da confirmação.
- Uma empresa existente é reutilizada por comparação de nome sem distinção de maiúsculas ou acentos.
- Uma empresa nova só é criada depois da confirmação do utilizador no formulário rápido, onde o logótipo pode ser revisto ou pesquisado.

### Entrevistas

- `/entrevistas/[interviewId]` passa a ser a página de consulta da entrevista.
- Os cartões da lista abrem o resumo; ligações externas e o botão “Editar” mantêm ações independentes.
- O resumo apresenta o contexto da candidatura, agendamento, pessoas, preparação geral e específica, perguntas, feedback e resultado.
- Guardar uma edição regressa ao resumo da mesma entrevista, preservando a origem quando a navegação começou na candidatura.
- O resumo permite editar num modal o guião pessoal/CV e as perguntas para a empresa guardados na candidatura. O guião específico da entrevista continua a ser alterado no formulário completo da entrevista.
- Feedback, notas e resultado também podem ser atualizados num modal próprio durante ou depois da conversa.

## Consequências

- A importação reduz trabalho repetitivo sem depender das credenciais do LinkedIn ou de crawling em massa.
- A integração com o HTML público do LinkedIn é assumidamente frágil e pode precisar de manutenção quando a plataforma alterar a estrutura da página.
- A qualidade dos dados extraídos de texto depende do conteúdo colado e exige confirmação humana.
- Sites sem JSON-LD precisam do mesmo fallback de texto usado pelo LinkedIn.
- A consulta e a edição de entrevistas ficam claramente separadas.
- Não é necessária qualquer migração da base de dados.
