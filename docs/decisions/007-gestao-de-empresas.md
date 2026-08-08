# Decisão 007 — Gestão de empresas com dados reais

Data: 8 de agosto de 2026

Estado: aceite

## Contexto

Empresas são a primeira entidade funcional ligada ao Supabase porque vagas, recrutadores e candidaturas dependem delas. A aplicação precisa de manter a interface simples sem confiar apenas na proteção visual das páginas.

## Decisão

- Consultar empresas em Server Components através de um Data Access Layer marcado como `server-only`.
- Devolver à interface apenas os campos necessários.
- Usar Server Actions para criar, editar e eliminar.
- Revalidar autenticação, propriedade e dados recebidos dentro de cada ação.
- Manter as políticas RLS como barreira independente de autorização.
- Usar páginas próprias para criação e edição em vez de introduzir modais nesta fase.
- Bloquear a eliminação de empresas que tenham vagas associadas.

## Consequências

- Os fluxos funcionam com melhoria progressiva e apresentam estados pendentes e erros de validação.
- URLs de edição podem ser partilhadas sem expor empresas de outros utilizadores.
- A mesma estrutura pode ser reutilizada na integração de recrutadores, vagas e candidaturas.
- A importação inicial de empresas será tratada separadamente para não guardar dados pessoais no repositório.
