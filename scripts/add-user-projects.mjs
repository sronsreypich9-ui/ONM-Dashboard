import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const adapter = new PrismaLibSql(libsql)
const prisma  = new PrismaClient({ adapter })

const newProjects = [
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
    needsVpAttention: false,
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
    needsVpAttention: false,
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
    needsVpAttention: true,
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
    needsVpAttention: false,
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
    needsVpAttention: true,
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
    needsVpAttention: true,
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
    needsVpAttention: false,
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
    needsVpAttention: false,
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
    needsVpAttention: false,
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
    needsVpAttention: false,
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
    needsVpAttention: false,
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
    needsVpAttention: false,
  },
]

async function main() {
  console.log('🚀  Updating projects for ESS, GSS, WPD, HFO…\n')

  // Update HFO division name if needed
  const hfoDiv = await prisma.division.findFirst({ where: { code: 'HFO' } })
  if (hfoDiv) {
    await prisma.division.update({
      where: { id: hfoDiv.id },
      data: { name: 'HFO & LFO Division' },
    })
  }

  const divisions = await prisma.division.findMany()
  const divMap = new Map(divisions.map((d) => [d.code, d.id]))

  for (const p of newProjects) {
    const divisionId = divMap.get(p.divCode)
    if (!divisionId) {
      console.log(`❌ Division not found: ${p.divCode}`)
      continue
    }

    const existing = await prisma.project.findFirst({ where: { code: p.code } })
    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          divisionId,
          capacityMw: p.capacityMw,
          statusRag: p.statusRag,
          percentComplete: p.percentComplete,
          currentPhase: p.currentPhase,
          nextMilestone: p.nextMilestone,
          nextMilestoneDate: new Date(Date.now() + 60 * 86400000),
          needsVpAttention: p.needsVpAttention,
        },
      })
      console.log(`  ♻️  Updated: [${p.divCode}] ${p.code}: ${p.name} (${p.currentPhase})`)
    } else {
      await prisma.project.create({
        data: {
          code: p.code,
          name: p.name,
          divisionId,
          capacityMw: p.capacityMw,
          statusRag: p.statusRag,
          percentComplete: p.percentComplete,
          currentPhase: p.currentPhase,
          nextMilestone: p.nextMilestone,
          nextMilestoneDate: new Date(Date.now() + 60 * 86400000),
          needsVpAttention: p.needsVpAttention,
        },
      })
      console.log(`  ✨  Created: [${p.divCode}] ${p.code}: ${p.name} (${p.currentPhase})`)
    }
  }

  const total = await prisma.project.count()
  console.log(`\n✅  Done. Total projects in portfolio: ${total}`)

  const summary = await prisma.project.groupBy({
    by: ['divisionId', 'statusRag'],
    _count: true,
  })
  console.log('\n📊  Portfolio Breakdown by Division & RAG Status:')
  for (const div of divisions) {
    const projs = await prisma.project.findMany({ where: { divisionId: div.id } })
    console.log(`   • ${div.code} (${div.name}): ${projs.length} projects`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
