# Privacidade e transparência

Estado: em validação

Data: 5 de setembro de 2026

## Decisão

A aplicação passa a ter uma página pública e bilingue em `/privacidade`,
acessível sem autenticação. A ligação é apresentada nos ecrãs de autenticação e
nas Definições da conta.

A informação descreve o funcionamento real da aplicação: categorias de dados,
finalidades, serviços técnicos utilizados, armazenamento local, conservação e
direitos dos utilizadores. Não é publicado nem inventado um endereço de email.

## Limite assumido

Uma política pública não substitui um canal para exercer direitos. Enquanto não
existir um contacto dedicado, a página encaminha o utilizador para os controlos
disponíveis na própria aplicação e identifica a eliminação integral da conta
como uma funcionalidade ainda em preparação. A implementação dessa eliminação
será tratada separadamente por exigir uma operação administrativa segura no
Supabase, confirmação reforçada e validação da remoção dos ficheiros de avatar.

## Segurança e âmbito

- A rota é acrescentada explicitamente à lista de páginas públicas.
- Não são alteradas a autenticação, as políticas RLS ou a base de dados.
- Não são recolhidos novos dados nesta etapa.
- A página acompanha o idioma e o tema já escolhidos no browser.
