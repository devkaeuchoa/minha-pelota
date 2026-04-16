## Cenários de teste manual – Minha Pelota

### 1. Autenticação por telefone

- **Login com dados válidos** ok
  - Criar jogador (via registro ou seed) com `phone` e senha.
  - Acessar `/login`, informar telefone formatado e senha correta.
  - **Esperado**: redirecionar para `player.home` ou `groups.index` conforme permissões.

- **Login com senha incorreta** ok
  - Usar telefone existente e senha errada.
  - **Esperado**: mensagem de erro, continuar desautenticado.

- **Login com telefone não cadastrado** ok
  - Informar telefone que não existe na base.
  - **Esperado**: mensagem de credenciais inválidas.

- **Logout** ok
  - Logar, acionar botão de sair.
  - **Esperado**: sessão encerrada, redirect para `/login` ao tentar acessar rota protegida.

### 2. Registro de jogador

- **Registro com telefone válido e único** ok
  - Acessar `/register`, preencher nome, telefone, senha/confirmar.
  - **Esperado**: conta criada, sessão autenticada, redirecionar para `player.home`.

- **Telefone duplicado** ok
  - Registrar com telefone já usado.
  - **Esperado**: erro de validação em `phone`.

- **Validação de telefone durante digitação** ok
  - Digitar telefone curto/inválido e focar fora do campo.
  - **Esperado**: mensagem informando telefone inválido ou indisponível.

### 3. Home do jogador (`player.home`)

- **Jogador sem grupo** ok
  - Logar com jogador sem vínculos em grupos.
  - **Esperado**: mensagem de que não participa de nenhum grupo, sem ações de presença.

- **Jogador com grupo e próxima partida** ok
  - Criar grupo, partida futura e vincular jogador.
  - **Esperado**: exibir nome do grupo, data/hora da próxima partida, local e status de presença.

- **Atualizar presença rápida** ok
  - Usar botões CONFIRMAR / TALVEZ / DESCONFIRMAR.
  - **Esperado**: status atualizado, aparece corretamente na próxima visita e no ranking/presença.

- **Atualizar condição física** ok
  - Mudar condição física (ex.: Ótimo → Machucado).
  - **Esperado**: condição refletida na escala e histórico de estatísticas.

### 4. Gestão de grupos (admin/owner)

- **Listagem de grupos com CTA quando vazio**
  - Logar com player sem grupos (como admin).
  - Acessar `/groups`.
  - **Esperado**: mensagem de vazio + botão “CRIAR NOVO GRUPO” que leva a `/groups/create`.

- **Criação de grupo**
  - A partir de `/groups/create`, preencher:
    - Nome, slug, dia da semana, horário, local.
  - **Esperado**:
    - Registro em `groups` com `weekday`, `time` obrigatórios.
    - `group_settings` criado com `default_weekday`, `default_time`, `monthly_fee` & `drop_in_fee` default, `invite_token` gerado.

- **Configuração de grupo**
  - Na listagem, usar o link **Config** (ou acessar `/groups/{group}/edit`); alterar dia, horário, recorrência, local.
  - **Esperado**:
    - `groups.weekday`/`time` atualizados.
    - `group_settings.default_weekday/default_time/recurrence` sincronizados.

- **Remoção em lote**
  - Selecionar múltiplos grupos e usar “REMOVER SELECIONADOS”.
  - **Esperado**: grupos removidos e não aparecem mais em listagens ligadas ao player.

### 5. Jogadores no grupo

- **Adicionar jogador novo por telefone**
  - Na tela de jogadores do grupo, adicionar com telefone ainda inexistente.
  - **Esperado**:
    - Novo `player` criado.
    - Pivot `group_player` criado com `is_admin = false`.

- **Reaproveitar jogador existente por telefone**
  - Adicionar um telefone que já existe em outro grupo.
  - **Esperado**:
    - Não cria novo registro em `players`.
    - Apenas vincula ao grupo atual.

- **Jogador em múltiplos grupos**
  - Vincular mesmo jogador a 2+ grupos.
  - **Esperado**: aparece em todas as listagens de jogadores dos grupos relevantes.

