## E2E - Home do jogador (`player.home`)

Baseado no cenario manual em `docs/manual-test-scenarios.md` (secao 3).

## Cobertura e redundancia

- Ate o momento, nao ha cobertura equivalente desses fluxos em outras suites E2E.
- Por isso, os 4 cenarios abaixo foram automatizados nesta suite dedicada.

### 1) Jogador sem grupo

- Login com jogador sem vinculo em grupos.
- Esperado: mensagem de que nao participa de nenhum grupo e ausencia de acoes de presenca.

### 2) Jogador com grupo e proxima partida

- Login com jogador vinculado a grupo com partida futura.
- Esperado: exibir nome do grupo, proxima partida, local e status de presenca.

### 3) Atualizar presenca rapida

- Usar botoes `CONFIRMAR`, `TALVEZ` e `DESCONFIRMAR`.
- Esperado: status muda para `CONFIRMADA`, `TALVEZ` e `DESCONFIRMADA`.

### 4) Atualizar condicao fisica

- Alterar condicao para `MACHUCADO`.
- Esperado: status da escala reflete `[MACHUCADO]`.
