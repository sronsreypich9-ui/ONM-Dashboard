// update-admin-user.mjs — updates admin user account to Sron Sreypich in Turso database
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx)
  let val = trimmed.slice(idx + 1)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[key] = val
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  console.log('👤 Updating Administrator Account in Turso...')
  const now = new Date().toISOString()
  const passHash = await bcrypt.hash('Admin@1234', 10)

  // Update existing admin@onm.com or insert
  await db.execute({
    sql: `UPDATE "User" SET "name" = ?, "passwordHash" = ?, "role" = ? WHERE "email" = ?`,
    args: ['Sron Sreypich', passHash, 'Admin', 'admin@onm.com'],
  })

  // Also ensure sreypich@onm.com exists
  await db.execute({
    sql: `INSERT OR REPLACE INTO "User" ("email", "name", "passwordHash", "role", "createdAt", "updatedAt")
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ['sreypich@onm.com', 'Sron Sreypich', passHash, 'Admin', now, now],
  })

  console.log('  ✅ Admin user set: Sron Sreypich (sreypich@onm.com & admin@onm.com)')
}

main().catch(e => { console.error(e); process.exit(1) })
