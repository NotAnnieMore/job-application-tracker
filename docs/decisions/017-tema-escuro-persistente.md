# ADR 017 — Tema escuro persistente

Estado: aceite

Data: 24 de agosto de 2026

## Contexto

A interface foi criada inicialmente apenas em modo claro. A utilização prolongada e em ambientes com pouca luz justificou uma alternativa escura, sem alterar a identidade visual azul nem exigir novas colunas na base de dados.

## Decisão

- A aplicação disponibiliza os temas claro e escuro.
- O modo claro continua a ser o valor inicial para preservar a experiência dos utilizadores existentes.
- A preferência é guardada em `localStorage`, aplicando-se apenas ao browser atual.
- Um script crítico no layout aplica o tema antes da hidratação para evitar um flash do tema incorreto.
- O tema pode ser alternado no cabeçalho, nas páginas de autenticação e nas Definições.
- Superfícies, texto, bordas, formulários, tabelas, modais, estados e esqueletos usam uma paleta escura comum.
- As caixas com logótipos de empresas mantêm fundo branco para preservar imagens transparentes ou com texto escuro.

## Consequências

- Não é necessária uma migração da base de dados.
- A escolha não é sincronizada automaticamente entre browsers ou dispositivos.
- Novos componentes devem reutilizar as cores semânticas existentes ou incluir contraste equivalente nos dois temas.
- O erro global inclui uma paleta autónoma porque substitui o layout principal quando é apresentado.
