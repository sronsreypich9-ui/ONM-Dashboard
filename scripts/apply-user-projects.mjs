// apply-user-projects.mjs — applies official projects for ESS, GSS, WPD, HFO directly to Turso
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

const projectsToUpsert = [
  // ── ESS (Energy Storage System) ───────────────────────────────────────────
  {
    divCode: 'ESS',
    code: 'ESS-001',
    name: 'SNTL 200MW/400MWH BESS',
    capacityMw: 200,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'O&M Routine Inspection',
    needsVpAttention: 0,
  },
  {
    divCode: 'ESS',
    code: 'ESS-002',
    name: 'SNTL 300MW/600MWH BESS',
    capacityMw: 300,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'BMS Calibration Test',
    needsVpAttention: 0,
  },
  {
    divCode: 'ESS',
    code: 'ESS-003',
    name: 'SNTK 500MW/1000MWH BESS',
    capacityMw: 500,
    statusRag: 'Yellow',
    percentComplete: 75,
    currentPhase: 'Construction & Testing',
    nextMilestone: 'Grid Integration Test',
    needsVpAttention: 1,
  },

  // ── GSS (Grid & Substation) ──────────────────────────────────────────────
  {
    divCode: 'GSS',
    code: 'GSS-001',
    name: 'GSS Patrol and Maintenance RTK-TBM 230kV',
    capacityMw: null,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'Relay Coordination Study',
    needsVpAttention: 0,
  },
  {
    divCode: 'GSS',
    code: 'GSS-002',
    name: 'Patrol and Maintenance CAM-LAOS 500KV',
    capacityMw: null,
    statusRag: 'Yellow',
    percentComplete: 80,
    currentPhase: 'Construction & Testing',
    nextMilestone: 'Energization Test',
    needsVpAttention: 1,
  },

  // ── WPD (Wind Power) ─────────────────────────────────────────────────────
  {
    divCode: 'WPD',
    code: 'WPD-001',
    name: 'Wind 75MW Phase I',
    capacityMw: 75,
    statusRag: 'Yellow',
    percentComplete: 70,
    currentPhase: 'Construction & Testing',
    nextMilestone: 'Turbine Installation Complete',
    needsVpAttention: 1,
  },
  {
    divCode: 'WPD',
    code: 'WPD-002',
    name: 'Wind 75MW Phase II',
    capacityMw: 75,
    statusRag: 'Yellow',
    percentComplete: 60,
    currentPhase: 'Construction & Testing',
    nextMilestone: 'Foundation Piling Complete',
    needsVpAttention: 0,
  },

  // ── HFO (HFO & LFO) ──────────────────────────────────────────────────────
  {
    divCode: 'HFO',
    code: 'HFO-001',
    name: 'SNTA 23MW Power Plant',
    capacityMw: 23,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'Annual Overhaul Audit',
    needsVpAttention: 0,
  },
  {
    divCode: 'HFO',
    code: 'HFO-002',
    name: 'C2 35MW Power Plan Plant',
    capacityMw: 35,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'Routine Maintenance',
    needsVpAttention: 0,
  },
  {
    divCode: 'HFO',
    code: 'HFO-003',
    name: 'C7 400MW Power Plan Plant',
    capacityMw: 400,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'Capacity Test',
    needsVpAttention: 0,
  },
  {
    divCode: 'HFO',
    code: 'HFO-004',
    name: 'EDC-C6 18MW Supply Spare',
    capacityMw: 18,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'Spare Inventory Audit',
    needsVpAttention: 0,
  },
  {
    divCode: 'HFO',
    code: 'HFO-005',
    name: 'EDC-SHV 5.6MW Supply Spare',
    capacityMw: 5.6,
    statusRag: 'Green',
    percentComplete: 100,
    currentPhase: 'COD Operations',
    nextMilestone: 'Compliance Review',
    needsVpAttention: 0,
  },
]

async function main() {
  console.log('🚀 Updating projects for ESS, GSS, WPD, HFO in Turso...\n')

  // Update HFO division name to "HFO & LFO Division"
  await db.execute({
    sql: `UPDATE "Division" SET "name" = ? WHERE "code" = ?`,
    args: ['HFO & LFO Division', 'HFO'],
  })
  console.log('  ✅ Updated HFO division name to: HFO & LFO Division')

  // Fetch divisions mapping
  const res = await db.execute(`SELECT id, code FROM "Division"`)
  const divMap = new Map(res.rows.map(r => [r.code, r.id]))

  const now = new Date().toISOString()
  const msd = new Date(Date.now() + 60 * 86400000).toISOString()

  for (const p of projectsToUpsert) {
    const divisionId = divMap.get(p.divCode)
    if (!divisionId) {
      console.log(`  ❌ Division not found: ${p.divCode}`)
      continue
    }

    // Check if project exists by code
    const existing = await db.execute({
      sql: `SELECT id FROM "Project" WHERE "code" = ?`,
      args: [p.code],
    })

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE "Project" SET 
          "divisionId" = ?, "name" = ?, "capacityMw" = ?, "statusRag" = ?, 
          "percentComplete" = ?, "currentPhase" = ?, "nextMilestone" = ?, 
          "nextMilestoneDate" = ?, "needsVpAttention" = ?, "updatedAt" = ?
          WHERE "code" = ?`,
        args: [divisionId, p.name, p.capacityMw, p.statusRag, p.percentComplete, p.currentPhase, p.nextMilestone, msd, p.needsVpAttention, now, p.code],
      })
      console.log(`  ♻️  Updated [${p.divCode}] ${p.code}: ${p.name}`)
    } else {
      await db.execute({
        sql: `INSERT INTO "Project" 
          ("divisionId", "code", "name", "capacityMw", "statusRag", "percentComplete", "currentPhase", "nextMilestone", "nextMilestoneDate", "needsVpAttention", "createdAt", "updatedAt")
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [divisionId, p.code, p.name, p.capacityMw, p.statusRag, p.percentComplete, p.currentPhase, p.nextMilestone, msd, p.needsVpAttention, now, now],
      })
      console.log(`  ✨  Created [${p.divCode}] ${p.code}: ${p.name}`)
    }
  }

  const countRes = await db.execute(`SELECT COUNT(*) as total FROM "Project"`)
  console.log(`\n✅ Done! Total projects in portfolio: ${countRes.rows[0].total}`)
}

main().catch(e => { console.error(e); process.exit(1) })
