## E2E - Registro de jogador

Baseado no cenario manual em `docs/manual-test-scenarios.md` (secao 2).

## Cobertura e custo

- O caso **"Registro com telefone valido e unico"** ja e coberto indiretamente na suite `tests/e2e/auth-phone.spec.ts`, no helper `registerPlayer`, usado em multiplos testes.
- Para evitar redundancia e custo extra de E2E, esta suite cobre somente os cenarios exclusivos de registro.

### 1) Telefone duplicado

- Criar um jogador com telefone unico.
- Tentar novo registro com o mesmo telefone.
- Esperado: mensagem de indisponibilidade/duplicidade no campo `phone` e bloqueio de progresso.

### 2) Validacao de telefone durante digitacao

- Informar telefone invalido (curto) e sair do campo.
- Esperado: mensagem de telefone invalido (`Informe um telefone valido.`).
