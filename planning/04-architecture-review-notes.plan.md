# Notas de revisão de arquitetura e código (Mar/2026)

Registro das principais observações de uma revisão cruzada (frontend React/Inertia, backend Laravel e documentação). Serve como guia de melhorias incrementais, não como lista obrigatória imediata.

## Convenções acordadas (retro UI)

- Componentes **retro** devem usar **CSS Modules** (`.module.css` ao lado do componente).
- **RetroModal**: overlay com `variant` — `hug` (padrão, `max-width: 500px`) ou `full-width`.
- Evitar `window.alert` / `confirm` no fluxo de perfil; usar modal retro para confirmações (ex.: troca de telefone).

## Frontend (React + Inertia)

| Tema                | Observação                                                                         | Direção sugerida                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Dois stacks visuais | Layout “legado” (Tailwind) vs **retro** coexistem.                                 | Migrar telas críticas para retro de forma incremental; extrair tokens/padrões compartilhados onde fizer sentido. |
| Duplicação          | Lógica de partidas/presença repetida entre `Player` e `PlayerMatch`.               | Componentes compartilhados ou hook único de dados + apresentação por contexto.                                   |
| Estado local        | Atualizações otimistas (ex.: presença) podem divergir do servidor em erro de rede. | Reverter estado em falha ou reconciliar com resposta/poll leve.                                                  |
| Rotas               | URLs hardcoded em vários pontos.                                                   | Centralizar paths nomeados (constante ou helper alinhado às rotas Laravel).                                      |
| Estilo              | Mistura Tailwind + CSS global + módulos.                                           | **Retro**: priorizar CSS Modules; legado pode permanecer até migração.                                           |

## Backend (Laravel / PHP)

| Tema           | Observação                                                                 | Direção sugerida                                                                            |
| -------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| User vs Player | Alguns fluxos usam `user_id`, outros `player_id` na mesma área conceitual. | Documentar fronteira: “identidade” (User) vs “atleta no grupo” (Player); APIs consistentes. |
| Controllers    | `PlayerHomeController` concentra rankings, condição física, histórico.     | Extrair actions/services (rankings mensais, histórico de condição, stats híbridas).         |
| Integridade    | Partidas no mesmo grupo com mesmo `scheduled_at` possível.                 | Índice único composto ou validação explícita, conforme regra de negócio.                    |
| Transações     | Atualização de condição + histórico em múltiplos writes.                   | `DB::transaction()` para atomicidade.                                                       |
| Autorização    | `authorizeOwner` repetido.                                                 | Policies ou middleware de ownership onde couber.                                            |

## Documentação (lacunas úteis)

- **Testes**: como rodar suíte, cobertura mínima esperada, fixtures.
- **Operação**: env vars, jobs, filas, deploy.
- **Arquitetura**: diagrama ou ADR curto (Inertia, domínio User/Player/Group/Match).
- **ADRs**: decisões como stats híbridas, rankings mensais, histórico de condição física.

## Relação com outros artefatos de planning

- Produto e backlog: `01-discovery.plan.md`, `02-mvp-backlog.plan.md`, `03-sprint-0-tech-stack.plan.md`.
- Este arquivo complementa com **dívida técnica e convenções** observadas após entregas recentes (perfil retro, rankings de grupo, histórico de condição).
