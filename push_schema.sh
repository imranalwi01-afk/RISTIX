#!/bin/bash
cd /app
export DATABASE_URL="postgresql://${TENANT_DB_USER}:${TENANT_DB_PASSWORD}@${TENANT_DB_HOST}:${TENANT_DB_PORT}/${TENANT_DB_NAME}"
bun run db:push
