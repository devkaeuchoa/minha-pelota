# MVP Backlog — Minha Pelota

> **Fase**: Sprint Planning (Sprint 0 → Sprint 1)  
> **Objetivo**: Backlog priorizado e decomposto em tarefas para o MVP.

## Objective

Entregar o menor conjunto de funcionalidades que valide a proposta de valor e permita feedback real dos usuários.

## User Stories / Backlog Items

### Must Have (Sprint 1–2)

- [x] **US-1** — Como admin, quero criar um grupo/quadra para que eu possa reunir os jogadores em um lugar
- [x] **US-2** — Como admin, quero cadastrar e convidar jogadores para que eles possam participar das peladas
- [x] **US-3** — Como admin, quero criar e listar datas de partidas para que todos saibam quando jogar
- [x] **US-4** — Como jogador, quero confirmar presença na partida para que o organizador saiba quem vem
- [ ] **US-5** — Como admin, quero marcar quem pagou para que eu controle o aluguel do espaço

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

- [ ] CRUD de partidas (datas, local) _(PARCIAL: geração/listagem/visualização implementadas; CRUD completo ainda pendente)_
- [x] Geração automática de partidas por período e listagem das próximas partidas por grupo
- [x] Lista de presença (confirmar / desconfirmar)
- [x] Extensão da presença: opção "talvez", link público por partida e confirmação na área logada do jogador
- [ ] Status de pagamento por partida (pago / pendente)
- [ ] Dashboard admin (resumo do grupo) _(PARCIAL: gestão de presença e escalação por partida pronta; falta visão financeira/pagamentos)_

## Tasks (Sprint 3 — Should Have)

- [ ] Divisão de times (manual ou automática)
- [ ] Configuração de recorrência de pagamento

## Acceptance Criteria (MVP)

- [ ] Usuário consegue [ação principal] sem fricção _(PARCIAL: fluxos de grupo, convite, partidas e presença já operacionais)_
- [ ] Sistema está disponível em produção (staging mínimo)
- [ ] Feedback pode ser coletado de forma estruturada

## Dependencies

- [x] Discovery concluído (01-discovery.plan.md)
- [x] Definição de tech stack

## Notes

- Velocidade: ajustar conforme capacidade do time
- Definição de Pronto: código em main, testes passando, deploy funcional
- **Status PM (Mar/2026)**: MVP funcional para gestão de grupo + partidas + presença. Próximo foco recomendado: pagamentos (US-5) e fechamento do CRUD completo de partidas.
