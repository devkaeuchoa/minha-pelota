#!/bin/bash
# Sprint 0 — Setup Minha Pelota (via Docker/Podman)
# Use quando PHP/Composer não estiverem instalados localmente.
# Requer: Docker ou Podman (Fedora/Nobara)

set -e
cd "$(dirname "$0")/.."

# Detectar Docker ou Podman
if command -v docker &>/dev/null; then
  CONTAINER_CMD=docker
elif command -v podman &>/dev/null; then
  CONTAINER_CMD=podman
else
  echo "Erro: Docker ou Podman não encontrado. Instale com:"
  echo "  Nobara/Fedora: sudo dnf install -y podman"
  exit 1
fi

REPO_ROOT=$(pwd)
PLANNING_BACKUP="/tmp/minha-pelota-planning-$$"

echo "==> Usando $CONTAINER_CMD para setup..."
if [[ -d planning ]]; then
  echo "==> Backup da pasta planning..."
  cp -r planning "$PLANNING_BACKUP"
  HAS_PLANNING_BACKUP=1
else
  HAS_PLANNING_BACKUP=0
fi

echo "==> Construindo imagem de setup..."
$CONTAINER_CMD build -f Dockerfile.setup -t minha-pelota-setup .

echo "==> Criando projeto Laravel em diretório temporário..."
LARAVEL_TEMP="temp-laravel-$$"
$CONTAINER_CMD run --rm -v "$REPO_ROOT:/app" -w /app minha-pelota-setup \
  composer create-project laravel/laravel "$LARAVEL_TEMP" --prefer-dist --no-interaction

echo "==> Movendo arquivos do Laravel para o projeto..."
rm -rf planning
cp -a "$LARAVEL_TEMP"/. .
rm -rf "$LARAVEL_TEMP"

if [[ "$HAS_PLANNING_BACKUP" -eq 1 ]] && [[ -d "$PLANNING_BACKUP" ]]; then
  echo "==> Restaurando pasta planning..."
  cp -r "$PLANNING_BACKUP" planning
  rm -rf "$PLANNING_BACKUP"
fi

echo "==> Instalando Laravel Breeze (Inertia + React)..."
$CONTAINER_CMD run --rm -v "$REPO_ROOT:/app" -w /app minha-pelota-setup \
  sh -c "composer require laravel/breeze --dev --no-interaction && php artisan breeze:install react --no-interaction"

echo "==> Instalando dependências frontend (local)..."
npm install

echo "==> Build inicial..."
npm run build

echo ""
echo "==> Sprint 0 setup concluído!"
echo "Próximos passos:"
echo "  1. cp .env.example .env && php artisan key:generate"
echo "  2. Configure DB_* no .env"
echo "  3. php artisan migrate"
echo "  4. php artisan serve (terminal 1) + npm run dev (terminal 2)"
