// update-heads.mjs — updates division lead names & titles directly in Turso
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

const updates = [
  { code: 'OPV', leadName: 'Sak Sereyvuth · Senior Director' },
  { code: 'ESS', leadName: 'Suom Vireak · Director' },
  { code: 'WPD', leadName: 'Suom Vireak · Director' },
  { code: 'GSS', leadName: 'Tann Slengdy · Director' },
  { code: 'HFO', leadName: 'Tann Slengdy · Director' },
]

async function main() {
  console.log('🔄 Updating Division Heads and Positions in Turso...')
  for (const u of updates) {
    await db.execute({
      sql: `UPDATE "Division" SET "leadName" = ? WHERE "code" = ?`,
      args: [u.leadName, u.code],
    })
    console.log(`  ✅ ${u.code}  →  ${u.leadName}`)
  }
  console.log('🎉 Division Heads updated successfully!')
}

main().catch(e => { console.error(e); process.exit(1) })
