import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const needsVp = searchParams.get('needsVpAttention')

  const where: any = {}
  if (projectId) where.projectId = parseInt(projectId)
  if (needsVp === 'true') where.needsVpAttention = true

  const issues = await prisma.issue.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, code: true, division: { select: { code: true, colorHex: true } } } },
    },
    orderBy: [{ needsVpAttention: 'desc' }, { severity: 'desc' }],
  })
  return NextResponse.json(issues)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const issue = await prisma.issue.create({ data: body })
  return NextResponse.json(issue, { status: 201 })
}
