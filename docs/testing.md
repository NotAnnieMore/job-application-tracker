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

### Conta e sessão

- [ ] iniciar e terminar sessão;
- [ ] pedir recuperação de palavra-passe;
- [ ] alterar o nome do perfil;
- [ ] carregar, substituir e remover o avatar;
- [ ] alternar entre modo claro e escuro pelo cabeçalho e pelas Definições;
- [ ] atualizar a página e terminar/iniciar sessão, confirmando que a preferência visual permanece neste browser.
- [ ] atualizar com `F5` em modo escuro e confirmar que não existe um frame branco antes do conteúdo.

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

Os testes que eliminam dados devem usar registos temporários criados para esse
fim, evitando alterar candidaturas reais.
