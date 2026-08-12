import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const divisionId = searchParams.get('divisionId')
  const rag = searchParams.get('rag')
  const search = searchParams.get('q')

  const where: any = {}
  if (divisionId) where.divisionId = parseInt(divisionId)
  if (rag) where.statusRag = rag
  if (search) where.name = { contains: search }

  const projects = await prisma.project.findMany({
    where,
    include: {
      division: { select: { id: true, code: true, name: true, colorHex: true } },
      issues: { where: { status: { not: 'Resolved' } }, select: { id: true, severity: true, needsVpAttention: true } },
      actionItems: { where: { status: { not: 'Done' } }, select: { id: true, status: true, dueDate: true } },
      kpis: { take: 1, include: { readings: { orderBy: { period: 'desc' }, take: 1 } } },
    },
    orderBy: [{ divisionId: 'asc' }, { code: 'asc' }],
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await prisma.project.create({ data: body })
  return NextResponse.json(project, { status: 201 })
}
