import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'dev.db')

const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma  = new PrismaClient({ adapter })

const codesToDelete = [
  'ESS-001', 'ESS-002', 'ESS-003',
  'WPD-001',
  'GSS-001',
  'HFO-001', 'HFO-002', 'HFO-003', 'HFO-004', 'HFO-005'
]

console.log('🗑️  Deleting 10 sample non-OPV projects…\n')

const deleted = await prisma.project.deleteMany({
  where: {
    code: { in: codesToDelete }
  }
})

console.log(`✅  Deleted ${deleted.count} projects.`)

// Verify remaining projects
const remaining = await prisma.project.findMany({
  select: { id: true, code: true, name: true, division: { select: { code: true } } },
  orderBy: { code: 'asc' }
})

console.log(`\n📋  Remaining Projects (${remaining.length} total):`)
remaining.forEach(p => console.log(`  [${p.division.code}] ${p.code}: ${p.name}`))

await prisma.$disconnect()
