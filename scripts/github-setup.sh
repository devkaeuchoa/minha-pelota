#!/bin/bash
# Configura repositório remoto no GitHub e faz o primeiro push.
# Uso: GITHUB_USER=seu-usuario ./scripts/github-setup.sh
# Ou: ./scripts/github-setup.sh seu-usuario

set -e
cd "$(dirname "$0")/.."

GITHUB_USER="${GITHUB_USER:-${1:-devkaeuchoa}}"

REPO="minha-pelota"
REMOTE="https://github.com/${GITHUB_USER}/${REPO}.git"

echo "==> Removendo remote origin se existir..."
git remote remove origin 2>/dev/null || true

echo "==> Adicionando remote origin: $REMOTE"
git remote add origin "$REMOTE"

echo "==> Fazendo push..."
git push -u origin main

echo ""
echo "==> Repositório configurado: https://github.com/${GITHUB_USER}/${REPO}"
