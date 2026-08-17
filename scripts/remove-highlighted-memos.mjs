import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function removeHighlightedMemos(url, token, label) {
  console.log(`\n🗑️ Inspecting & Removing Highlighted Memos in [${label}]…`)
  const adapter = new PrismaLibSql({ url, authToken: token })
  const prisma = new PrismaClient({ adapter })

  try {
    const titlesToRemove = [
      'SNTU 350MW — Transformer Delivery & Substation Milestone',
      'SNTR 80MW Thmart Pong — Monthly O&M Performance Review',
      'SNTX 30MW — Construction Delay & Site Piling Review',
    ]

    for (const title of titlesToRemove) {
      const match = await prisma.meeting.findFirst({
        where: { title: { contains: title.slice(0, 15) } },
      })

      if (match) {
        // First delete action items
        await prisma.actionItem.deleteMany({ where: { meetingId: match.id } })
        // Then delete meeting
        await prisma.meeting.delete({ where: { id: match.id } })
        console.log(`✅ Deleted meeting ID ${match.id}: "${match.title}"`)
      } else {
        console.log(`ℹ️ Meeting not found (already deleted): "${title}"`)
      }
    }
  } catch (err) {
    console.error(`Error in ${label}:`, err)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  await removeHighlightedMemos(process.env.TURSO_DATABASE_URL || 'file:./dev.db', process.env.TURSO_AUTH_TOKEN, 'Turso Primary DB')
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')) {
    await removeHighlightedMemos('file:./dev.db', undefined, 'Local dev.db')
  }
}

main()
