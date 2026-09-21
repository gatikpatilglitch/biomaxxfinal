// setup-db.js - Automated PostgreSQL Database Setup for BioMaxxx
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function tryConnect(user, password, port, database = 'postgres') {
  const client = new pg.Client({
    user,
    host: 'localhost',
    database,
    password,
    port,
    connectionTimeoutMillis: 3000
  });
  await client.connect();
  return client;
}

async function run() {
  console.log('====================================================');
  console.log('       BioMaxxx PostgreSQL Setup Assistant         ');
  console.log('====================================================\n');

  // Check if .env already has password
  let existingPassword = '';
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    const match = envContent.match(/POSTGRES_PASSWORD=(.*)/);
    if (match && match[1]) {
      existingPassword = match[1].trim();
    }
  }

  // Allow password from CLI arg or prompt
  let password = process.argv[2] || existingPassword;
  if (!password) {
    password = await askQuestion('Enter your PostgreSQL "postgres" superuser password: ');
  }

  // Determine port: Detected 1512 on this system, standard is 5432
  let portsToTry = [1512, 5432];
  let client = null;
  let activePort = null;

  for (const port of portsToTry) {
    try {
      console.log(`Checking PostgreSQL connection on port ${port}...`);
      client = await tryConnect('postgres', password, port, 'postgres');
      activePort = port;
      console.log(`Connected successfully to PostgreSQL on port ${port}!\n`);
      break;
    } catch (err) {
      if (err.code === '28P01') {
        console.error('\n[ERROR] Incorrect password for user "postgres". Please verify and try again.');
        process.exit(1);
      }
      // Connection refused or wrong port, continue to next port
    }
  }

  if (!client) {
    console.error('\n[ERROR] Could not connect to PostgreSQL on ports 1512 or 5432.');
    console.error('Please ensure the PostgreSQL Windows service is running.');
    process.exit(1);
  }

  try {
    // 1. Create database biomaxxx if not exists
    console.log('Checking for database "biomaxxx"...');
    const checkDb = await client.query("SELECT 1 FROM pg_database WHERE datname = 'biomaxxx'");
    if (checkDb.rows.length === 0) {
      console.log('Creating database "biomaxxx"...');
      await client.query('CREATE DATABASE biomaxxx');
      console.log('Database "biomaxxx" created successfully.');
    } else {
      console.log('Database "biomaxxx" already exists.');
    }
    await client.end();

    // 2. Connect to biomaxxx database to apply schema
    console.log('\nApplying schema to "biomaxxx" database...');
    const dbClient = await tryConnect('postgres', password, activePort, 'biomaxxx');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await dbClient.query(schemaSql);
      console.log('Schema tables created successfully.');
    }

    // Ensure default user exists
    await dbClient.query(`
      INSERT INTO users (id, name, email)
      VALUES (1, 'BioMaxxx User', 'user@biomaxxx.local')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Default user seeded successfully (User ID: 1).');

    await dbClient.end();

    // 3. Create or update .env file
    const envPath = path.join(__dirname, '.env');
    const envData = `# BioMaxxx Configuration
PORT=5000
FRONTEND_PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${password}
POSTGRES_DB=biomaxxx
POSTGRES_PORT=${activePort}
DATABASE_URL=postgres://postgres:${encodeURIComponent(password)}@localhost:${activePort}/biomaxxx
`;
    fs.writeFileSync(envPath, envData, 'utf-8');
    console.log('\nUpdated .env file with active PostgreSQL connection string.');

    console.log('\n====================================================');
    console.log('🎉 Setup complete! PostgreSQL is ready for BioMaxxx.');
    console.log('You can now run:');
    console.log('  run-local.bat');
    console.log('====================================================\n');
  } catch (err) {
    console.error('[ERROR] Failed setting up database:', err.message);
  } finally {
    rl.close();
  }
}

run();
