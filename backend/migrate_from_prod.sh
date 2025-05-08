#!/bin/bash
set -e  # Exit immediately on error

# Load environment variables
set -o allexport
source .env
set +o allexport

# Filenames
DUMP_FILE="prod_dump.sql"
CLEAN_DUMP_FILE="clean_prod_dump.sql"

echo "🔄 Dumping production DB..."
PGPASSWORD="$PROD_PASSWORD" pg_dump --format=plain --no-owner --no-comments \
  -h "$PROD_HOST" -U "$PROD_USER" -d "$PROD_DB" -f "$DUMP_FILE"

# Remove problematic SET lines (e.g., transaction_timeout)
grep -v 'SET .*transaction_timeout' "$DUMP_FILE" > "$CLEAN_DUMP_FILE"

echo "🧹 Terminating active connections to local DB ($LOCAL_DB)..."
PGPASSWORD="$LOCAL_PASSWORD" psql -h "$LOCAL_HOST" -U "$LOCAL_USER" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${LOCAL_DB}' AND pid <> pg_backend_pid();"

echo "🧨 Dropping and recreating local DB..."
PGPASSWORD="$LOCAL_PASSWORD" dropdb -h "$LOCAL_HOST" -U "$LOCAL_USER" "$LOCAL_DB"
PGPASSWORD="$LOCAL_PASSWORD" createdb -h "$LOCAL_HOST" -U "$LOCAL_USER" "$LOCAL_DB"

echo "📦 Restoring to local DB..."
PGPASSWORD="$LOCAL_PASSWORD" psql -h "$LOCAL_HOST" -U "$LOCAL_USER" -d "$LOCAL_DB" -f "$CLEAN_DUMP_FILE"

echo "✅ Migration complete!"
