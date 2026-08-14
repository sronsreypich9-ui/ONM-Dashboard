import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL || 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany()
  console.log(`Found ${users.length} users in database:`)
  for (const u of users) {
    const isAdminPw = await bcrypt.compare('Admin@1234', u.passwordHash)
    const isEditorPw = await bcrypt.compare('Editor@1234', u.passwordHash)
    const isViewerPw = await bcrypt.compare('Viewer@1234', u.passwordHash)
    console.log(`- ID: ${u.id} | Name: "${u.name}" | Email: "${u.email}" | Role: ${u.role}`)
    console.log(`  Pw match Admin@1234: ${isAdminPw} | Editor@1234: ${isEditorPw} | Viewer@1234: ${isViewerPw}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
