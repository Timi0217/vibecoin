/**
 * Database migration script
 */

const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

async function migrate() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await db.query(schema);

    console.log('✅ Database migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate();
