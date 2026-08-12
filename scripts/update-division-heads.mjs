import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'dev.db')

const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

const updates = [
  { code: 'OPV', head: 'Sak Sereyvuth', title: 'Senior Director' },
  { code: 'ESS', head: 'Suom Vireak',   title: 'Director' },
  { code: 'WPD', head: 'Suom Vireak',   title: 'Director' },
  { code: 'GSS', head: 'Tann Slengdy',  title: 'Director' },
  { code: 'HFO', head: 'Tann Slengdy',  title: 'Director' },
]

for (const u of updates) {
  const div = await prisma.division.findFirst({ where: { code: u.code } })
  if (!div) { console.log('Not found:', u.code); continue }
  await prisma.division.update({
    where: { id: div.id },
    data: { leadName: `${u.head} · ${u.title}` },
  })
  console.log(`✅  ${u.code}  →  ${u.head} (${u.title})`)
}

const divs = await prisma.division.findMany({ select: { code: true, headName: true } })
console.log('\nAll divisions:', JSON.stringify(divs, null, 2))
await prisma.$disconnect()
