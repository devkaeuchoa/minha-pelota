# Especificação do Script de Verificação da Migração

## Nome e Objetivo

- Nome: `scripts/verify-migration-steps.sh`
- Objetivo: verificar se os passos da migração foram executados corretamente e se os resultados esperados foram atingidos.

## Interface de Linha de Comando

```bash
./scripts/verify-migration-steps.sh \
  --env-file .env.production \
  --base-url https://app.exemplo.com \
  --db-host db.exemplo.com \
  --db-port 3306 \
  --db-name app_db \
  [--strict]
```

## Entradas

- `--env-file`: arquivo com variáveis necessárias para runtime.
- `--base-url`: URL da aplicação para healthcheck/smoke.
- `--db-host`: host do managed DB.
- `--db-port`: porta do managed DB.
- `--db-name`: nome do schema principal.
- `--strict`: converte warnings em falha.

## Contrato de Saída

- `exit 0`: todos os gates obrigatórios passaram.
- `exit 1`: ao menos um gate obrigatório falhou.
- `exit 2`: erro de uso (parâmetros ausentes/inválidos).

Relatório obrigatório:

- `reports/migration-verification-<timestamp>.md`

## Gates Obrigatórios

## Gate 1: Configuração

- Validar existência de `--env-file`.
- Validar presença das chaves críticas (`APP_ENV`, `APP_KEY`, `APP_URL`, `DB_*`).
- Falha se `APP_DEBUG=true`.

## Gate 2: Runtime de Containers

- Verificar containers essenciais em estado `Up`.
- Verificar imagem/tag esperada em execução.
- Falha se serviço principal reiniciando em loop.

## Gate 3: Saúde Web

- `GET /` ou endpoint de health retornando 200.
- Latência inicial abaixo do limite acordado (ex.: 2s).
- Falha em timeout/5xx.

## Gate 4: Banco Managed

- Conectividade TCP a `db-host:db-port`.
- Conexão lógica ao `db-name`.
- Falha se conexão indisponível ou credenciais inválidas.

## Gate 5: Smoke Funcional

- Login básico.
- Página de grupos acessível.
- Navegação de grupo para partidas/presença.
- Falha em qualquer fluxo crítico.

## Formato de Relatório

Cada gate deve registrar:

- status (`PASS`/`FAIL`/`WARN`);
- evidência curta (comando/endpoint/erro);
- ação corretiva sugerida.

Resumo final:

- total de gates;
- quantos passaram/falharam;
- decisão final (`APPROVED`/`REJECTED`).

## Matriz de Checks (base para implementação)

| check_id       | gate         | validação          | aprovação    | ação corretiva         |
| -------------- | ------------ | ------------------ | ------------ | ---------------------- |
| cfg_env_exists | configuração | arquivo env existe | arquivo lido | corrigir caminho/env   |
| cfg_debug_off  | configuração | APP_DEBUG          | `false`      | ajustar variável       |
| ctr_app_up     | containers   | serviço app        | `Up`         | restart/revisar logs   |
| web_health     | saúde web    | HTTP base-url      | 200          | rollback ou fix app    |
| db_tcp         | banco        | porta DB           | conectável   | revisar rede/allowlist |
| db_auth        | banco        | credenciais DB     | login ok     | rotacionar secret      |
| smoke_login    | smoke        | login              | sucesso      | corrigir release       |

## Compatibilidade Futura com CI/CD

O script deve ser idempotente e não destrutivo, para ser reaproveitado em pipeline quando o time migrar de deploy manual para automação.
