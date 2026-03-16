# Setup — Minha Pelota

## Opção A: Script automático (PHP/Composer local)

```bash
cd /home/kaeuchoa/Work/minha-pelota
./scripts/setup-sprint-0.sh
```

Requer: PHP 8.2+, Composer, Node.js 18+, npm.

## Opção B: Via Docker (sem PHP instalado localmente)

```bash
cd /home/kaeuchoa/Work/minha-pelota
./scripts/setup-sprint-0-docker.sh
```

Requer: Docker. O script usa uma imagem com PHP 8.2 + Composer + Node.

## Opção C: Passos manuais

### Pré-requisitos

- PHP 8.2+
- Composer
- Node.js 18+ e npm (para build do frontend)
- MySQL 8.0 (ou MariaDB)

### Passo 1: Criar projeto Laravel

```bash
cd /home/kaeuchoa/Work

# Criar Laravel em pasta temporária
composer create-project laravel/laravel minha-pelota-temp

# Mover arquivos para minha-pelota (preservando planning/)
shopt -s dotglob
mv minha-pelota-temp/* minha-pelota/
rmdir minha-pelota-temp
```

## Passo 2: Instalar Breeze + Inertia + React

```bash
cd minha-pelota

composer require laravel/breeze --dev
php artisan breeze:install react
npm install
npm run build
```

## Passo 3: Configurar ambiente

```bash
cp .env.example .env
php artisan key:generate
```

Edite `.env` e configure:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=minha_pelota
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

Depois:

```bash
php artisan migrate
```

## Passo 4: Rodar em desenvolvimento

```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (hot reload)
npm run dev
```

Acesse: http://localhost:8000
