import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

async function ensureUsers(dbUrl, token, label) {
  console.log(`\n🔑 Syncing User Credentials for ${label}…`)
  const adapter = new PrismaLibSql({ url: dbUrl, authToken: token })
  const prisma = new PrismaClient({ adapter })

  try {
    const adminHash  = await bcrypt.hash('Admin@1234', 10)
    const editorHash = await bcrypt.hash('Editor@1234', 10)
    const viewerHash = await bcrypt.hash('Viewer@1234', 10)

    // Admin user: Sron Sreypich & admin@onm.com
    await prisma.user.upsert({
      where: { email: 'admin@onm.com' },
      update: { name: 'Sron Sreypich', role: 'Admin', passwordHash: adminHash },
      create: { name: 'Sron Sreypich', email: 'admin@onm.com', role: 'Admin', passwordHash: adminHash },
    })

    // Editor user
    await prisma.user.upsert({
      where: { email: 'editor@onm.com' },
      update: { name: 'Editor User', role: 'Editor', passwordHash: editorHash },
      create: { name: 'Editor User', email: 'editor@onm.com', role: 'Editor', passwordHash: editorHash },
    })

    // Viewer user
    await prisma.user.upsert({
      where: { email: 'viewer@onm.com' },
      update: { name: 'Viewer User', role: 'Viewer', passwordHash: viewerHash },
      create: { name: 'Viewer User', email: 'viewer@onm.com', role: 'Viewer', passwordHash: viewerHash },
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
