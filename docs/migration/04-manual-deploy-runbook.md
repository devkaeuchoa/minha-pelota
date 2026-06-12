# Runbook de Deploy Manual (VPS + Containers)

## Pré-requisitos

- Acesso SSH à VPS.
- Docker/Compose instalados na VPS.
- Imagem da aplicação publicada com tag imutável.
- Secrets de produção disponíveis.
- Janela de deploy definida.

## Checklist Pré-Deploy

- [ ] Tag da release validada (`vX.Y.Z` ou SHA).
- [ ] Backup recente do banco managed confirmado.
- [ ] Plano de rollback identificado (tag anterior).
- [ ] Health endpoint da versão atual respondendo.
- [ ] Time avisado da janela.

## Passo a Passo

1. **Conectar na VPS**
   - `ssh <user>@<host>`
2. **Atualizar referência da imagem/tag**
   - editar `compose`/arquivo de ambiente com nova tag.
3. **Baixar imagem**
   - `docker compose pull`
4. **Subir atualização**
   - `docker compose up -d`
5. **Executar migrações**
   - `docker compose exec app php artisan migrate --force`
6. **Limpar/otimizar cache**
   - `docker compose exec app php artisan optimize:clear`
7. **Healthcheck**
   - validar endpoint de saúde e página inicial.
8. **Smoke test funcional**
   - login admin;
   - listar grupos;
   - abrir detalhe de grupo;
   - navegar para presença/partidas.

## Critérios de Aprovação

- Containers principais `Up`.
- Healthcheck HTTP com status 200.
- Migrations sem erro.
- Smoke test essencial aprovado.

## Rollback Manual

1. Reapontar para tag anterior.
2. `docker compose pull`
3. `docker compose up -d`
4. Revalidar healthcheck/smoke.
5. Registrar incidente e causa raiz.

## Checklist Pós-Deploy

- [ ] Versão publicada confirmada.
- [ ] Logs sem erro crítico nos primeiros 10 minutos.
- [ ] Métricas estáveis (latência/erro).
- [ ] Relatório salvo em `reports/`.

## Evidências Mínimas

- tag implantada;
- hora de início/fim;
- resultado de healthcheck;
- resultado de smoke;
- decisão final (sucesso/rollback).
