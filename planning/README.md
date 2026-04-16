# Planning — MVP Minha Pelota

Fluxo iterativo Agile para desenhar o MVP do app. Cada sprint refinamos o backlog.

## Estrutura

| Arquivo                  | Propósito                                           |
| ------------------------ | --------------------------------------------------- |
| `01-discovery.plan.md`   | Problema, personas, visão do produto                |
| `02-mvp-backlog.plan.md` | User stories e tarefas do MVP                       |
| `sprints/`               | Planos por sprint quando iniciarmos desenvolvimento |

## Ciclo de Refinamento

1. **Discovery** → Validar problema e usuários
2. **Backlog** → Priorizar com MoSCoW (Must / Should / Could / Won't)
3. **Sprint 0** → Definir MVP mínimo viável
4. **Iterar** → Revisar e ajustar a cada ciclo

## Status Atual (Abr/2026)

- Discovery e Sprint 0 concluídos
- **Backend (Laravel)**: grupos, convites, **CRUD de partidas** (`Game` / `matches`), geração em lote, presença (incluindo "talvez" e link público), **pagamentos por partida** (`MatchPayment`); identidade de login = **`Player`** (guard `web`)
- **API Sanctum**: somente grupos + jogadores do grupo; demais domínios via rotas web/Inertia
- Próximo foco de planejamento: US-6/US-7, melhorias de autorização (Policies), deploy/docs operacionais
