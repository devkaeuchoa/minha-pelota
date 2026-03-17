# MVP Backlog — Minha Pelota

> **Fase**: Sprint Planning (Sprint 0 → Sprint 1)  
> **Objetivo**: Backlog priorizado e decomposto em tarefas para o MVP.

## Objective

Entregar o menor conjunto de funcionalidades que valide a proposta de valor e permita feedback real dos usuários.

## User Stories / Backlog Items

### Must Have (Sprint 1–2)
- [ ] **US-1** — Como admin, quero criar um grupo/quadra para que eu possa reunir os jogadores em um lugar
- [ ] **US-2** — Como admin, quero cadastrar e convidar jogadores para que eles possam participar das peladas
- [ ] **US-3** — Como admin, quero criar e listar datas de partidas para que todos saibam quando jogar
- [ ] **US-4** — Como jogador, quero confirmar presença na partida para que o organizador saiba quem vem
- [ ] **US-5** — Como admin, quero marcar quem pagou para que eu controle o aluguel do espaço

### Should Have (Sprint 3)
- [ ] **US-6** — Como admin, quero dividir os jogadores em times para facilitar a escalação
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

- [ ] Modelar entidades: Grupo, Jogador, Partida
- [ ] Implementar CRUD de grupos (admin: create/read/update/delete com UI Inertia/React)
- [ ] Implementar fluxo de remoção de grupos com confirmação e redirect para lista
- [ ] Implementar cadastro de jogadores (convite por link)
- [ ] Tela de login/autenticação básica
- [ ] Layout base (admin vs jogador)

## Tasks (Sprint 2 — Core: Partidas + Presença + Pagamento)

- [ ] CRUD de partidas (datas, local)
- [ ] Lista de presença (confirmar / desconfirmar)
- [ ] Status de pagamento por partida (pago / pendente)
- [ ] Dashboard admin (resumo do grupo)

## Tasks (Sprint 3 — Should Have)

- [ ] Divisão de times (manual ou automática)
- [ ] Configuração de recorrência de pagamento

## Acceptance Criteria (MVP)

- [ ] Usuário consegue [ação principal] sem fricção
- [ ] Sistema está disponível em produção (staging mínimo)
- [ ] Feedback pode ser coletado de forma estruturada

## Dependencies

- [ ] Discovery concluído (01-discovery.plan.md)
- [ ] Definição de tech stack

## Notes

- Velocidade: ajustar conforme capacidade do time
- Definição de Pronto: código em main, testes passando, deploy funcional
