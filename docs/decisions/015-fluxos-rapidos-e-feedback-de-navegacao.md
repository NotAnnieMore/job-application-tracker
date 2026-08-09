# 015 — Fluxos rápidos e feedback de navegação

Data: 9 de agosto de 2026

## Contexto

Após a publicação inicial, os testes com dados reais mostraram três pontos de
fricção: a criação de uma candidatura obrigava a sair do formulário quando a
empresa ainda não existia, a atualização do estado exigia abrir a edição
completa e algumas navegações pareciam não responder enquanto os dados eram
carregados. O cabeçalho também expunha permanentemente o email da conta, o que
dificultava screenshots e demonstrações.

## Decisão

- usar “Tarefas” em toda a interface, mantendo `/acoes` e os nomes internos da
  base de dados para evitar uma migração sem benefício funcional;
- permitir criar uma empresa num modal dentro do formulário da candidatura,
  incluindo pesquisa ou introdução manual do logótipo, e selecioná-la após a
  criação;
- permitir alterar o estado da candidatura diretamente na lista e no respetivo
  detalhe através de uma Server Action autenticada e limitada ao utilizador;
- simplificar o fluxo visível para candidatura enviada, entrevista agendada, a
  aguardar resposta, proposta recebida, rejeitada ou retirada;
- interpretar os estados antigos `interested` como `applied` e
  `interview_completed` como `awaiting_response`, mantendo os valores no enum
  da base de dados apenas para compatibilidade;
- apresentar feedback imediato ao abrir uma candidatura e um esqueleto próprio
  enquanto o detalhe é carregado;
- mostrar títulos e descrições reais nos estados de carregamento das secções
  principais;
- mostrar apenas avatar e nome no cabeçalho, usando ambos como ligação para as
  definições e mantendo o email apenas na página de perfil;
- corrigir a disposição móvel das tarefas pendentes e dos novos seletores de
  estado.

## Consequências

Os fluxos mais frequentes exigem menos navegação e dão resposta visual imediata.
Não é necessária uma migração adicional no Supabase: registos antigos continuam
a ser lidos e passam para os estados atuais quando forem editados. As operações
rápidas continuam protegidas pela sessão, validação de identificadores e RLS.
