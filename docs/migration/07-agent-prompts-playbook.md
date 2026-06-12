# Playbook de Prompts para Agentes

## Como Usar

- Execute um prompt por etapa.
- Exija saída com checklist de aceite.
- Se falhar, agente deve propor correção e rerun.

---

## Fase 0: Containerização Local (pré-requisito de deploy)

Execute os prompts 0-A → 0-B → 0-C em sequência. Só avance para a Fase 1 (VPS) após 0-C aprovado.

---

## Prompt 0-A: Diagnóstico do Projeto para Containerização

```text
Contexto: Projeto Laravel 11 + Inertia (React/Vue). Nenhum container existe ainda.
Objetivo: auditar o projeto e produzir um plano de containerização local, sem tocar em deploy de VPS.
Tarefas:
1) Listar dependências de runtime (PHP version, extensões usadas, Node version, pacotes npm/yarn).
2) Identificar serviços externos necessários localmente (DB, cache, sessão, e-mail, storage).
3) Identificar arquivos de configuração sensíveis (.env, chaves) e onde ficam.
4) Apontar possíveis conflitos para containerização (caminhos hardcoded, permissões de storage, link simbólico público).
Saída esperada:
- tabela de dependências com versão mínima requerida
- lista de serviços a incluir no compose local
- lista de ajustes necessários no código/config antes de containerizar
- decisão sobre estratégia de imagem (single-stage vs multi-stage)
```

## Prompt 0-B: Dockerfile de Produção (Multi-Stage)

```text
Contexto: projeto Laravel 11 + Inertia com assets Vite. PHP 8.x + Node para build.
Objetivo: criar Dockerfile multi-stage otimizado para produção local e futura VPS.
Tarefas:
1) Stage 1 (assets): instalar dependências Node, rodar `npm run build`, copiar `public/build/` para stage final.
2) Stage 2 (app): imagem PHP-FPM alpine, instalar só extensões necessárias, copiar código + assets buildados.
3) Garantir que a imagem final não contenha: node_modules, arquivos .env, chaves privadas.
4) Configurar `storage/` e `bootstrap/cache/` com permissões corretas dentro do container.
5) Expor porta do PHP-FPM (9000) e documentar o que o Dockerfile não faz (TLS, routing HTTP — responsabilidade do reverse proxy).
Saída esperada:
- Dockerfile funcional e comentado
- .dockerignore cobrindo node_modules, .env, .git, vendor (se não instalar no build)
- checklist de validação: `docker build` sem erro, `docker run` sobe PHP-FPM, storage gravável
```

## Prompt 0-C: Stack Local com Docker Compose

```text
Contexto: Dockerfile do app já existe (saída do Prompt 0-B). Objetivo: stack completa rodando localmente via docker compose.
Objetivo: montar ambiente local funcional e reproduzível, sem depender de serviços externos.
Tarefas:
1) Definir serviços mínimos:
   - `app` (PHP-FPM, build local da imagem)
   - `web` (Nginx ou Caddy servindo HTTP na porta 8080 e roteando FastCGI para `app`)
   - `db` (MySQL 8 ou MariaDB 10.x com healthcheck)
2) Configurar volumes:
   - bind mount de `storage/app/` para persistir uploads locais
   - volume nomeado para dados do DB (não bind mount em diretório do projeto)
3) Configurar rede interna: `app` e `db` não expostos diretamente — só `web` expõe porta pública.
4) Criar `.env.example` completo para ambiente Docker local (sem secrets reais).
5) Adicionar target `migrate` e `seed` como comandos no Makefile ou seção de scripts no README.
Saída esperada:
- `docker-compose.yml` (ou `compose.yaml`) funcional
- `docker/nginx/default.conf` ou `Caddyfile` local
- `.env.example` com todas as variáveis para o ambiente Docker
- checklist de aceite local:
  [ ] `docker compose up --build` sobe sem erro
  [ ] app acessível em http://localhost:8080
  [ ] `docker compose exec app php artisan migrate` roda sem erro
  [ ] login funcional no browser
  [ ] `docker compose down -v` limpa tudo sem resíduo
```

---

## Prompt 1: Arquitetura de VPS

```text
Contexto: Projeto Laravel 11 + Inertia web app.
Objetivo: validar arquitetura de deploy em VPS com containerização (sem queue/scheduler no go-live).
Tarefas:
1) Revisar arquitetura proposta e listar riscos.
2) Produzir checklist de hardening mínimo de host.
3) Definir critérios de aceite para publicação.
Saída esperada:
- lista de riscos priorizados
- checklist operacional
- critérios objetivos de aprovação
```

## Prompt 2: Hardening da VPS

```text
Objetivo: executar/verificar hardening básico da VPS para produção.
Tarefas:
1) Validar usuário não-root, chave SSH e firewall.
2) Confirmar portas abertas mínimas (SSH, 80, 443).
3) Propor ajustes de segurança faltantes.
Saída esperada:
- tabela "status atual vs recomendado"
- comandos de correção
- resumo de risco residual
```

## Prompt 3: Deploy Manual

```text
Objetivo: executar runbook de deploy manual da release.
Tarefas:
1) Confirmar pré-checks.
2) Atualizar tag da imagem e subir containers.
3) Rodar migrations e healthcheck.
4) Registrar evidências (tempo, versão, resultado).
Saída esperada:
- relatório passo a passo
- resultado final (sucesso/falha)
- ação de rollback se necessário
```

## Prompt 4: Validação de Smoke

```text
Objetivo: validar o fluxo essencial do web app após deploy.
Tarefas:
1) Testar login.
2) Testar listagem e detalhe de grupo.
3) Testar navegação para partidas/presença.
4) Reportar erros com impacto e hipótese de causa.
Saída esperada:
- checklist de smoke
- evidência por item
- conclusão de go/no-go
```

## Prompt 5: Rollback Controlado

```text
Objetivo: executar rollback para tag anterior com mínimo downtime.
Tarefas:
1) Reverter referência de tag.
2) Subir versão anterior.
3) Revalidar healthcheck e smoke mínimo.
Saída esperada:
- timeline de rollback
- confirmação de estabilidade
- possível causa raiz do incidente
```

## Prompt 6: Evolução para Queue/Scheduler

```text
Objetivo: propor plano incremental para introduzir queue/scheduler depois do go-live.
Tarefas:
1) Definir gatilhos técnicos de adoção.
2) Propor mudanças mínimas na infra.
3) Estimar impacto operacional e risco.
Saída esperada:
- roadmap em fases
- critérios de entrada de cada fase
- métricas para medir sucesso
```

## Prompt 7: Verificação por Gates

```text
Objetivo: executar script de verificação da migração e validar critérios de sucesso.
Tarefas:
1) Executar scripts/verify-migration-steps.sh com parâmetros.
2) Analisar relatório e identificar falhas por etapa.
3) Sugerir correção objetiva para cada falha.
Saída esperada:
- status por gate (pass/fail)
- ações corretivas priorizadas
- recomendação final (aprovar/reprovar deploy)
```
