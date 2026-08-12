import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const kpis = await prisma.kPI.findMany({
    where: projectId ? { projectId: parseInt(projectId) } : {},
    include: { readings: { orderBy: { period: 'asc' } } },
  })
  return NextResponse.json(kpis)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const kpi = await prisma.kPI.create({ data: body })
  return NextResponse.json(kpi, { status: 201 })
}
