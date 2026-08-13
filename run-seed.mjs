// run-seed.mjs — loads .env then calls the seed
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually
try {
  const envFile = readFileSync(resolve(__dirname, '.env'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx)
    let val = trimmed.slice(idx + 1)
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    process.env[key] = val
  }
  console.log('✅ .env loaded')
  console.log('   TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL?.slice(0, 50) + '...')
} catch (e) {
  console.error('Failed to load .env:', e.message)
}

// Now run seed
await import('./prisma/seed.ts')
