# Sprint 0 — Tech Stack (HostGator Plano M)

> **Fase**: Sprint 0 — Setup  
> **Objetivo**: Definir stack compatível com HostGator Plano M e inicializar o projeto.

## HostGator Plano M — Recursos e limites

| Recurso               | Valor                                       |
| --------------------- | ------------------------------------------- |
| Armazenamento         | 100 GB NVMe                                 |
| Inodes                | 250 mil                                     |
| MySQL                 | Ilimitados DBs, **25 conexões** simultâneas |
| Processos simultâneos | 25                                          |
| vCPU                  | 2                                           |
| Painel                | cPanel                                      |
| SSH / FTP             | ✓                                           |
| Cron Jobs             | ✓                                           |
| SSL                   | Grátis (Let's Encrypt)                      |
| Backups               | Diários                                     |

### Compatibilidades (planos compartilhados)

| Tecnologia              | Plano M                 |
| ----------------------- | ----------------------- |
| PHP 8.0, 8.1, 8.2       | ✓                       |
| MySQL 5.7 / 8.0         | ✓                       |
| Laravel 10, 11          | ✓                       |
| Node.js                 | ✗ (apenas VPS/Dedicado) |
| Python (django recente) | ✗                       |
| Redis / Memcached       | ✗                       |

> **Fonte**: [HostGator Plano M](https://suporte.hostgator.com.br/hc/pt-br/articles/30808550507027), [Compatibilidades](https://suporte.hostgator.com.br/hc/pt-br/articles/30811116692115)

---

## Stack escolhido

### Backend

- **PHP 8.2** + **Laravel 11**
- **MySQL 8.0**
- Autenticação: Laravel Breeze ou Fortify (sessão/cookies)

### Frontend

- **React** + **Inertia.js** (Laravel Inertia)
- **TypeScript** (strict mode) — componentes, layouts e pages tipados
- Build com Vite (local); deploy de `public/build/` — sem Node.js no servidor
- Tailwind CSS + BEM para classes semânticas
- Autenticação: Laravel Breeze (Inertia + React stack)
- ESLint + Prettier para linting e formatação automática

### Infra

- **Hospedagem**: HostGator Plano M
- **Deploy**: Git + FTP/SFTP ou cPanel (document root → `public/`)
- **Cron**: para jobs futuros (ex.: lembretes)

### Motivação

- Node.js não suportado em compartilhado → PHP é a opção nativa
- Laravel cobre auth, rotas, migrations, validação
- React + Inertia: UX SPA sem Node no servidor — build local, deploy de estáticos

---

## Estrutura do projeto (Laravel)

```
minha-pelota/
├── app/
│   ├── Models/          # Group, Player (auth), Game → tabela matches, MatchPayment, …
│   └── Http/Controllers/ # Web (Inertia) + Api/ (Sanctum: groups, group players)
├── resources/
│   └── js/
│       ├── types/        # Model — interfaces de domínio (Group, Player, PageProps)
│       ├── utils/        # Model — funções puras (slug, phone, group helpers)
│       ├── features/     # Feature-oriented modules
│       │   ├── groups/
│       │   │   ├── components/   # View — componentes puros de UI
│       │   │   ├── useGroupShowController.ts
│       │   │   └── useGroupsIndexController.ts
│       │   ├── invite/
│       │   │   ├── components/
│       │   │   └── useInviteAcceptController.ts
│       │   └── players/
│       │       └── components/
│       ├── Components/   # Componentes compartilhados
│       ├── Layouts/
│       └── Pages/        # Containers Inertia (Controller fino)
├── public/              # document root no HostGator
├── database/migrations/
├── routes/web.php       # Grupos, partidas, presença, pagamentos (Inertia)
├── routes/api.php       # Sanctum: apiResource groups + players do grupo
├── .env.example
├── planning/            # docs de planejamento
└── README.md
```

---

## Arquitetura Frontend — MVC-like por Feature

O frontend segue uma separação **Model / View / Controller** adaptada para React + Inertia, organizada por feature:

| Camada         | Localização                                        | Responsabilidade                                                                   |
| -------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Model**      | `types/`, `utils/`                                 | Interfaces de domínio, funções puras de transformação/validação                    |
| **View**       | `features/<feature>/components/`                   | Componentes React puros — recebem dados e callbacks via props                      |
| **Controller** | `features/<feature>/use*Controller.ts`, `Pages/**` | Hooks que orquestram `useForm`, `route`, side effects; Pages como containers finos |

### Convenções

1. **Nenhum componente de View** acessa `useForm`, `route` ou `usePage` diretamente
2. **Hooks de controller** ficam em `features/<feature>/` com prefixo `use` e sufixo `Controller`
3. **Páginas Inertia** (`Pages/**`) atuam como containers: chamam o hook controller e compõem Views
4. **Funções de domínio** (slug, phone, inviteUrl) permanecem em `utils/` — puras e testáveis
5. **Novos domínios** devem criar sua pasta em `features/` seguindo o mesmo padrão

---

## Tasks Sprint 0 (checklist)

- [x] Criar projeto Laravel — `./scripts/setup-sprint-0.sh` (local) ou `./scripts/setup-sprint-0-docker.sh` (Docker). Ver SETUP.md
- [ ] Configurar `.env` e MySQL local
- [x] Instalar Laravel Breeze (Inertia + React stack)
- [x] Criar migrations: autenticação em `players`, grupos, jogadores, partidas (`matches`), presença, pagamentos, etc.
- [x] Configurar Tailwind e layout base
- [ ] Documentar deploy HostGator (passos no README)

---

## Deploy HostGator (resumo)

1. Apontar domínio/subdomínio para a pasta `public/`
2. Upload via FTP/SFTP ou Git (se disponível)
3. Criar banco MySQL no cPanel
4. Configurar `.env` com credenciais do banco
5. Rodar `php artisan migrate` via SSH (se habilitado) ou script de deploy

---

---

## TypeScript — Convenções

### Estrutura de tipos

- **`resources/js/types/index.ts`** — tipos de domínio compartilhados (`User`, `Group`, `GroupPlayer`, `PageProps`)
- **`resources/js/types/global.d.ts`** — declarações globais (`route()` do Ziggy, `ImportMeta`)

### Regras

1. **Novos arquivos** devem ser `.tsx` (componentes) ou `.ts` (utilitários)
2. **Páginas existentes em `.jsx`** são resolvidas pelo Vite — migrar incrementalmente
3. **Props de componentes**: usar `interface` nomeada, extendendo atributos HTML nativos quando aplicável
4. **Props de páginas Inertia**: extender `PageProps` de `@/types`
5. **`strict: true`** no `tsconfig.json` — sem `any` implícito
6. **Typecheck**: `npm run typecheck` executa `tsc --noEmit`

### Scripts disponíveis

| Comando             | Descrição                          |
| ------------------- | ---------------------------------- |
| `npm run typecheck` | Verifica tipos sem emitir arquivos |
| `npm run lint`      | Linting com ESLint (JS/TS/JSX/TSX) |
| `npm run lint:fix`  | Lint + auto-fix                    |
| `npm run format`    | Formatação com Prettier            |

---

## Next Steps

1. ~~Backend Sprint 2: US-5 (pagamentos por partida) e CRUD de partidas~~ — entregue no app (web); ver `02-mvp-backlog.plan.md`
2. Planejar Sprint 3 (**US-6** divisão de times, **US-7** recorrência) e visão admin financeira consolidada, se priorizada
3. Operacional: documentar deploy HostGator, env vars, e rodar migrations em produção
4. Hardening: Policies Laravel, transações onde há múltiplos writes, eventual API para partidas/presença/pagamentos
