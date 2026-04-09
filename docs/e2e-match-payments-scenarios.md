## E2E - Pagamentos por partida

Baseado na seção **8. Pagamentos por partida** do manual (`docs/manual-test-scenarios.md`).

### Pré-condições

- Seed padrão (`DatabaseSeeder`).
- Owner: `11988888888` / `password`.
- Grupo **E2E Match Payments**: partida **finished** com `scheduled_at` no passado (mais recente que outras partidas finalizadas do owner no seed), `Grouped Player` com presença **going** (único confirmado na listagem de pagamentos).

### Cenários

#### 1) Atalho na listagem de grupos

- Em `/groups`, botão **PAGAMENTOS ÚLTIMA PARTIDA** visível para quem pode gerir pagamentos.
- Leva à rota `groups.matches.payments.manage` da última partida finalizada.

#### 2) Tela de pagamentos

- Cabeçalhos **PARTIDA**, **LOCAL** (quando houver).
- Tabela com colunas: jogador, dívida anterior, status, valor pago (R$), isento mensalidade, ação.
- Apenas jogadores com presença **going** na partida.

#### 3) Atualizar pagamento

- Alterar status para **PAGO**, valor em R$, **SALVAR**.
- Esperado: feedback de sucesso e resumo **PAGOS** / **NÃO PAGOS** coerente (ex.: um confirmado passa a pago).

#### 4) Permissão

- Jogador do grupo sem ser owner (ex.: `Grouped Player` / `11977777777`) não acessa a URL de pagamentos: **403**.
