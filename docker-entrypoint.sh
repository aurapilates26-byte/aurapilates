#!/usr/bin/env sh
set -e

if [ "${PRISMA_MIGRATE:-1}" = "1" ]; then
  echo "Running prisma migrate deploy..."
  # Do not use `npx prisma` here: it can resolve to Prisma 7+ and break schema v6.
  export NPM_CONFIG_YES=true
  npm exec --package=prisma@6.19.3 -- prisma migrate deploy
fi

echo "Starting Next.js..."
exec node server.js

