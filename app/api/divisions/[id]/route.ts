import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const division = await prisma.division.findUnique({
    where: { id: parseInt(id) },
    include: {
      projects: {
        include: {
          issues: { where: { status: { not: 'Resolved' } } },
          actionItems: { where: { status: { not: 'Done' } } },
          kpis: { include: { readings: { orderBy: { period: 'desc' }, take: 1 } } },
        },
        orderBy: { code: 'asc' },
      },
    },
  })
  if (!division) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(division)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const division = await prisma.division.update({ where: { id: parseInt(id) }, data: body })
  return NextResponse.json(division)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.division.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
