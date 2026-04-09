# Seeders e comandos

Este documento lista os seeders atuais do projeto e os comandos para executar cada um.

## Seeders disponíveis

### `Database\\Seeders\\DatabaseSeeder`

- Seeder base do projeto com fixtures usadas nas suítes E2E gerais.
- Cria jogadores e grupos de teste como:
  - `Test Player` (`11999999999`)
  - `Owner Player` (`11988888888`)
  - `Grouped Player` (`11977777777`)
  - `Admin No Groups` (`11966666666`)
  - grupos `E2E Group`, `E2E Group 2`, `E2E Batch Delete 1`, `E2E Batch Delete 2`

### `Database\\Seeders\\E2EGroupsEmptyStateSeeder`

- Seeder focado em E2E de grupos no estado vazio.
- Remove os grupos existentes e garante admin fixo para login:
  - `Admin No Groups` (`11966666666`, senha `password`)

## Comandos úteis

### Rodar seeder padrão

```bash
php artisan db:seed
```

ou explicitamente:

```bash
php artisan db:seed --class=Database\\Seeders\\DatabaseSeeder
```

### Rodar seeder de grupos vazios (E2E)

```bash
php artisan db:seed --class=Database\\Seeders\\E2EGroupsEmptyStateSeeder
```

### Reset completo do banco + seeder padrão

```bash
php artisan migrate:fresh --seed
```

### Reset completo do banco + seeder específico

```bash
php artisan migrate:fresh --seed --seeder=Database\\Seeders\\E2EGroupsEmptyStateSeeder
```

## Fluxos recomendados para E2E

- Suítes completas (auth, register, player-home, groups):
  - `php artisan migrate:fresh --seed`
- Suite de groups em estado vazio:
  - `php artisan migrate:fresh --seed --seeder=Database\\Seeders\\E2EGroupsEmptyStateSeeder`
