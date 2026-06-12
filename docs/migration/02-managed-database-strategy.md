# Estratégia de Banco Managed

## Por Que Managed DB Neste Projeto

Para esta migração, banco managed reduz risco operacional no ponto mais crítico da stack (dados), porque transfere para o provedor:

- backup automático e retenção;
- patching de engine;
- alta disponibilidade (dependendo do plano);
- observabilidade de performance e storage.

Isso permite que a equipe foque primeiro em estabilizar o deploy da aplicação na VPS.

## Critérios de Escolha do Provedor

- Compatibilidade com MySQL/MariaDB usada no Laravel.
- Suporte a TLS obrigatório.
- Políticas de backup/restauração claras.
- Métricas de CPU, conexões e IOPS.
- Plano com crescimento previsível de custo.
- Possibilidade de replica/read replica no futuro.

## Requisitos de Segurança

- Credenciais exclusivas por ambiente (`prod`, `staging`).
- Usuário DB com menor privilégio possível.
- Conexão somente via TLS.
- Allowlist de IP da VPS.
- Rotação semestral (ou menor) de senha/secret.

## Configuração de Aplicação

Variáveis mínimas no runtime da app:

- `DB_CONNECTION=mysql`
- `DB_HOST=<managed-host>`
- `DB_PORT=<managed-port>`
- `DB_DATABASE=<db-name>`
- `DB_USERNAME=<db-user>`
- `DB_PASSWORD=<db-password>`
- parâmetros TLS conforme provedor (`MYSQL_ATTR_SSL_CA`, etc).

## Operação e SLO Básico

- Backup diário automático com retenção mínima de 7 dias.
- Teste de restauração mensal em ambiente de homologação.
- Alertas para:
  - uso de storage acima de 80%;
  - saturação de conexões;
  - picos de latência.

## Plano de Rollback de Dados

Em caso de incidente:

1. Congelar deploy de app.
2. Identificar último ponto íntegro (backup/snapshot).
3. Restaurar para instância temporária.
4. Validar consistência funcional mínima.
5. Trocar endpoint da app com janela controlada.

## Riscos Específicos e Mitigações

- **Latência entre VPS e DB**: escolher região próxima e medir RTT antes do go-live.
- **Lock-in de provedor**: manter scripts de dump/restore portáveis.
- **Custos inesperados**: criar budget alert por uso de storage e IOPS.

## Detalhamento: Banco Managed na Prática

### Vantagens concretas

- Menos tarefas de DBA no dia a dia.
- Menos chance de perda de dados por erro operacional na VPS.
- Recuperação mais rápida via snapshot/backups nativos.

### Limitações reais

- Custo mensal maior que DB local na VPS.
- Menor liberdade para tunings profundos de engine.
- Algumas operações administrativas podem exigir plano mais caro.

### Quando revisar a decisão

- Se custo crescer mais rápido que uso real.
- Se requisitos exigirem tunings não suportados no plano atual.
- Se demanda exigir topologia com réplicas e failover avançado.
