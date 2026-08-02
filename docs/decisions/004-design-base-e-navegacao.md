# 004 — Design base e navegação

Data: 2 de agosto de 2026  
Estado: aceite

## Contexto

A Fase 2 precisava de transformar a base técnica numa interface navegável, responsiva e coerente com a referência visual aprovada, sem antecipar autenticação ou persistência de dados.

## Decisão

- Usar um estilo SaaS claro, profissional e minimalista.
- Usar azul como cor principal e cores semânticas para estados.
- Usar Geist como tipografia principal.
- Criar uma sidebar recolhível no computador e um drawer no telemóvel.
- Manter o cabeçalho com pesquisa visual, notificações e área de utilizador.
- Usar Server Components por defeito e limitar Client Components à navegação interativa e aos limites de erro.
- Criar componentes reutilizáveis para cartões, botões, badges, campos, cabeçalhos, loading, vazio e erro.
- Usar Lucide React para ícones consistentes.
- Apresentar tabela de candidaturas no computador e cartões no telemóvel.
- Usar dados de demonstração claramente identificados enquanto não existir modelo de dados.

## Páginas criadas

- Dashboard.
- Candidaturas e nova candidatura.
- Empresas.
- Recrutadores.
- Entrevistas.
- Ações.
- Definições.
- Login e registo.
- Página não encontrada.

## Razões

- A sidebar mantém as áreas principais sempre acessíveis em ecrãs grandes.
- O drawer preserva espaço útil no telemóvel.
- Componentes reutilizáveis reduzem divergências visuais e facilitam futuras alterações.
- Dados de demonstração permitem validar hierarquia, densidade e responsividade antes de fixar o modelo de dados.
- Manter a maior parte da interface no servidor reduz JavaScript enviado ao browser.

## Consequências

- Botões e formulários visíveis ainda não persistem dados.
- Pesquisa, filtros e notificações são apenas elementos visuais nesta fase.
- Os dados de demonstração serão substituídos por queries ao Supabase em fases posteriores.
- A proteção das páginas será implementada na fase de autenticação.
