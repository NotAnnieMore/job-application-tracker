# Testes e refinamento

Estado: validação contínua após publicação

Data: 24 de agosto de 2026

## Verificações automáticas

As seguintes verificações devem terminar sem erros antes de cada publicação:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

Executar também `pnpm test:onboarding-ui` para validar a ordem do tour, os alvos
estáveis de cada rota, a migração de perfil e a ativação do formulário progressivo,
e `pnpm test:preferences` para validar a deteção inicial do idioma, a escala de
texto e a preferência visual aplicada antes da renderização.

A versão de produção foi também aberta automaticamente no Microsoft Edge em
larguras de 375 px e 1440 px. Os ecrãs públicos de início de sessão, registo e
recuperação de palavra-passe apresentaram:

- estado HTTP 200;
- títulos e cabeçalhos próprios;
- campos associados às respetivas labels;
- ausência de overflow horizontal;
- ausência de erros na consola;
- redirecionamento de `/dashboard` para `/login` sem uma sessão válida.

## Segurança já validada

- todas as Server Actions voltam a validar o utilizador autenticado;
- os identificadores recebidos em formulários, rotas e filtros são validados;
- as políticas RLS foram testadas anteriormente com duas contas;
- o avatar só aceita JPEG, PNG ou WebP até 2 MB e valida também a assinatura do
  ficheiro;
- eliminações pedem confirmação e as regras de integridade evitam perdas
  acidentais nas relações protegidas.

## Matriz manual no browser

### Idiomas PT-PT / EN-GB (implementação faseada)

- [ ] alternar o idioma no cabeçalho, na autenticação e nas Definições;
- [ ] sem o cookie de idioma, abrir com o browser em PT-PT, PT-BR e EN e confirmar respetivamente PT, PT e EN; depois escolher manualmente outro idioma e confirmar que essa escolha prevalece;
- [ ] confirmar a persistência após F5 e a manutenção das rotas e da sessão;
- [ ] abrir uma candidatura e verificar resumo, contratos conhecidos, datas, salários, contagens e notas nos dois idiomas;
- [ ] confirmar que nomes, textos importados, guiões e notas não são traduzidos nem modificados;
- [ ] abrir a lista e o resumo de uma entrevista, filtrar e alterar rapidamente o estado;
- [ ] criar e editar uma entrevista de teste, verificando as sugestões e os botões de guardar superior/inferior;
- [ ] editar o guião e as perguntas, guardar e confirmar o resumo atualizado;
- [ ] editar resultado/notas no modal e confirmar os textos e contadores no idioma selecionado;
- [ ] criar, editar e eliminar uma nota de teste;
- [ ] alternar PT/EN nas listas de Empresas e Recrutadores e confirmar contagens, pesquisa, filtros e estados vazios;
- [ ] criar e editar uma empresa/contacto de teste, confirmando que nomes e notas não mudam ao alternar o idioma;
- [ ] dentro de uma nova candidatura, criar uma empresa pelo modal, pesquisar um logótipo e confirmar a seleção sem perder os campos preenchidos;
- [ ] pesquisar, selecionar e guardar logótipos em lote, verificando os totais e as mensagens de sucesso/erro;
- [ ] provocar erros de validação em registos de teste (website inválido, logótipo sem HTTPS, email ou LinkedIn inválidos) e confirmar o idioma da mensagem;
- [ ] verificar as confirmações de eliminação e cancelar, sem eliminar dados reais;
- [ ] em Tarefas, combinar e limpar filtros de estado, prioridade, candidatura e prazo nos dois idiomas;
- [ ] criar/editar uma tarefa de teste com e sem prazo, concluir, reabrir e eliminar, verificando confirmações e mensagens no idioma selecionado;
- [ ] confirmar erros de descrição, prazo e seleção de candidatura sem modificar dados reais;
- [ ] na Agenda, alternar filtros de tipo/período e verificar contagens, estados vazios, datas por extenso e indicadores Hoje/Amanhã/Em atraso em PT/EN;
- [ ] confirmar que horas de entrevistas e datas dos prazos se mantêm ao mudar o idioma, tal como as descrições escritas pelo utilizador;
- [ ] verificar os ecrãs de carregamento e os estados de registo não encontrado;
- [ ] em PT/EN, provocar erros locais nos formulários de conta, perfil, candidatura, entrevista e nota; confirmar que a mensagem e os campos assinalados usam o idioma escolhido;
- [ ] importar uma descrição com mais de 5 000 caracteres e confirmar o aviso antes de aplicar, tanto por link como por texto colado;
- [ ] confirmar que erros de link inválido, vaga não selecionada e site indisponível são apresentados no idioma escolhido;
- [ ] abrir um endereço inexistente e verificar o título, explicação e botão da página 404 nos dois idiomas;
- [ ] numa simulação local de erro, verificar os botões de tentar novamente/regressar ao dashboard; no erro do layout raiz, confirmar o idioma após hidratação e a manutenção do tema;
- [ ] repetir os fluxos a 375 px e nos temas claro/escuro, verificando texto longo e botões sem cortes.
- [ ] a 320/375 px, confirmar que os controlos de idioma/tema não se sobrepõem ao logótipo no login/registo e que o seletor de idioma das Definições dispõe de espaço próprio;
- [ ] em inglês, confirmar que o carregamento de Dashboard/Definições não mostra textos portugueses e que o limite do contador do importador aparece como `5,000`.

