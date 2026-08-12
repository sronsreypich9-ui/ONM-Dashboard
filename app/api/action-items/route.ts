import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const overdue = searchParams.get('overdue')

  const where: any = {}
  if (projectId) where.projectId = parseInt(projectId)
  if (status) where.status = status
  if (overdue === 'true') {
    where.dueDate = { lt: new Date() }
    where.status = { not: 'Done' }
  }

  const items = await prisma.actionItem.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, code: true, division: { select: { code: true, colorHex: true } } } },
      meeting: { select: { id: true, title: true } },
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.actionItem.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}
