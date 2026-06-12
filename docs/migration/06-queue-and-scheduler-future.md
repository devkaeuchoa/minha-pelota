# Evolução Futura: Queue e Scheduler

## Contexto da Decisão Atual

No go-live, o escopo é só web app para reduzir variáveis operacionais. Isso é correto para começar, mas há limites claros quando o volume crescer.

## O Que é Queue no Laravel

Queue move tarefas demoradas para processamento assíncrono:

- envio de notificações;
- integrações externas;
- geração de relatórios;
- processamento de arquivos.

### Benefícios

- menor latência para o usuário;
- menor risco de timeout em requests;
- melhor controle de retries e falhas.

### Custos/Complexidade

- exige broker/driver adequado;
- exige worker sempre ativo;
- exige monitoramento específico de filas.

## O Que é Scheduler no Laravel

Scheduler centraliza jobs recorrentes (`app/Console/Kernel.php`), como:

- limpeza de dados temporários;
- reconciliações;
- tarefas de manutenção.

### Benefícios

- agenda declarativa em código;
- previsibilidade de execução.

### Custos/Complexidade

- precisa de trigger periódico (`php artisan schedule:run`);
- requer observabilidade para falhas silenciosas.

## Gatilhos para Adotar Queue

- requests com p95 degradando por tarefas demoradas;
- aumento de timeout em ações específicas;
- necessidade de retries automáticos.

## Gatilhos para Adotar Scheduler

- tarefas manuais recorrentes;
- scripts operacionais sem padronização;
- dependência de execução em horários fixos.

## Plano Incremental Recomendado

1. Introduzir `QUEUE_CONNECTION` adequado (ex.: Redis).
2. Criar container `worker` separado.
3. Adicionar monitoramento de jobs falhos.
4. Introduzir `scheduler` como container/cron dedicado.
5. Definir SLO de atraso de fila e sucesso de jobs.

## Ajustes Técnicos Esperados

- `.env`: `QUEUE_CONNECTION`, `CACHE_STORE`, `REDIS_*` (se aplicável).
- Infra: novo serviço `worker` no compose.
- Operação: alertas para backlog e failed jobs.

## Riscos se Não Evoluir

- web app sobrecarrega com tarefas síncronas;
- piora progressiva de UX;
- maior chance de incidentes em horários de pico.
