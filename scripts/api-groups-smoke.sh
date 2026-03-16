#!/usr/bin/env bash
set -euo pipefail

# Simple smoke tests for Minha Pelota groups & players API using curl.
# Requirements:
# - Backend running (php artisan serve) on http://127.0.0.1:8000
# - Authenticated session cookie or Sanctum token
#
# Usage examples:
#   TOKEN="your-sanctum-token" ./scripts/api-groups-smoke.sh
#   Or, if using cookie-based auth, adapt the CURL_AUTH header below.

API_BASE="${API_BASE:-http://127.0.0.1:8000/api}"
AUTH_HEADER=""

if [[ -n "${TOKEN:-}" ]]; then
  AUTH_HEADER="Authorization: Bearer ${TOKEN}"
else
  echo "WARNING: TOKEN env var not set; requests may be unauthenticated."
fi

json() {
  jq "${1:-.}"
}

echo "==> Creating group"
CREATE_GROUP_RESPONSE=$(curl -sS -X POST "${API_BASE}/groups" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "name": "Smoke Test Group",
    "slug": "smoke-test-group",
    "weekday": "monday",
    "time": "20:00",
    "location_name": "Smoke Arena"
  }')

echo "${CREATE_GROUP_RESPONSE}" | json
GROUP_ID=$(echo "${CREATE_GROUP_RESPONSE}" | jq -r '.id')

if [[ -z "${GROUP_ID}" || "${GROUP_ID}" == "null" ]]; then
  echo "Failed to create group, aborting."
  exit 1
fi

echo ""
echo "==> Creating player user (via tinker or separate flow) is assumed."
echo "Set PLAYER_ID env var to an existing user id."

if [[ -z "${PLAYER_ID:-}" ]]; then
  echo "PLAYER_ID not set; skipping attach/list/update/detach steps."
  exit 0
fi

echo ""
echo "==> Attaching player ${PLAYER_ID} to group ${GROUP_ID}"
ATTACH_RESPONSE=$(curl -sS -X POST "${API_BASE}/groups/${GROUP_ID}/players" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d "{
    \"user_id\": ${PLAYER_ID},
    \"is_admin\": false
  }")

echo "${ATTACH_RESPONSE}" | json

echo ""
echo "==> Listing group players"
curl -sS "${API_BASE}/groups/${GROUP_ID}/players" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} | json

echo ""
echo "==> Updating player admin + physical_condition"
UPDATE_RESPONSE=$(curl -sS -X PATCH "${API_BASE}/groups/${GROUP_ID}/players/${PLAYER_ID}" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "is_admin": true,
    "physical_condition": "fit"
  }')

echo "${UPDATE_RESPONSE}" | json

echo ""
echo "==> Removing player from group"
curl -sS -X DELETE "${API_BASE}/groups/${GROUP_ID}/players/${PLAYER_ID}" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} -o /dev/null -w "%{http_code}\n"

echo "Smoke tests finished."

