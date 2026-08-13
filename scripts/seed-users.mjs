import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const adapter = new PrismaLibSql(libsql)
const prisma  = new PrismaClient({ adapter })

const users = [
  {
    name:     'VP Admin',
    email:    'admin@onm.com',
    password: 'Admin@1234',
    role:     'Admin',
  },
  {
    name:     'Editor User',
    email:    'editor@onm.com',
    password: 'Editor@1234',
    role:     'Editor',
  },
  {
    name:     'Viewer User',
    email:    'viewer@onm.com',
    password: 'Viewer@1234',
    role:     'Viewer',
  },
]

console.log('🔐  Seeding user accounts…\n')

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 12)

  const existing = await prisma.user.findUnique({ where: { email: u.email } })
  if (existing) {
    await prisma.user.update({
      where: { email: u.email },
      data:  { name: u.name, passwordHash: hash, role: u.role },
    })
    console.log(`  ♻️  Updated:  ${u.email}  (${u.role})`)
  } else {
    await prisma.user.create({
      data: {
        name:         u.name,
        email:        u.email,
        passwordHash: hash,
        role:         u.role,
      },
    })
    console.log(`  ✅  Created: ${u.email}  (${u.role})`)
  }
}

console.log('\n📋  All users:')
const all = await prisma.user.findMany({ select: { email: true, name: true, role: true } })
for (const u of all) console.log(`     ${u.email.padEnd(28)} ${u.name.padEnd(20)} ${u.role}`)

console.log('\n✅  Done.\n')
await prisma.$disconnect()
