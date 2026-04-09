## E2E - Gestao de grupos (admin/owner)

Baseado no cenario manual em `docs/manual-test-scenarios.md` (secao 4).

## Cobertura e redundancia

- Nao ha cobertura desses fluxos em outras suites E2E existentes.
- Todos os 4 cenarios foram implementados nesta suite.
- A suite roda em modo `serial` pois o teste de criacao depende do estado vazio
  deixado pela fixture `Admin No Groups`.

## Fixtures seed utilizadas

| Fixture              | Telefone    | Descricao                                 |
| -------------------- | ----------- | ----------------------------------------- |
| `Admin No Groups`    | 11966666666 | Admin sem grupos — estado vazio + criacao |
| `Owner Player`       | 11988888888 | Dono de grupos — edicao + remocao em lote |
| `E2E Group 2`        | —           | Grupo para o teste de edicao              |
| `E2E Batch Delete 1` | —           | Grupo para o teste de remocao em lote     |
| `E2E Batch Delete 2` | —           | Grupo para o teste de remocao em lote     |

## Cenarios

### 1) Listagem vazia exibe CTA de criar grupo

- Login com `Admin No Groups` (sem grupos proprios).
- Navegar para `/groups`.
- Esperado: mensagem "VOCE AINDA NAO POSSUI GRUPOS." e botao "CRIAR NOVO GRUPO".

### 2) Criacao de grupo

- `Admin No Groups` clica em "CRIAR NOVO GRUPO" a partir do estado vazio.
- Preenche nome, seleciona dia da semana (Sexta-feira), horario e local.
- Esperado: redirecionamento para `/groups/{id}`, grupo criado visivel.

### 3) Edicao de grupo

- Login com `Owner Player`.
- Editar `E2E Group 2` — alterar local para "Quadra Editada".
- Esperado: redirecionamento para `/groups/{id}`, local atualizado aparece na listagem.

### 4) Remocao em lote

- Login com `Owner Player`.
- Selecionar `E2E Batch Delete 1` e `E2E Batch Delete 2`.
- Clicar em "REMOVER SELECIONADOS".
- Esperado: grupos removidos nao aparecem mais na listagem.
