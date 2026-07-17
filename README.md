## Minha Pelota

Aplicação web para organizar **peladas e grupos de futebol amador**, substituindo a combinação WhatsApp + planilhas. O admin gerencia grupos, jogadores, partidas, presença e pagamentos; jogadores confirmam presença via link público por token.

### Visão

> Centralizar a gestão de grupos de futebol amador — jogadores, datas, presença e pagamentos — em um fluxo simples para admins e jogadores.

### Stack

- **Backend**: PHP 8.2 + Laravel 12
- **Frontend**: React + Inertia.js (SPA via Laravel) com **TypeScript**
- **Estilos**: Tailwind CSS (utilitários) + **CSS Modules** para a biblioteca de componentes retro (`resources/js/Components/retro/`)
- **Banco de dados**: SQLite (testes/dev local) / MySQL (dev/produção)
- **Autenticação**: login por **telefone + senha** (guard `web`, identidade = `Player`)
- **Containerização**: Docker multi-stage (Node para assets, Composer para vendor, PHP-FPM Alpine) + Nginx como reverse proxy — ver [seção Docker](#docker--deploy)
- **Ferramentas de qualidade**:
  - ESLint (flat config v9) + `@typescript-eslint` + `eslint-plugin-react` + Prettier
  - PHPUnit (SQLite in-memory) + Playwright (E2E)
  - Scripts: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run typecheck`, `composer run test`

### Domínio atual

#### Grupos

- `Group` com `name`, `slug` (gerado automaticamente, kebab-case), `weekday`, `time`, `location_name`, configurações (`GroupSetting`) e dono (`owner_player_id`).
- Listagem com seleção múltipla e remoção em batch; criação/edição via formulário compartilhado com validação server-side.
- Detalhe do grupo mostra próxima partida, jogadores associados e acordeão de geração de datas (mês atual, presets 3/6/12 meses, seleção personalizada).
- API REST (`Api\GroupController`) restrita a grupos + jogadores do grupo autenticado (Sanctum); demais domínios via rotas web/Inertia.

#### Jogadores

- CRUD e vínculo de jogadores por grupo (`group_player`, papel admin/jogador por pivot).
- Condição física (`PhysicalCondition` enum, valores em português: `otimo`, `regular`, `ruim`, `machucado`, `unknown`) com histórico (`PlayerConditionHistory`) e exibição por emoji.
- Página do jogador com visão de grupos e estatísticas (`PlayerStat`, `MatchPlayerStat`).

#### Partidas (`Game`)

- CRUD de partidas centralizado em página dedicada de datas, com geração em lote.
- Tela de grupo destaca a próxima data e facilita abertura da gestão de presença.

#### Presença e escalação

- **Admin** (`GroupMatchAttendanceController`): visualização de presença por partida com resumo (confirmados, desconfirmados, pendentes, "talvez"), geração de link público por partida, escalação em `RetroPitch` com reservas.
- **Jogador** (`MatchAttendancePublicController`): confirmação/desconfirmação por link público com token, identificação por telefone, atualização permitida enquanto o link estiver válido.
- **Times**: visualização de escalação/campinho pronta; divisão efetiva em times A/B ainda pendente (US-6, parcial).

#### Pagamentos

- Pagamentos por partida (`MatchPayment`, `GroupMatchPaymentController`): sincronização de cobrança por jogador confirmado e atualização de status de pagamento.
- Recorrência automática de cobrança (mensal/semanal) ainda não implementada (US-7).

#### Autenticação e convites

- Login/cadastro por telefone (`LoginRequest` valida `phone` + `password`, guard `web`).
- Convites (`InviteController`) validam disponibilidade do telefone antes do cadastro; se o telefone já existe, o jogador é vinculado ao grupo no fluxo de convite.
- Links de convite e de presença suportam expiração (`invite_expires_at`, `MatchAttendanceLink.expires_at`).

#### Navegação e UI

- Navegação baseada em rotas nomeadas (`resources/js/config/navigation.ts`), navbar desktop/mobile com logout explícito.
- Biblioteca de componentes retro (`Components/retro/`) com estilo pixel-art, usando CSS Modules; toda string de UI passa por `useLocale()` / `pt-BR.ts`.

### Docker / Deploy

Build multi-stage (`Dockerfile`) gera uma imagem PHP 8.2-FPM Alpine enxuta a partir de três estágios:

1. **assets** (Node 22) — build do frontend com Vite (`npm run build`)
2. **vendor** (Composer 2) — dependências PHP de produção (`--no-dev`, sem extensões dev)
3. **app** — imagem final, roda como `www-data`, expõe FastCGI na porta 9000

> A imagem final **não inclui** dependências de dev do Composer (ex.: `fakerphp/faker`) nem `node_modules`/fontes JS — apenas `vendor/`, `public/build/` e o código da aplicação.

**Orquestração (`compose.yaml`, produção):**

- `init` — copia os assets compilados da imagem para um volume compartilhado a cada `up`, garantindo que o Nginx sirva sempre a versão atual sem recriar o volume manualmente
- `app` — PHP-FPM, volume `storage` persistente entre deploys
- `web` — Nginx 1.27-alpine, proxy FastCGI para `app:9000`, healthcheck em `/up`

```bash
# Deploy rápido
APP_IMAGE=ghcr.io/your-org/minha-pelota APP_VERSION=v1.2.0 docker compose pull
docker compose down && docker compose up -d
docker compose exec app php artisan migrate --force
```

TLS não é feito pelo `web`; configure um reverse proxy na VPS (Nginx no host ou Caddy) na frente da porta exposta.

**Dev local (`compose.override.yaml`, aplicado automaticamente sobre `compose.yaml`):**

- `init-dev` — ajusta ownership do arquivo SQLite antes do app subir (volumes nomeados nascem com ownership `root`)
- `app` — roda `php artisan migrate --force` no startup e usa SQLite isolado em volume próprio (`DB_DATABASE=/app/storage/dev/database.sqlite`), sem tocar no MySQL de produção

```bash
docker build -t minha-pelota:latest .
docker compose up -d
```

Pendências conhecidas: queue workers e scheduler ainda rodam fora de containers dedicados (planejado para pós go-live).

### Planejamento e releases

- A pasta `planning/` contém:
  - `01-discovery.plan.md` — discovery e visão de produto.
  - `02-mvp-backlog.plan.md` — backlog de MVP (US-1…US-9, priorização MoSCoW).
  - `03-sprint-0-tech-stack.plan.md` — decisões de stack e deploy.
  - `04-architecture-review-notes.plan.md` — notas de revisão de arquitetura.
- `CHANGELOG.md` documenta as mudanças de cada versão.
- Próximo foco de planejamento: divisão de times (US-6), recorrência de pagamento (US-7), consolidação de autorização via Policies do Laravel.

### Comandos úteis

```bash
composer run dev          # Laravel + Vite + queue + Pail logs
npm run dev                # Vite + php artisan serve (alternativa mais leve)

composer run test                              # Todos os testes PHPUnit
php artisan test --filter=GroupLifecycleTest   # Uma classe de teste

npm run e2e:server        # Servidor para e2e (porta 8010/5180)
npm run e2e                # Testes Playwright
npm run e2e:ui             # Playwright em modo UI

npm run typecheck          # Checagem de tipos TypeScript
npm run lint / lint:fix    # ESLint
npm run format              # Prettier
npm run build               # Build de produção (public/build)
php artisan pint             # Code style PHP
```