Executar também `pnpm test:i18n`, `pnpm test:companies-recruiters` e
`pnpm test:tasks-calendar`, `pnpm test:remaining-validation` e
`pnpm test:job-import-messages`. Estes testes
validam os dicionários e os validadores puros, mas não substituem a revisão visual
e os testes autenticados. O teste do importador simula todos os acessos externos:
não verifica a disponibilidade real do LinkedIn, Indeed ou Supabase. Consultar
[ADR 018](decisions/018-idiomas-pt-en.md) para a cobertura e os textos ainda pendentes.

### Conta e sessão

- [ ] iniciar e terminar sessão;
- [ ] pedir recuperação de palavra-passe;
- [ ] alterar o nome do perfil;
- [ ] carregar, substituir e remover o avatar;
- [ ] alternar entre modo claro e escuro pelo cabeçalho e pelas Definições;
- [ ] atualizar a página e terminar/iniciar sessão, confirmando que a preferência visual permanece neste browser.
- [ ] atualizar com `F5` em modo escuro e confirmar que não existe um frame branco antes do conteúdo.
- [ ] nas Definições, percorrer 90%, 95%, 100%, 105% e 110%, confirmar a persistência após F5 e verificar que não surgem cortes ou overflow a 320/375 px e no desktop.
- [ ] nas Definições, confirmar que idioma, tema e tamanho do texto aparecem no mesmo cartão, que o perfil e a privacidade formam duas colunas no desktop e que todos os blocos empilham corretamente em mobile.

### Dados principais

- [ ] criar, editar e eliminar uma empresa sem vagas;
- [ ] confirmar que uma empresa com vagas não é eliminada;
- [ ] criar uma empresa dentro do formulário de candidatura e confirmar a seleção automática;
- [ ] importar uma vaga de um site com dados estruturados e rever todos os campos antes de aplicar;
- [ ] importar uma descrição com mais de 5 000 caracteres, confirmar o aviso de truncagem antes de preencher e validar que o resumo não fica vazio;
- [ ] importar uma vaga pública do LinkedIn usando apenas o link e confirmar título, empresa, localização, descrição e logótipo;
- [ ] importar uma vaga a partir de um link de resultados do LinkedIn com `currentJobId` e confirmar que o link guardado fica no formato `/jobs/view/ID/`;
- [ ] importar um link do Indeed com `jk` ou `vjk`, confirmar a leitura pelo endpoint incorporado e a normalização do link guardado para `/viewjob?jk=...`;
- [ ] abrir “Importar vaga” diretamente pelo dashboard e confirmar que o modal aparece sem outro clique;
- [ ] guardar uma candidatura através do botão no topo do formulário e confirmar que o botão inferior continua disponível;
- [ ] confirmar que o fallback de texto continua disponível quando a vaga já não está pública;
- [ ] confirmar que uma empresa existente é reutilizada e que uma empresa nova só é criada após confirmação;
- [ ] confirmar a sugestão ou edição manual do logótipo durante a criação da empresa importada;
- [ ] criar, editar, consultar e eliminar uma candidatura de teste;
- [ ] alterar rapidamente o estado da candidatura na lista e no detalhe;
- [ ] no modo escuro, percorrer todos os estados rápidos e confirmar o contraste do texto, fundo, borda e opções do menu;
- [ ] confirmar o fluxo candidatura enviada, entrevista agendada, a aguardar resposta e resultado final;
- [ ] criar, editar e eliminar um recrutador;
- [ ] criar, editar e eliminar uma entrevista;
- [ ] criar entrevistas apenas em candidaturas enviadas (`applied`) ou a aguardar resposta (`awaiting_response`); confirmar que todos os outros estados ficam fora do seletor de criação e não apresentam atalhos de agendamento no detalhe/edição da candidatura;
- [ ] com o formulário de nova entrevista aberto, rejeitar a candidatura noutro separador e confirmar que guardar é recusado com mensagem PT/EN;
- [ ] confirmar que o filtro da lista de entrevistas continua a incluir candidaturas terminadas e que entrevistas antigas podem ser consultadas/editadas depois de uma rejeição;
- [ ] sem candidaturas elegíveis, confirmar a explicação dos estados permitidos e a ligação para consultar candidaturas;
- [ ] abrir uma entrevista pelo cartão, consultar o resumo e só depois entrar no modo de edição;
- [ ] alterar o estado diretamente num cartão da lista e no resumo da entrevista, confirmando a atualização sem abrir o formulário completo;
- [ ] marcar uma entrevista como “Concluída” pela alteração rápida e pelo formulário completo e confirmar que a candidatura passa automaticamente para “A aguardar resposta”, sem substituir estados finais como proposta, rejeitada ou retirada;
- [ ] editar o “Guião pessoal e CV” e as “Perguntas para a empresa” através do modal e confirmar que a página de resumo permanece aberta;
- [ ] confirmar que o resumo e o formulário apresentam apenas o guião pessoal e CV e as perguntas para a empresa, sem o bloco de guião específico da entrevista;
- [ ] editar “Feedback e notas” e “Resultado” através do modal e confirmar a atualização imediata do resumo;
- [ ] guardar uma entrevista pelos botões superior e inferior e confirmar o regresso ao respetivo resumo;
- [ ] criar, concluir, reabrir e eliminar uma ação;
- [ ] criar, editar e eliminar uma nota no detalhe da candidatura.

