#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local has the correct values');
  process.exit(1);
}

console.log('Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);
  const sqlPath = path.join(__dirname, '..', 'db', filename);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by statement (simple approach - split on semicolon followed by newline)
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const statement of statements) {
    if (!statement) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      if (error) {
        // Try direct query if RPC doesn't work
        const { error: queryError } = await supabase.from('_').select('*').limit(0);
        console.log('⚠️  Note: Cannot execute SQL directly via JS client');
        console.log('Please run migrations manually in Supabase SQL Editor:');
        console.log(`\n${filename}\n`);
        return false;
      }
    } catch (err) {
      console.log('⚠️  SQL execution via JS client not supported');
      console.log('Please run migrations manually in Supabase SQL Editor');
      return false;
    }
  }

  return true;
}

async function main() {
  console.log('\n🚀 Starting database migrations...\n');

  // Test connection
  const { data, error } = await supabase.from('_migrations').select('*').limit(1);
  if (error && !error.message.includes('does not exist')) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Connected to Supabase successfully!\n');
  console.log('⚠️  Note: SQL migrations must be run manually via Supabase Dashboard');
  console.log('\nSteps to run migrations:');
  console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
  console.log('2. Copy and paste the contents of:');
  console.log('   - db/schema.sql');
  console.log('   - db/rls.sql');
  console.log('   - db/seed.sql (optional)');
  console.log('3. Run each migration\n');

  console.log('📋 Migration files ready in:');
  console.log('   - /db/schema.sql');
  console.log('   - /db/rls.sql');
  console.log('   - /db/seed.sql\n');
}

main().catch(console.error);
