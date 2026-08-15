import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

async function addTannUser(url, token, label) {
  console.log(`\n🔑 Adding VP. Tann Tourthang to [${label}]…`)
  const adapter = new PrismaLibSql({ url, authToken: token })
  const prisma = new PrismaClient({ adapter })

  try {
    const pwHash = await bcrypt.hash('1108', 10)
    const user = await prisma.user.upsert({
      where: { email: 'vptanntourthang@onm.com' },
      update: { name: 'VP. Tann Tourthang', role: 'Viewer', passwordHash: pwHash },
      create: { name: 'VP. Tann Tourthang', email: 'vptanntourthang@onm.com', role: 'Viewer', passwordHash: pwHash },
    })
    console.log(`✅ Created/Updated user: ${user.name} (${user.email}) - Role: ${user.role}`)
  } catch (err) {
    console.error(`Error adding user in ${label}:`, err)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  await addTannUser(process.env.TURSO_DATABASE_URL || 'file:./dev.db', process.env.TURSO_AUTH_TOKEN, 'Turso Primary DB')
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')) {
    await addTannUser('file:./dev.db', undefined, 'Local dev.db')
  }
}

main()
