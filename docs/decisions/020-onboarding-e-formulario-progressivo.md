# Onboarding guiado e criação progressiva de candidaturas

Estado: em validação

Data: 6 de setembro de 2026

## Decisão

A aplicação passa a apresentar uma visita guiada bilingue, responsiva e adaptada
aos temas claro e escuro. O tour usa `driver.js` e nove alvos estáveis, distribuídos
pelas páginas de Dashboard, criação e lista de Candidaturas, criação e lista de
Entrevistas, Recrutadores e Tarefas.

As mudanças de rota guardam apenas o passo em curso no `sessionStorage`. A decisão
de já ter visto ou dispensado o onboarding é guardada no perfil Supabase através
de `onboarding_version`. Assim, o welcome não reaparece quando a mesma conta inicia
sessão noutro browser ou dispositivo. A visita pode ser repetida a qualquer momento
através de “Ajuda e visita guiada” na barra lateral.

## Formulário de candidatura

Na criação, o formulário começa pelos campos essenciais: título, empresa,
localização, modalidade, tipo de contrato e descrição. Os restantes campos ficam
numa secção “Adicionar mais detalhes”. Os controlos permanecem montados enquanto
estão recolhidos, permitindo que “Importar vaga” continue a preenchê-los e a
submetê-los normalmente. Erros de validação avançados abrem automaticamente a
secção correspondente. A edição mantém todos os campos visíveis.

## Filtros

Os filtros de Candidaturas usam uma grelha de doze colunas em ecrãs largos para
formar duas linhas completas, mantendo duas colunas em tablet e uma coluna em
telemóvel. Parâmetros no URL, submissão automática dos seletores e filtros ativos
não foram alterados.

## Base de dados e segurança

A migração acrescenta `profiles.onboarding_version smallint not null default 0`
com uma restrição que impede valores negativos. As políticas RLS já existentes
continuam a limitar a leitura e atualização do perfil à conta autenticada. A
Server Action deriva sempre o utilizador da sessão e não aceita identificadores
vindos do cliente.
