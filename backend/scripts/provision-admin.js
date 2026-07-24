'use strict';

const pool = require('../config/database');
const { hashPassword } = require('../lib/passwords');

async function provisionAdmin() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') throw new Error('Explicit bootstrap acknowledgement is required');
  const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const name = String(process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator').trim();
  if (!email.includes('@') || typeof password !== 'string' || password.length < 12) throw new Error('A valid admin email and 12+ character password are required');
  await pool.query(
    `INSERT INTO users(email,password,name,role) VALUES($1,$2,$3,'admin')
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin'`,
    [email, hashPassword(password), name],
  );
}

provisionAdmin()
  .catch((error) => { console.error(`Admin provisioning failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => pool.end());
