# Testes e refinamento

Estado: Fase 11 em validação final

Data: 9 de agosto de 2026

## Verificações automáticas

As seguintes verificações devem terminar sem erros antes de cada publicação:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

A versão de produção foi também aberta automaticamente no Microsoft Edge em
larguras de 375 px e 1440 px. Os ecrãs públicos de início de sessão, registo e
recuperação de palavra-passe apresentaram:

- estado HTTP 200;
- títulos e cabeçalhos próprios;
- campos associados às respetivas labels;
- ausência de overflow horizontal;
- ausência de erros na consola;
- redirecionamento de `/dashboard` para `/login` sem uma sessão válida.

## Segurança já validada

- todas as Server Actions voltam a validar o utilizador autenticado;
- os identificadores recebidos em formulários, rotas e filtros são validados;
- as políticas RLS foram testadas anteriormente com duas contas;
- o avatar só aceita JPEG, PNG ou WebP até 2 MB e valida também a assinatura do
  ficheiro;
- eliminações pedem confirmação e as regras de integridade evitam perdas
  acidentais nas relações protegidas.

## Matriz manual no browser

### Conta e sessão

- [ ] iniciar e terminar sessão;
- [ ] pedir recuperação de palavra-passe;
- [ ] alterar o nome do perfil;
- [ ] carregar, substituir e remover o avatar.

### Dados principais

- [ ] criar, editar e eliminar uma empresa sem vagas;
- [ ] confirmar que uma empresa com vagas não é eliminada;
- [ ] criar, editar, consultar e eliminar uma candidatura de teste;
- [ ] criar, editar e eliminar um recrutador;
- [ ] criar, editar e eliminar uma entrevista;
- [ ] criar, concluir, reabrir e eliminar uma ação;
- [ ] criar, editar e eliminar uma nota no detalhe da candidatura.

### Pesquisa e navegação

- [ ] pesquisar pelo cabeçalho e confirmar a abertura de `/candidaturas`;
- [ ] combinar filtros e limpar todos;
- [ ] testar filtros de datas válidos e uma pesquisa sem resultados;
- [ ] confirmar os toasts de sucesso e que não reaparecem ao atualizar;
- [ ] confirmar que IDs inválidos no URL são ignorados sem erro.

### Telemóvel e teclado

- [ ] abrir e fechar o menu móvel pelo botão, pelo fundo e pela tecla Escape;
- [ ] confirmar que Tab não sai do menu enquanto está aberto;
- [ ] usar “Saltar para o conteúdo” com a tecla Tab;
- [ ] percorrer formulários e ações sem usar o rato;
- [ ] confirmar legibilidade e ausência de scroll horizontal a 375 px.

Os testes que eliminam dados devem usar registos temporários criados para esse
fim, evitando alterar candidaturas reais.
