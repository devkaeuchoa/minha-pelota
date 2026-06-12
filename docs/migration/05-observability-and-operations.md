# Observabilidade e Operação

## Objetivo Operacional

Detectar falhas rapidamente, reduzir MTTR e manter previsibilidade do serviço.

## Logs

- Aplicação: logs Laravel em stdout/stderr preferencialmente.
- Proxy web: access/error logs com rotação.
- Padrão de retenção inicial: 7 a 14 dias.

## Métricas Mínimas

- disponibilidade HTTP;
- latência p95;
- taxa de erro 5xx;
- uso de CPU/RAM da VPS;
- conexões e latência do banco managed.

## Alertas Iniciais

- HTTP 5xx acima de limite por 5 minutos.
- Healthcheck fora do ar por mais de 2 minutos.
- CPU sustentada acima de 85%.
- storage da VPS acima de 80%.

## Rotina Semanal

- revisar logs de erro crítico;
- revisar custo de VPS + DB managed;
- validar backup recente do banco;
- verificar pendências de segurança no host.

## Rotina Mensal

- testar restauração de backup em ambiente de teste;
- revisar usuários e permissões de acesso;
- revisar necessidade de tuning de recursos.

## Playbook de Incidente

1. detectar e classificar severidade;
2. mitigar impacto (rollback ou isolamento);
3. comunicar status;
4. registrar RCA;
5. abrir ação preventiva.
