#!/bin/bash

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Extract project ID from Supabase URL
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')

echo "🔗 Connecting to Supabase project: $PROJECT_REF"
echo ""

# Build connection string
DB_URL="postgresql://postgres.[PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo "📝 Running migrations..."
echo ""
echo "To run migrations manually:"
echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql"
echo "2. Run db/schema.sql"
echo "3. Run db/rls.sql"
echo "4. (Optional) Run db/seed.sql"
echo ""
