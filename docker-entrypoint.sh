#!/usr/bin/env sh
set -e

if [ "${PRISMA_MIGRATE:-1}" = "1" ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
fi

echo "Starting Next.js..."
exec node server.js

