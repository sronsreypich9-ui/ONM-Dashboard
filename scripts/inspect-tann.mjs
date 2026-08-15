import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function inspectDb(url, token, label) {
  console.log(`\n🔍 Inspecting Database Users in [${label}]…`)
  const adapter = new PrismaLibSql({ url, authToken: token })
  const prisma = new PrismaClient({ adapter })

  try {
    const users = await prisma.user.findMany()
    console.log(`Total users: ${users.length}`)
    for (const u of users) {
      console.log(`- ID: ${u.id} | Name: "${u.name}" | Email: "${u.email}" | Role: "${u.role}"`)
    }
  } catch (err) {
    console.error(`Error in ${label}:`, err)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  await inspectDb(process.env.TURSO_DATABASE_URL || 'file:./dev.db', process.env.TURSO_AUTH_TOKEN, 'Turso/Primary DB')
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')) {
    await inspectDb('file:./dev.db', undefined, 'Local dev.db')
  }
}

main()
