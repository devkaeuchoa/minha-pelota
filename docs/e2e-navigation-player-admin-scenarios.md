## E2E - Navegação jogador vs admin

Baseado na seção **10. Fluxos de navegação/admin vs jogador** do manual (`docs/manual-test-scenarios.md`).

### Pré-condições

- Seed padrão (`DatabaseSeeder`).
- Senha: `password`.
- **Test Player** (`11999999999`): `is_admin` false, sem grupos — representa “jogador comum” no manual.
- **Grouped Player** (`11977777777`): membro de grupo, `is_admin` false — reforça que o redirect pós-login usa o flag de plataforma, não só posse de grupo.
- **Owner Player** (`11111111111`): `is_admin` true — área admin (`/groups` após login).

> Nota de produto: o redirect pós-login hoje depende de `Player.is_admin` (área “player-admin”), não de ser owner de um grupo. **Admin No Groups** (`11966666666`) também cai em `/groups`.

### Cenários

#### 1) Jogador comum → `player.home`

- Login com jogador sem `is_admin`.
- **Esperado**: URL `/home/player`, título de seção **HOME DO JOGADOR**.
- Acesso direto a `/groups` deve retornar **403** (rota protegida a admins da plataforma).

#### 2) Admin de plataforma → `/groups`

- Login com `is_admin` true.
- **Esperado**: URL `/groups` e conteúdo da listagem de grupos (ex.: **1. GRUPOS**).

#### 3) Alternância home do jogador ↔ grupos (admin)

- Logado como admin, abrir `/home/player` (home do jogador).
- **Esperado**: cabeçalho **HOME DO JOGADOR** (visual distinto da área de grupos).
- Usar o item **GRUPOS** do menu → `/groups` e novamente **1. GRUPOS**.

#### 4) Menu do jogador comum

- Na home do jogador como não-admin, o menu não inclui **GRUPOS** nem **DATAS** (apenas **HOME** e **PERFIL** na configuração atual).
