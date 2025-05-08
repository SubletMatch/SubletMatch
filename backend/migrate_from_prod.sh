#!/bin/bash

# Load environment variables
set -o allexport
source .env
set +o allexport

echo "🔄 Dumping production DB..."
PGPASSWORD="$PROD_PASSWORD" pg_dump --format=plain --no-owner --no-comments \
  -h "$PROD_HOST" -U "$PROD_USER" -d "$PROD_DB" -f prod_dump.sql

echo "🧨 Dropping and recreating local DB..."
PGPASSWORD="$LOCAL_PASSWORD" dropdb -h "$LOCAL_HOST" -U "$LOCAL_USER" "$LOCAL_DB"
PGPASSWORD="$LOCAL_PASSWORD" createdb -h "$LOCAL_HOST" -U "$LOCAL_USER" "$LOCAL_DB"

echo "📦 Restoring to local DB..."
PGPASSWORD="$LOCAL_PASSWORD" psql -h "$LOCAL_HOST" -U "$LOCAL_USER" -d "$LOCAL_DB" -f prod_dump.sql


echo "✅ Migration complete!"
