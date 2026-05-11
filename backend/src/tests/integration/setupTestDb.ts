import { execSync } from 'child_process';
import { Client } from 'pg';

const TEST_DB = process.env.TEST_DB_NAME || 'LTIdb_test';
const ADMIN_URL =
  process.env.TEST_ADMIN_URL ||
  'postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/postgres';
const TEST_URL =
  process.env.TEST_DATABASE_URL ||
  `postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/${TEST_DB}`;

async function ensureDatabase(): Promise<void> {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try {
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB]);
    if (exists.rowCount === 0) {
      await client.query(`CREATE DATABASE "${TEST_DB}"`);
      console.log(`Created database ${TEST_DB}`);
    } else {
      console.log(`Database ${TEST_DB} already exists`);
    }
  } finally {
    await client.end();
  }
}

function applySchema(): void {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: TEST_URL },
    stdio: 'inherit',
  });
}

(async () => {
  await ensureDatabase();
  applySchema();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