### Pesquisa e navegação

- [ ] pesquisar pelo cabeçalho e confirmar a abertura de `/candidaturas`;
- [ ] clicar no nome ou avatar do cabeçalho e confirmar a abertura de `/definicoes`;
- [ ] confirmar que o email não é apresentado no cabeçalho;
- [ ] combinar filtros e limpar todos;
- [ ] testar filtros de datas válidos e uma pesquisa sem resultados;
- [ ] confirmar os toasts de sucesso e que não reaparecem ao atualizar;
- [ ] confirmar que o título da secção permanece visível durante o carregamento;
- [ ] confirmar o feedback visual ao abrir uma candidatura;
- [ ] confirmar que IDs inválidos no URL são ignorados sem erro.

### Telemóvel e teclado

- [ ] abrir e fechar o menu móvel pelo botão, pelo fundo e pela tecla Escape;
- [ ] num ecrã tátil, deslizar a partir da margem esquerda para abrir o menu e deslizar da direita para a esquerda para o fechar, confirmando que o scroll vertical não é acionado por engano;
- [ ] confirmar que Tab não sai do menu enquanto está aberto;
- [ ] usar “Saltar para o conteúdo” com a tecla Tab;
- [ ] percorrer formulários e ações sem usar o rato;
- [ ] no formulário de candidatura, confirmar que “Importar vaga” é apresentado como um botão quadrado com ícone a 375 px e recupera o texto em ecrãs maiores;
- [ ] abrir o detalhe de uma entrevista com títulos, guiões, perguntas, participantes e contactos longos a 375 px;
- [ ] confirmar que todo o conteúdo da entrevista quebra dentro dos cartões, sem scroll horizontal nem elementos cortados à direita.
- [ ] numa conta com `onboarding_version = 0`, confirmar o welcome e percorrer os nove passos com rato, Tab, setas e Escape;
- [ ] terminar ou ignorar a visita, iniciar sessão com a mesma conta noutro dispositivo e confirmar que o welcome não reaparece;
- [ ] reiniciar manualmente a visita pela barra lateral nos temas claro/escuro e em PT/EN;
- [ ] confirmar que, em cada rota do tour, o item correspondente da barra lateral mantém o mesmo aspeto ativo e permanece iluminado sem uma caixa branca artificial;
- [ ] criar uma candidatura com os detalhes recolhidos, importar uma vaga e confirmar que os campos avançados preenchidos são guardados;
- [ ] provocar um erro num campo avançado e confirmar que a secção abre para mostrar a mensagem;

Os testes que eliminam dados devem usar registos temporários criados para esse
fim, evitando alterar candidaturas reais.
