## E2E - Jogadores no grupo

Baseado na seção **5. Jogadores no grupo** do manual de testes.

### Pré-condições

- Seed padrão carregada (`DatabaseSeeder`).
- Usuário owner/admin para login: `11988888888` / `password`.
- Grupo alvo para gestão: `E2E Group 2`.

### Cenários

#### 1) Adicionar jogador novo por telefone

- Ação:
  - Criar vínculo em `E2E Group 2` com telefone inexistente.
- Validações E2E:
  - Novo jogador aparece na lista **NO GRUPO**.
  - O jogador não aparece mais na lista **DISPONÍVEIS** do mesmo grupo.

#### 2) Reaproveitar jogador existente por telefone

- Ação:
  - Tentar adicionar no `E2E Group 2` um telefone já existente (`11977777777`).
- Validações E2E:
  - O player existente (`grouped-player`) passa a aparecer em **NO GRUPO**.
  - O nome/nick original é preservado (não substitui por payload novo).

#### 3) Jogador em múltiplos grupos

- Ação:
  - Vincular o mesmo jogador existente (`grouped-player`) em `E2E Group` e `E2E Group 2`.
- Validações E2E:
  - O mesmo jogador aparece em **NO GRUPO** nas duas telas de gestão.

#### 4) Remover jogador do grupo

- Ação:
  - Remover `grouped-player` do `E2E Group 2`.
- Validações E2E:
  - O jogador deixa de aparecer em **NO GRUPO** de `E2E Group 2`.
  - O jogador continua em **NO GRUPO** de `E2E Group` (somente detach do pivot).
