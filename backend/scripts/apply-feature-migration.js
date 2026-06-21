const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const migrationName = '20260621170000_myproject_feature_parity';
const migrationFile = path.resolve(__dirname, `../prisma/migrations/${migrationName}/migration.sql`);

async function apply() {
  const sql = fs.readFileSync(migrationFile, 'utf8');
  const checksum = crypto.createHash('sha256').update(sql).digest('hex');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const existing = await client.query(
      'SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL',
      [migrationName],
    );
    if (existing.rowCount) {
      console.log('Feature migration is already applied.');
      return;
    }
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      'INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)',
      [crypto.randomUUID(), checksum, migrationName],
    );
    await client.query('COMMIT');
    console.log('Feature migration applied and recorded.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

apply().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