- **Remover jogador do grupo**
  - Remover jogador a partir da tela de jogadores do grupo.
  - **Esperado**: detach no pivot; jogador ainda existe (pode estar em outros grupos).

### 6. Convites por link

- **Gerar convite e aceitar**
  - Criar grupo, garantir que `group_settings.invite_token` existe.
  - Acessar rota de convite com token válido.
  - Preencher formulário de convite (nome, apelido, telefone, rating opcional).
  - **Esperado**:
    - Jogador criado/reaproveitado por telefone.
    - Vinculado ao grupo sem `is_admin`.
    - Redireciono para tela de sucesso com nome do grupo.

- **Token inválido ou expirado**
  - Usar token inexistente ou manualmente alterar `invite_expires_at` para passado e acessar.
  - **Esperado**: 404 ou mensagem de link inválido/expirado.

### 7. Presença em partidas

- **Admin gera link de presença**
  - Na tela de presença do grupo/partida, clicar em “GERAR LINK DE PRESENÇA”.
  - **Esperado**:
    - Link único exibido.
    - Botão COPIAR copia a URL para a área de transferência.

- **Jogador marca presença pelo link**
  - Acessar link em outro navegador/anônimo.
  - Informar telefone e escolher status (CONFIRMAR / TALVEZ / DESCONFIRMAR).
  - **Esperado**:
    - Telefone normalizado.
    - Presença associada ao jogador correto (por telefone).
    - Refletido na escala e nos contadores.

- **Link expirado**
  - Simular expiração (ajustando a lógica ou data) e tentar usar o link.
  - **Esperado**: mensagem clara de que o link expirou e presença não pode ser mais atualizada.

### 8. Pagamentos por partida

- **Atalho para pagamentos da última partida finalizada**
  - Ter partidas finalizadas em um grupo admin/owner.
  - Acessar `/groups`.
  - **Esperado**: botão “PAGAMENTOS ÚLTIMA PARTIDA” aparece para quem tem permissão e leva à tela de pagamentos.

- **Tela de pagamentos**
  - Na tela de pagamentos de uma partida:
    - Ver data/hora, local.
    - Ver apenas jogadores confirmados presentes.
    - Ver colunas: status, valor pago (R$), isento mensalidade, dívida anterior.

- **Atualizar pagamento**
  - Marcar um jogador como pago, definir `paid_amount`, marcar/desmarcar isenção de mensalidade.
  - **Esperado**:
    - Requisição PATCH com `payment_status`, `paid_amount` (float em BRL), `is_monthly_exempt`.
    - Registro persistido corretamente, UI atualiza contadores de pagos/não pagos.

- **Restrições de permissão**
  - Usuário sem permissão de admin do grupo tenta acessar tela de pagamentos.
  - **Esperado**: acesso negado (403 ou redirect) conforme lógica do controller.

### 9. Perfil do jogador

- **Editar dados básicos**
  - Acessar `/profile`, editar nome, apelido e telefone.
  - **Esperado**:
    - Telefone é normalizado antes de salvar.
    - `players.phone` é único; tentativa de usar telefone de outro jogador gera erro.

- **Alterar senha**
  - Na mesma tela, alterar senha com senha atual correta e nova senha.
  - **Esperado**:
    - Senha alterada, login com senha antiga falha, nova senha funciona.

- **Excluir conta**
  - Pedir deleção da conta informando senha correta.
  - **Esperado**:
    - Player removido.
    - Sessão encerrada, não consegue mais logar com aquele telefone.

### 10. Fluxos de navegação/admin vs jogador

- **Redirecionamento pós-login para jogador comum**
  - Jogador que não é owner/admin em nenhum grupo faz login.
  - **Esperado**: vai para `player.home` (não para `/groups`).

- **Redirecionamento pós-login para admin**
  - Jogador owner/admin em pelo menos um grupo faz login.
  - **Esperado**: redireciona para `/groups`.

- **Separação de áreas player vs player-admin**
  - Com usuário admin:
    - Ver se navegação permite alternar entre home de jogador e tela de grupos/admin.
  - **Esperado**: rotas coerentes com permissões; telas player/admin distintas visualmente.
