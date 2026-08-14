// cleanup-duplicate-users.mjs — cleans up any duplicate users in Turso
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@libsql/client'

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
  console.log('🧹 Cleaning up duplicate user records in Turso...')
  // Keep lowest ID for each name
  await db.execute(`DELETE FROM "User" WHERE id NOT IN (SELECT MIN(id) FROM "User" GROUP BY name)`)
  const res = await db.execute(`SELECT id, name, role FROM "User"`)
  console.log('  ✅ Current Users:', res.rows)
}

main().catch(e => { console.error(e); process.exit(1) })
