import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id: parseInt(id) },
    include: {
      division: true,
      meetings: {
        include: { actionItems: { orderBy: { dueDate: 'asc' } } },
        orderBy: { meetingDate: 'desc' },
      },
      issues: { orderBy: [{ needsVpAttention: 'desc' }, { severity: 'desc' }] },
      actionItems: { orderBy: [{ status: 'asc' }, { dueDate: 'asc' }] },
      kpis: { include: { readings: { orderBy: { period: 'asc' } } } },
    },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { id: _id, divisionId, division, meetings, issues, actionItems, kpis, createdAt, updatedAt, ...data } = body
  const project = await prisma.project.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(project)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.project.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
