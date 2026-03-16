#!/bin/bash
# Sprint 0 — Setup Minha Pelota
# Execute a partir da raiz do projeto: bash scripts/setup-sprint-0.sh

set -e
cd "$(dirname "$0")/.."

REPO_ROOT=$(pwd)
PLANNING_BACKUP="/tmp/minha-pelota-planning-$$"

# Fallback para Docker se Composer não estiver instalado
if ! command -v composer &>/dev/null; then
  if command -v docker &>/dev/null; then
    echo "==> Composer não encontrado. Usando Docker..."
    exec bash "$(dirname "$0")/setup-sprint-0-docker.sh"
  else
    echo "ERRO: PHP/Composer não instalados. Opções:"
    echo ""
    echo "  1. Instale PHP 8.2+ e Composer, depois execute: ./scripts/setup-sprint-0.sh"
    echo "  2. Instale Docker, depois execute: ./scripts/setup-sprint-0-docker.sh"
    echo "  3. Siga os passos manuais em SETUP.md"
    echo ""
    exit 1
  fi
fi

echo "==> Backup da pasta planning..."
cp -r planning "$PLANNING_BACKUP"

echo "==> Criando projeto Laravel (preservando planning)..."
composer create-project laravel/laravel . --prefer-dist --no-interaction

echo "==> Restaurando pasta planning..."
rm -rf planning
cp -r "$PLANNING_BACKUP" planning
rm -rf "$PLANNING_BACKUP"

echo "==> Instalando Laravel Breeze (Inertia + React)..."
php artisan breeze:install react --no-interaction

echo "==> Instalando dependências frontend..."
npm install

echo "==> Build inicial..."
npm run build

echo ""
echo "==> Sprint 0 setup concluído!"
echo "Próximos passos:"
echo "  1. Copie .env.example para .env e configure DB_DATABASE, DB_USERNAME, DB_PASSWORD"
echo "  2. Execute: php artisan migrate"
echo "  3. Execute: php artisan serve"
echo "  4. Acesse: http://localhost:8000"
