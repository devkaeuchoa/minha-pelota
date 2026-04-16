# MVP Backlog — Minha Pelota

> **Fase**: Execução MVP (backend core de partidas + presença + pagamentos entregue; foco em Should Have e polish)  
> **Objetivo**: Backlog priorizado e decomposto em tarefas para o MVP.

## Objective

Entregar o menor conjunto de funcionalidades que valide a proposta de valor e permita feedback real dos usuários.

## User Stories / Backlog Items

### Must Have (Sprint 1–2)

- [x] **US-1** — Como admin, quero criar um grupo/quadra para que eu possa reunir os jogadores em um lugar
- [x] **US-2** — Como admin, quero cadastrar e convidar jogadores para que eles possam participar das peladas
- [x] **US-3** — Como admin, quero criar e listar datas de partidas para que todos saibam quando jogar
- [x] **US-4** — Como jogador, quero confirmar presença na partida para que o organizador saiba quem vem
- [x] **US-5** — Como admin, quero marcar quem pagou para que eu controle o aluguel do espaço _(backend: `MatchPayment`, sync com confirmados, PATCH por jogador; testes em `MatchPaymentsTest`)_

### Should Have (Sprint 3)

- [ ] **US-6** — Como admin, quero dividir os jogadores em times para facilitar a escalação _(PARCIAL: visualização de escalação/campinho pronta; falta divisão efetiva de times A/B)_
- [ ] **US-7** — Como admin, quero definir recorrência de pagamento (mensal/semanal) para automatizar cobranças

### Could Have (Backlog)

- [ ] US-8 — Histórico de partidas
- [ ] US-9 — Notificações / lembretes

## Tasks (Sprint 0 — Setup)

- [x] Definir tech stack (frontend, backend, hospedagem)
- [x] Executar setup (Laravel + Breeze Inertia + React instalado via Podman)
- [ ] Configurar `.env` e MySQL local (opcional: Laravel usa SQLite por padrão)
- [x] Ambiente base (migrations users/cache/jobs, layout Breeze)

## Tasks (Sprint 1 — Core: Grupo + Jogadores)

- [x] Modelar entidades: Grupo, Jogador, Partida
- [x] Implementar CRUD de grupos (admin: create/read/update/delete com UI Inertia/React)
- [x] Implementar fluxo de remoção de grupos com confirmação e redirect para lista
- [x] Implementar cadastro de jogadores (convite por link)
- [x] Tela de login/autenticação básica
- [x] Layout base (admin vs jogador)

## Tasks (Sprint 2 — Core: Partidas + Presença + Pagamento)

- [x] CRUD de partidas (datas, local, status) — `GroupMatchController` + rotas `groups.matches.{store,update,destroy}`; model `Game` (`matches`, soft delete); testes `MatchesCrudTest`
- [x] Geração automática de partidas por período e listagem das próximas partidas por grupo
- [x] Lista de presença (confirmar / desconfirmar)
- [x] Extensão da presença: opção "talvez", link público por partida e confirmação na área logada do jogador
- [x] Status de pagamento por partida (pago / pendente / valores) — `GroupMatchPaymentController`, tabela `match_payments`
- [ ] Dashboard admin (resumo do grupo) _(PARCIAL: `/home/admin` com contagens; gestão financeira por partida na rota `groups.matches.payments.manage`; falta visão consolidada multi-partida / KPIs se desejado)_

## Tasks (Sprint 3 — Should Have)

- [ ] Divisão de times (manual ou automática)
- [ ] Configuração de recorrência de pagamento

## Acceptance Criteria (MVP)

- [x] Admin consegue ciclo completo grupo → jogadores → partidas (CRUD + geração) → presença → marcar pagamentos por partida _(fluxos cobertos no backend web + Feature tests)_
- [ ] Sistema está disponível em produção (staging mínimo)
- [ ] Feedback pode ser coletado de forma estruturada

## Dependencies

- [x] Discovery concluído (01-discovery.plan.md)
- [x] Definição de tech stack

## Notes

- Velocidade: ajustar conforme capacidade do time
- Definição de Pronto: código em main, testes passando, deploy funcional
- **Backend (Abr/2026)**: Autenticação e guard `web` usam model **`Player`** (sem tabela `users` legada). Rotas **web** cobrem grupos, partidas, presença, pagamentos. **API Sanctum** (`routes/api.php`): apenas `groups` + jogadores do grupo — partidas/presença/pagamentos não expostos como JSON resource.
- **Status PM (Abr/2026)**: Must Have de backend para US-1…US-5 atendido no servidor. Próximo foco: **US-6/US-7**, consolidado admin opcional, **Policies** (hoje autorização inline nos controllers), e expansão da API se houver app cliente ou integrações.
