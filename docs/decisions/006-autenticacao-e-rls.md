# 006 — Autenticação e isolamento por utilizador

Data: 2 de agosto de 2026

Estado: aceite

## Contexto

O modelo de dados já identificava o proprietário de cada registo, mas as tabelas permaneciam fechadas por não existirem políticas RLS. A aplicação precisava de sessões reais antes de substituir os dados de demonstração.

## Decisão

- Usar Supabase Auth com email e palavra-passe.
- Exigir confirmação de email nos projetos alojados.
- Usar o fluxo PKCE e cookies através de `@supabase/ssr`.
- Renovar sessões num `proxy.ts` do Next.js 16.
- Validar identidade no servidor com `getClaims()`.
- Implementar formulários através de Server Actions e `useActionState`.
- Criar perfis através de um trigger `security definer` em `auth.users`.
- Criar políticas separadas de leitura, inserção, edição e eliminação para cada tabela funcional.
- Restringir perfis a leitura e edição próprias; criação e eliminação acontecem com a conta.
- Testar isolamento com duas contas e transação revertida.

## Razões

- O Supabase gere palavras-passe, tokens e renovação de sessão sem expor secret keys à aplicação.
- A confirmação de email reduz contas criadas com endereços que não pertencem ao utilizador.
- Políticas por operação tornam as permissões mais fáceis de auditar.
- `auth.uid()` junto a `user_id` aplica a mesma regra independentemente da página ou cliente que faz o pedido.
- O teste com duas identidades verifica o comportamento real das políticas e não apenas a sua existência.

## Consequências

- A autenticação depende da configuração de URLs e envio de email no Supabase.
- A publishable key continua segura para uso público apenas porque as permissões e políticas limitam os dados.
- Cada nova tabela privada terá de ativar RLS, receber privilégios mínimos e políticas próprias.
- O Proxy melhora a experiência e renova cookies, mas cada operação sensível continua a precisar de autorização junto aos dados.
- A publicação exigirá URLs de redirecionamento e SMTP próprios.
