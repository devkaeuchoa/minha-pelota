# Runtime e Secrets para Produção

## Princípios

- Configuração por ambiente, nunca hardcoded.
- Secrets fora do repositório.
- Menor privilégio e rotação periódica.

## Variáveis Obrigatórias (Laravel Web App)

- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL`
- `APP_KEY`
- `LOG_CHANNEL`
- `LOG_LEVEL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SESSION_DRIVER`
- `CACHE_STORE`
- `QUEUE_CONNECTION` (mesmo sem worker dedicado, definir explicitamente)

## Estratégia Recomendada

- `env` de produção armazenado em cofre seguro (1Password/Vault/Secret Manager).
- Injeção no runtime via:
  - arquivo `.env` na VPS com permissões restritas, ou
  - mecanismo de secret do orquestrador/plataforma.

## Política de Segurança

- Nunca commitar `.env` real.
- Acesso a secrets somente para operadores autorizados.
- Registrar toda rotação de credencial em changelog operacional.
- Revogar imediatamente credenciais de pessoas que saírem do time.

## Rotação de Credenciais

- Banco: a cada 180 dias ou após incidente.
- Chaves de integração externa: conforme SLA do provedor.
- `APP_KEY`: somente em eventos de segurança planejados.

## Checklist de Pronto

- Variáveis críticas definidas e validadas.
- `APP_DEBUG=false` garantido.
- Conexão com DB testada em produção.
- Relatório de verificação arquivado.
