# Migração para VPS + Containers: Visão Geral e Decisões

## Objetivo

Migrar o deploy da aplicação para uma VPS com containerização, mantendo operação simples e previsível no início, com foco em:

- estabilidade de release;
- rollback rápido;
- segurança mínima obrigatória;
- base para evoluir para automação depois.

## Escopo Inicial (Go-Live)

- Incluído: **web app Laravel + Inertia** rodando em containers.
- Incluído: banco em provedor **managed** externo.
- Excluído do go-live: workers de fila e scheduler dedicados.

## Decisões Fechadas

1. Hospedagem em **VPS**.
2. Banco de dados **managed**.
3. Primeira fase apenas **web app**.
4. Deploy **manual** primeiro, com runbook e checklist.

## Critérios de Sucesso

- Deploy manual repetível com checklist.
- Aplicação acessível com TLS e healthcheck verde.
- Conectividade estável com banco managed.
- Tempo de rollback menor que 15 minutos.
- Evidências de execução registradas por release.

## Ordem Recomendada de Leitura

1. `01-target-architecture-vps.md`
2. `02-managed-database-strategy.md`
3. `03-runtime-and-secrets.md`
4. `04-manual-deploy-runbook.md`
5. `05-observability-and-operations.md`
6. `06-queue-and-scheduler-future.md`
7. `07-agent-prompts-playbook.md`
8. `08-verification-script-spec.md`

## Definição de Pronto da Migração

Uma release só é considerada pronta quando:

- runbook foi executado sem desvio crítico;
- smoke tests essenciais passaram;
- relatório do gate de verificação foi gerado;
- rollback foi testado ao menos uma vez em homologação.
