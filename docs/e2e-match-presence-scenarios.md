## E2E - Presença em partidas

Baseado na seção **7. Presença em partidas** do manual de testes (`docs/manual-test-scenarios.md`). Este arquivo não altera o manual.

### Pré-condições

- Seed padrão (`DatabaseSeeder`).
- Owner: `11988888888` / `password`.
- Grupo **E2E Group** com partida futura e o jogador **Grouped Player** (`11977777777`) já vinculado ao grupo.
- Grupo **E2E Presence Expired** (seed): partida no passado + `match_attendance_links` com token fixo alinhado ao spec `tests/e2e/match-presence.spec.ts`.

### Cenários

#### 1) Admin gera link de presença

- Na tela de escalação da partida, acionar **GERAR LINK DE PRESENÇA** (há `confirm` no browser; o Playwright aceita por padrão).
- **Esperado**: URL pública exibida no campo somente leitura; **COPIAR** grava a mesma URL na área de transferência (teste com permissões de clipboard).

#### 2) Jogador marca presença pelo link

- Abrir o link em contexto sem sessão (novo browser context).
- Informar telefone de um jogador do grupo e escolher status (**CONFIRMAR** / **TALVEZ** / **DESCONFIRMAR**) e **ATUALIZAR**.
- **Esperado**: mensagem de sucesso na página pública; na área admin, após recarregar a gestão da escalação, o resumo **CONFIRMADOS** (ou equivalente) reflete a confirmação quando o status é **going**.

#### 3) Link expirado

- Acessar `/presence/{token}` do seed **E2E Presence Expired** após `expires_at`.
- **Esperado**: cópia fixa **Este link expirou. A presença não pode mais ser atualizada.** e formulário de atualização indisponível (`Presence/Mark`).
