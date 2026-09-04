# ADR 018 — Interface em português e inglês

Estado: implementada, com publicação autorizada pelo utilizador

Data: 4 de setembro de 2026

## Decisão

- Usar `next-intl` com os idiomas `pt-PT` (predefinido) e `en-GB`.
- Manter as rotas existentes, sem prefixos de idioma, para preservar ligações e redirecionamentos de autenticação.
- Guardar a preferência no cookie `job-tracker-locale`, válido durante um ano e disponível no servidor para renderizar o idioma correto desde o primeiro pedido.
- Disponibilizar a seleção no cabeçalho, na autenticação e nas Definições.
- Centralizar os textos nos dicionários `messages/pt-PT.json` e `messages/en-GB.json`, com chaves tipadas.
- Traduzir a interface, não os dados escritos ou importados pelo utilizador. Nomes, descrições de vagas, guiões, notas e tipos de entrevista já guardados permanecem intactos.
- Preservar os valores internos dos estados e contratos. As sugestões para novas entrevistas usam o idioma selecionado.
- Formatar datas, valores e contagens segundo o idioma. Não alterar o fuso horário existente nem converter moedas.

## Cobertura implementada

- Estrutura global, navegação, seleção de tema e de idioma.
- Ecrãs e formulários de autenticação; perfil e Definições.
- Dashboard, métricas, estados, atividade e datas.
- Lista, criação, edição e detalhe das candidaturas, com filtros e importador de vagas.
- Lista, resumo, criação e edição de entrevistas, incluindo seleção rápida do estado, guião e resultado/notas em modais.
- Notas da candidatura e botões rápidos para concluir/reabrir tarefas.
- Carregamento e páginas de registo não encontrado no percurso de candidaturas e entrevistas.
- Empresas e Recrutadores: listas, pesquisa, formulários, confirmações de eliminação, contagens, carregamento e registos não encontrados.
- Criação rápida de empresas na candidatura e pesquisa, seleção, remoção e gravação de logótipos em lote.
- Validação de campos e mensagens das ações de Empresas/Recrutadores, incluindo erros do serviço de pesquisa de logótipos.
- Tarefas: lista, filtros, prioridades, prazos, criação, edição, eliminação e estados rápidos, incluindo validação e mensagens do servidor.
- Agenda: filtros por tipo/período, contagens, datas, indicadores de hoje/amanhã e textos de fallback, preservando as descrições guardadas e o fuso horário.
- Validação e mensagens das ações de autenticação, perfil, candidaturas, entrevistas e notas, incluindo erros de estados rápidos, guiões e resultado/notas.
- Avisos e erros da API de importação no idioma escolhido. Erros conhecidos usam chaves tipadas; erros inesperados devolvem uma mensagem genérica, sem expor detalhes técnicos.
- Páginas globais de erro e 404. O erro do layout raiz funciona sem o provider de traduções: usa PT como fallback no servidor e lê a preferência do cookie após hidratação.

## Validação visual e documentação

- O utilizador confirmou o funcionamento local e forneceu imagens dos dois idiomas e temas, incluindo mobile.
- O README inclui seis versões ilustrativas anonimizadas. A edição por IA e as possíveis diferenças visuais estão identificadas na galeria.
- Os testes automáticos não substituem uma auditoria completa de acessibilidade nem cobrem visualmente todas as combinações de idioma, tema e dispositivo.

Os emails enviados pelo Supabase não foram alterados nesta etapa. Mensagens internas de diagnóstico, textos originais importados e valores já guardados não são traduzidos automaticamente.

## Ajuste detetado nos testes do importador

Os parsers do LinkedIn, do Indeed sem dados estruturados e do texto colado cortavam a descrição aos 5 000 caracteres antes de a API gerar o aviso. O corte fica agora apenas na resposta da API, depois de medir o texto original. O limite guardado mantém-se em 5 000 caracteres, mas o aviso prévio passa a funcionar nesses percursos em ambos os idiomas. Os limites de tamanho da página/texto e as verificações de endereços públicos mantêm-se.

## Verificação e publicação

### Validação final para publicação

Em 4 de setembro de 2026, após autorização do utilizador: os seis scripts de teste, TypeScript, ESLint e o build de produção passaram. O build foi repetido com acesso à rede para obter as fontes Google. As ligações locais do README e o diff preparado para commit foram verificados. A verificação global do Prettier assinala 15 ficheiros preexistentes, fora desta alteração; os ficheiros desta entrega estão formatados. Não foram alterados dados do Supabase nem iniciado ou parado o servidor de desenvolvimento.

A entrega inclui a interface PT/EN, a elegibilidade de candidaturas para novas entrevistas, o aviso de descrições longas e a galeria de seis imagens ilustrativas anonimizadas. Os originais das capturas, a pasta `context/`, as variáveis privadas e os logótipos locais não relacionados ficam fora do commit.

### Regra de criação de entrevistas

