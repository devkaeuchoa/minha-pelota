#!/bin/sh
set -e

# Discover and cache Laravel packages and service providers.
# Must run at startup because it requires the full application tree and env vars.
php artisan package:discover --ansi

# Cache config, routes and views for production performance.
# Requires APP_KEY and other env vars to be set via the compose env_file / secrets.
php artisan optimize

exec "$@"
