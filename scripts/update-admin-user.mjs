// update-admin-user.mjs — sets Username-based accounts in Turso
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
  console.log('👤 Setting Username-based Administrator & User accounts in Turso...')
  const now = new Date().toISOString()
  const passHash = await bcrypt.hash('Admin@1234', 10)
  const viewerHash = await bcrypt.hash('Viewer@1234', 10)

  // Sron Sreypich (Admin)
  await db.execute({
    sql: `INSERT OR REPLACE INTO "User" ("id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt")
          VALUES (1, 'sronsreypich', 'Sron Sreypich', ?, 'Admin', ?, ?)`,
    args: [passHash, now, now],
  })

  // Viewer User
  await db.execute({
    sql: `INSERT OR REPLACE INTO "User" ("id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt")
          VALUES (2, 'vieweruser', 'Viewer User', ?, 'Viewer', ?, ?)`,
    args: [viewerHash, now, now],
  })

  console.log('  ✅ Username accounts set:')
  console.log('     • Username: Sron Sreypich | Password: Admin@1234  | Role: Admin')
  console.log('     • Username: Viewer User  | Password: Viewer@1234 | Role: Viewer')
}

main().catch(e => { console.error(e); process.exit(1) })