A pedido do utilizador, só `applied` e `awaiting_response` permitem criar entrevistas. A lista de opções da página de criação filtra estes estados; os atalhos no detalhe e edição da candidatura só são apresentados quando elegível. A Server Action consulta novamente o estado e a pertença ao utilizador antes de inserir, recusando formulários desatualizados ou manipulados com mensagens PT/EN. A consulta e edição de entrevistas existentes, assim como os filtros históricos, mantêm-se disponíveis independentemente do estado da candidatura. Não foi adicionada uma migração: esta verificação aplica-se ao percurso de criação da aplicação, não constitui uma restrição de base de dados para outros clientes.

`pnpm test:interview-eligibility` exercita a lógica real com Supabase simulado: 16 combinações de estado/idioma, opções filtradas, formulários desatualizados, candidaturas alheias/inexistentes, erros de consulta e edição histórica. Não altera dados reais. O catálogo passa a ter 1 013 textos por idioma.

Verificação desta regra: TypeScript, lint, os seis scripts de teste e build de produção passaram. O build necessitou de acesso à rede para obter as fontes Google. Sem push ou alterações em dados reais; confirmar o percurso visual local antes de publicar.

### Testes de localização

`pnpm test:i18n` verifica a paridade de chaves, parâmetros de interpolação, textos vazios e formatação ICU nos dois dicionários, exercitando contagens 0, 1 e 2. Deve acompanhar `pnpm typecheck`, `pnpm lint` e o build.

`pnpm test:companies-recruiters` executa os validadores reais em memória, sem servidor nem acesso à base de dados. Verifica 48 casos de erro nos dois idiomas, limites aceites, campos opcionais e a preservação dos valores normalizados (nomes, emails, URLs e modalidade).

`pnpm test:tasks-calendar` verifica 18 casos de erro de tarefas nos dois idiomas, limites e datas válidas, combinações de estado/prioridade e preservação dos dados. Exercita também os formatadores de datas da agenda/tarefas e horas de entrevista no horário de verão e inverno de Lisboa, sem servidor nem base de dados.

`pnpm test:remaining-validation` verifica 114 casos de erro de campos nos dois idiomas, mais verificações de autenticação/notas, limites aceites, assinaturas de imagens e preservação dos dados normalizados.

`pnpm test:job-import-messages` executa a rota e os parsers reais com autenticação, DNS e fetch simulados. Verifica 30 casos de erro/proteção, avisos, normalização de URLs e descrições com 5 000, 5 001 e 6 000 caracteres nos quatro percursos (dados estruturados, LinkedIn, Indeed e texto colado). Não faz pedidos aos sites nem acede ao Supabase; não garante disponibilidade dos serviços externos.

As alterações foram preparadas na branch `codex/english-localization`. Após a confirmação local, o utilizador autorizou a publicação no GitHub, incluindo a galeria e o texto do README. Não é necessária uma migração do Supabase. Os registos abaixo descrevem as verificações de cada etapa, antes dessa autorização.

Primeira verificação em 4 de setembro de 2026: TypeScript, lint, teste dos 564 textos em cada idioma e build de produção concluídos com sucesso. A etapa de Empresas/Recrutadores aumenta o catálogo para 766 textos por idioma e acrescenta testes de validação. Os fluxos autenticados e a apresentação em mobile continuam a requerer validação manual; não foi iniciado nem parado o servidor de desenvolvimento e não foi feito push.

Verificação da etapa Empresas/Recrutadores: TypeScript, lint, os 766 textos por idioma, os 48 casos de validação e o build de produção passaram. O build necessitou de acesso à rede para obter as fontes Google; não publicou a aplicação nem alterou dados no Supabase.

Verificação da etapa Tarefas/Agenda: TypeScript, lint, os 879 textos por idioma, os 48 casos de Empresas/Recrutadores, os 18 casos de Tarefas/Agenda e o build de produção passaram. O build precisou novamente de acesso à rede para obter as fontes. Sem push, alterações no Supabase ou gestão do servidor de desenvolvimento; a revisão visual e os fluxos autenticados ficam para validação manual.

Verificação da etapa de mensagens/validações/importador: TypeScript, lint, os 1 009 textos por idioma, os cinco scripts de teste e o build de produção passaram. A formatação dos ficheiros alterados foi aplicada e o diff não apresenta erros de whitespace. O build precisou de acesso à rede para descarregar fontes. Não foi iniciado/parado o servidor de desenvolvimento, não foram enviados commits e não foram alterados dados ou configurações no Supabase.

Revisão final do código: os cabeçalhos de carregamento de Dashboard/Definições usam agora os mesmos dicionários das páginas. O contador do importador formata também o limite segundo o idioma. Nas Definições, o seletor expandido passa a empilhar texto e botões em ecrãs pequenos; no login/registo, o conteúdo reserva espaço superior para os controlos de idioma/tema. `test:i18n` verifica adicionalmente os 11 ficheiros de carregamento contra títulos/descrições literais. TypeScript, lint e este teste passaram. Não foi repetido o build nesta revisão. A verificação no browser está pendente: `localhost:3000` não estava disponível, e o servidor continua a ser iniciado manualmente pelo utilizador. Estes ajustes de layout ainda precisam de confirmação visual.
