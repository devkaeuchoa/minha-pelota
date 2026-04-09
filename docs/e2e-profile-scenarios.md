## E2E - Perfil do jogador

Baseado na seção **9. Perfil do jogador** do manual (`docs/manual-test-scenarios.md`).

### Pré-condições

- Seed padrão (`DatabaseSeeder`).
- `password` padrão dos factories: `password`.
- **Owner** (`11988888888`): edição de perfil e validação de telefone duplicado.
- **E2E Profile Password** (`11944444444`): fluxo de alteração de senha.
- **E2E Profile Delete** (`11955555555`): fluxo de exclusão de conta.
- **Test Player** (`11999999999`): telefone já usado; usado no teste de unicidade ao editar o owner.

### Cenários

#### 1) Editar dados básicos e telefone duplicado

- Em `/profile`, ativar edição, alterar dados e tentar salvar com telefone de outro jogador.
- Confirmação de telefone via modal quando o número muda.
- **Esperado**: erro de validação em `phone` (não persiste o telefone duplicado).

#### 2) Alterar senha

- Abrir **ALTERAR SENHA**, preencher senha atual, nova senha e confirmação.
- **Esperado**: login com senha antiga falha; com a nova, sucesso.

#### 3) Excluir conta

- Abrir **EXCLUIR CONTA** → **EXCLUIR MINHA CONTA** → modal com senha → **CONFIRMAR EXCLUSÃO**.
- **Esperado**: redirecionamento pós-logout; login com o mesmo telefone falha.
