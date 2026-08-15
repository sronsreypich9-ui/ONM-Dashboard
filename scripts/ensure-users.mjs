import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

async function ensureUsers(dbUrl, token, label) {
  console.log(`\n🔑 Syncing User Credentials for ${label}…`)
  const adapter = new PrismaLibSql({ url: dbUrl, authToken: token })
  const prisma = new PrismaClient({ adapter })

  try {
    const adminHash = await bcrypt.hash('1108', 10)

    // Remove non-admin user accounts
    await prisma.user.deleteMany({
      where: {
        email: { in: ['editor@onm.com', 'viewer@onm.com', 'vp@onm-energy.com'] },
      },
    })

    // Admin user: Sron Sreypich (admin@onm.com)
    await prisma.user.upsert({
      where: { email: 'admin@onm.com' },
      update: { name: 'Sron Sreypich', role: 'Admin', passwordHash: adminHash },
      create: { name: 'Sron Sreypich', email: 'admin@onm.com', role: 'Admin', passwordHash: adminHash },
    })

    console.log(`✅ ${label} User Accounts Successfully Synced!`)
  } catch (err) {
    console.error(`❌ Failed syncing users for ${label}:`, err)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  await ensureUsers(process.env.TURSO_DATABASE_URL || 'file:./dev.db', process.env.TURSO_AUTH_TOKEN, 'Primary Database')
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')) {
    await ensureUsers('file:./dev.db', undefined, 'Local dev.db Fallback')
  }
}

main()
