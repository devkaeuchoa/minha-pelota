## E2E - Autenticacao por telefone

Baseado no cenario manual em `docs/manual-test-scenarios.md` (secao 1).

### 1) Login com dados validos

- Criar jogador via registro (telefone unico + senha).
- Acessar `/login`, informar telefone formatado e senha correta.
- Esperado: redireciona para `player.home` (`/home/player`) ou `groups.index` (`/groups`), conforme permissao.

### 2) Login com senha incorreta

- Usar telefone existente e senha errada.
- Esperado: mensagem de erro e permanencia na tela de login.

### 3) Login com telefone nao cadastrado

- Informar telefone inexistente na base.
- Esperado: mensagem de credenciais invalidas e permanencia na tela de login.

### 4) Logout

- Logar com usuario valido.
- Acionar `LOG OUT`.
- Tentar acessar uma rota protegida (ex.: `/profile`).
- Esperado: sessao encerrada e redirecionamento para `/login`.
