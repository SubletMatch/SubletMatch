#!/bin/bash

# Load environment variables
set -o allexport
source .env
set +o allexport

# Step 1: Dump production DB
echo "🔄 Dumping production DB..."
PGPASSWORD=$PROD_PASSWORD pg_dump -h $PROD_HOST -U $PROD_USER -d $PROD_DB -Fc > prod_dump.dump

# Step 2: Drop and recreate local DB
echo "🧨 Dropping and recreating local DB..."
PGPASSWORD=$LOCAL_PASSWORD dropdb -h $LOCAL_HOST -U $LOCAL_USER $LOCAL_DB
PGPASSWORD=$LOCAL_PASSWORD createdb -h $LOCAL_HOST -U $LOCAL_USER $LOCAL_DB

# Step 3: Restore to local DB
echo "📦 Restoring to local DB..."
PGPASSWORD=$LOCAL_PASSWORD pg_restore -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB -c prod_dump.dump

echo "✅ Migration complete!"
