# ADR 021 — Preferências visuais e idioma inicial

Estado: implementada, a aguardar validação visual

Data: 6 de setembro de 2026

## Decisão

- Na ausência do cookie `job-tracker-locale`, usar o primeiro idioma enviado pelo browser: `pt-PT` e `pt-BR` apresentam a aplicação em português; qualquer outro valor apresenta inglês.
- Manter a escolha manual como prioridade. Depois de usar o seletor PT/EN, o cookie existente continua a determinar o idioma nos pedidos seguintes.
- Disponibilizar nas Definições uma escala de texto entre 90% e 110%, em intervalos de 5%, evitando valores extremos que poderiam comprometer os controlos e os cartões existentes.
- Guardar a escala em `localStorage`, por browser. Aplicá-la no script inicial do layout antes da primeira renderização para evitar um salto de tamanho após F5.
- Escalar as variáveis tipográficas do Tailwind e o texto herdado, sem alterar dimensões de ícones, espaçamentos ou a lógica da aplicação.
- No tour, apresentar uma cópia visual do item ativo da navegação acima do overlay. A cópia mantém as cores reais do tema e deixa de impor uma superfície branca artificial.

## Impacto

Não é necessária qualquer migração ou alteração aos dados da conta. A preferência de idioma continua num cookie e a escala do texto fica apenas no dispositivo atual. O limite reduzido da escala deve ser revisto manualmente em mobile e desktop, nos dois idiomas e temas.

## Verificação

`pnpm test:preferences` valida a regra PT-PT/PT-BR, o fallback inglês, a ligação entre os ficheiros e a ausência do fundo branco forçado no destaque da navegação. Esta verificação estrutural não substitui a confirmação visual dos cinco tamanhos suportados.

## Ajuste da página de Definições

Em 8 de setembro de 2026, idioma, tema e tamanho de texto foram reunidos num único cartão responsivo. No desktop, os três controlos ocupam colunas lado a lado; em ecrãs pequenos mantêm a ordem vertical. O perfil passou a ter menos espaço vazio, avatar de 80 px e ação de guardar no cabeçalho. A privacidade ocupa um cartão lateral mais curto. Não foram alteradas preferências, validações, ações de servidor ou dados.
