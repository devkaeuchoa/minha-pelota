# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — assets
# Builds the frontend with Node 22. Produces public/build/ and its manifest.
#
# Only the compiled output is copied to the final stage.
# node_modules and source files do NOT enter the final image.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Config files needed by Vite, Tailwind (content scanning) and TypeScript
COPY vite.config.js postcss.config.js tailwind.config.js tsconfig.json jsconfig.json ./

# Source: JS/TSX components + Blade views (Tailwind scans blade files for classes)
COPY resources/ resources/

# public/index.php is read by laravel-vite-plugin to determine the public path
COPY public/index.php public/

RUN npm run build


# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — vendor
# Installs PHP production dependencies with Composer.
#
# Only vendor/ is copied to the final stage.
# Composer itself, dev packages and cache do NOT enter the final image.
# ──────────────────────────────────────────────────────────────────────────────
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

# --no-scripts skips post-autoload-dump hooks (package:discover, etc.) that need
# the full application tree. Package and service discovery runs via the entrypoint
# at container startup when the real env is available.
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist


# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 — app (final image)
# PHP 8.2-FPM on Alpine. Runs Laravel as a FastCGI process on port 9000.
#
# What this image intentionally does NOT do:
#   - TLS termination         → handled by Nginx/Caddy (reverse proxy)
#   - HTTP routing            → handled by Nginx/Caddy
#   - Static file serving     → handled by Nginx/Caddy
#   - Queue workers           → separate container (planned post go-live)
#   - Scheduler               → separate container (planned post go-live)
# ──────────────────────────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS app

# Runtime libraries that must stay in the final image
RUN apk add --no-cache \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma

# Build-time libraries: compile extensions, then remove to keep the image lean
RUN apk add --no-cache --virtual .build-deps \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        bcmath \
        zip \
        gd \
        exif \
        pcntl \
        opcache \
    && apk del .build-deps

# Production PHP settings (OPcache, security, logging to stderr for Docker)
COPY docker/php/php.ini "$PHP_INI_DIR/conf.d/app.ini"

WORKDIR /app

# Application source — env files and dev artifacts excluded via .dockerignore
COPY --chown=www-data:www-data . .

# PHP production dependencies from the vendor stage
COPY --chown=www-data:www-data --from=vendor /app/vendor ./vendor

# Compiled frontend assets from the assets stage
COPY --chown=www-data:www-data --from=assets /app/public/build ./public/build

# Storage symlink: public/storage → storage/app/public
# Using ln instead of `php artisan storage:link` to avoid needing .env at build time
RUN ln -sf /app/storage/app/public /app/public/storage

# Ensure www-data can write to storage and bootstrap cache at runtime
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY --chown=www-data:www-data docker/app/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

# FastCGI port — only the reverse proxy should connect here; never expose publicly
EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
