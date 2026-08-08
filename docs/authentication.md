# Autenticação e segurança

Estado: implementado e validado na Fase 4

Data: 2 de agosto de 2026

## Fluxos implementados

- Criação de conta com nome, email e palavra-passe.
- Confirmação do email através do Supabase.
- Início e fim de sessão.
- Recuperação e atualização da palavra-passe.
- Renovação da sessão através de cookies no Proxy do Next.js.
- Proteção das páginas privadas.
- Criação automática de `profiles` quando uma conta é criada.
- Consulta do email real e edição do nome e da fotografia da conta.
- Isolamento das linhas por utilizador através de políticas RLS.

## Decisões de segurança

- A aplicação usa apenas a URL e a publishable key no frontend e no servidor Next.js.
- A identidade é validada com `supabase.auth.getClaims()`; `getSession()` não é usado para decisões de autorização.
- O Proxy faz redirecionamentos e renovação de cookies, mas não substitui as políticas RLS.
- As Server Actions validam os dados recebidos e os futuros pedidos de escrita voltarão a validar o utilizador.
- A palavra-passe tem entre 12 e 128 caracteres.
- A recuperação devolve a mesma mensagem exista ou não uma conta para o email indicado.
- Os caminhos recebidos no callback são limitados a caminhos internos para evitar redirecionamentos externos.
- A fotografia usa um caminho fixo por utilizador, tipos de imagem permitidos e
  um limite de 2 MB. A escrita no Storage é protegida por RLS.

## Perfil da conta

Em `/definicoes`, o utilizador pode alterar `profiles.full_name` e carregar,
substituir ou remover a fotografia. O email apresentado vem da identidade
validada pelo Supabase Auth e é apenas de leitura nesta área.

O avatar é servido pelo bucket público `avatars`; por isso, quem conhecer o URL
pode ver a imagem. Apenas o próprio utilizador autenticado tem permissão para
escrever ou eliminar o respetivo objeto. Sem imagem, o cabeçalho mostra as
iniciais do nome.

## Configuração local

`.env.local` deve incluir:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` é usado nas ligações enviadas por email. Em produção deve ser substituído pelo domínio final HTTPS.

## Configuração no Supabase

Em **Authentication → URL Configuration**:

- definir **Site URL** como `http://localhost:3000` durante o desenvolvimento;
- adicionar `http://localhost:3000/**` a **Redirect URLs**.

Em **Authentication → Providers → Email**:

- manter Email ativo;
- manter a confirmação de email ativa;
- não ativar utilizadores anónimos para este projeto.

### Emails durante o desenvolvimento

O serviço de email predefinido dos projetos alojados no Supabase é apenas para
testes: envia para endereços de membros da organização previamente autorizados e
tem um limite reduzido de envios. Por isso:

- a primeira conta pode usar o email associado à organização Supabase;
- para testar livremente com uma segunda conta e para produção, deve ser
  configurado um servidor SMTP próprio em **Project Settings → Authentication →
  SMTP Settings**;
- não desativar a confirmação de email como solução permanente.

Se uma mensagem não chegar, consultar **Authentication → Logs** antes de repetir
o pedido, para evitar consumir o limite de envio.

## Aplicar a migração

Executar uma única vez no SQL Editor:

`supabase/migrations/20260802210000_add_auth_and_rls_policies.sql`

Depois executar:

`supabase/tests/auth_and_rls_catalog_checks.sql`

O teste deve listar 30 políticas e confirmar o trigger `on_auth_user_created`.

## Teste obrigatório com duas contas

1. Criar a conta A através de `/registo` e confirmar o email.
2. Iniciar sessão, confirmar o nome e email no cabeçalho e terminar sessão.
3. Criar a conta B em **Authentication → Users → Add user → Create new user**,
   usando um email de teste, uma palavra-passe forte e a opção de confirmação
   automática. Esta criação administrativa não envia um email.
4. Confirmar que as duas contas aparecem em **Authentication → Users**.
5. Executar `supabase/tests/rls_two_user_checks.sql` no SQL Editor.
6. Confirmar os avisos de que A lê os próprios dados e B não consegue ler, editar ou eliminar dados de A.
7. Confirmar que o script termina com `ROLLBACK`; nenhum registo de teste fica guardado.

Este teste foi executado com duas contas e concluiu sem erros na Fase 4.

## Recuperação de palavra-passe

O pedido é feito em `/recuperar-password`. A ligação recebida troca o código por uma sessão em `/auth/callback` e segue para `/atualizar-password`. Depois da alteração, a sessão local termina e o utilizador inicia sessão com a nova palavra-passe.

## Produção

Antes da publicação será necessário:

- alterar Site URL e Redirect URLs para o domínio da Vercel;
- configurar um serviço SMTP próprio;
- rever limites de envio de email e proteção contra abuso;
- repetir os testes com duas contas no ambiente de produção.
