# Sprint 0 — Tech Stack (HostGator Plano M)

> **Fase**: Sprint 0 — Setup  
> **Objetivo**: Definir stack compatível com HostGator Plano M e inicializar o projeto.

## HostGator Plano M — Recursos e limites

| Recurso | Valor |
|---------|-------|
| Armazenamento | 100 GB NVMe |
| Inodes | 250 mil |
| MySQL | Ilimitados DBs, **25 conexões** simultâneas |
| Processos simultâneos | 25 |
| vCPU | 2 |
| Painel | cPanel |
| SSH / FTP | ✓ |
| Cron Jobs | ✓ |
| SSL | Grátis (Let's Encrypt) |
| Backups | Diários |

### Compatibilidades (planos compartilhados)

| Tecnologia | Plano M |
|------------|---------|
| PHP 8.0, 8.1, 8.2 | ✓ |
| MySQL 5.7 / 8.0 | ✓ |
| Laravel 10, 11 | ✓ |
| Node.js | ✗ (apenas VPS/Dedicado) |
| Python (django recente) | ✗ |
| Redis / Memcached | ✗ |

> **Fonte**: [HostGator Plano M](https://suporte.hostgator.com.br/hc/pt-br/articles/30808550507027), [Compatibilidades](https://suporte.hostgator.com.br/hc/pt-br/articles/30811116692115)

---

## Stack escolhido

### Backend
- **PHP 8.2** + **Laravel 11**
- **MySQL 8.0**
- Autenticação: Laravel Breeze ou Fortify (sessão/cookies)

### Frontend
- **React** + **Inertia.js** (Laravel Inertia)
- Build com Vite (local); deploy de `public/build/` — sem Node.js no servidor
- Tailwind CSS
- Autenticação: Laravel Breeze (Inertia + React stack)

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
│   ├── Models/          # Grupo, Jogador, Partida, User
│   └── Http/Controllers/
├── resources/
│   └── js/
│       ├── Components/   # React components
│       ├── Layouts/
│       └── Pages/       # Inertia pages
├── public/              # document root no HostGator
├── database/migrations/
├── routes/web.php
├── .env.example
├── planning/            # docs de planejamento
└── README.md
```

---

## Tasks Sprint 0 (checklist)

- [ ] Criar projeto Laravel — `./scripts/setup-sprint-0.sh` (local) ou `./scripts/setup-sprint-0-docker.sh` (Docker). Ver SETUP.md
- [ ] Configurar `.env` e MySQL local
- [ ] Instalar Laravel Breeze (Inertia + React stack)
- [ ] Criar migrations: users, grupos, jogadores, partidas
- [ ] Configurar Tailwind e layout base
- [ ] Documentar deploy HostGator (passos no README)

---

## Deploy HostGator (resumo)

1. Apontar domínio/subdomínio para a pasta `public/`
2. Upload via FTP/SFTP ou Git (se disponível)
3. Criar banco MySQL no cPanel
4. Configurar `.env` com credenciais do banco
5. Rodar `php artisan migrate` via SSH (se habilitado) ou script de deploy

---

## Next Steps

1. Executar tasks Sprint 0
2. Iniciar Sprint 1 (US-1, US-2, US-3)
