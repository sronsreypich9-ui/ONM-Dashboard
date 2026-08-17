import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const divisionId = searchParams.get('divisionId')
  const isGeneral = searchParams.get('general')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const q = searchParams.get('q')

  const where: any = {}
  if (isGeneral === 'true' || projectId === 'null' || projectId === 'general') {
    where.projectId = null
  } else if (projectId) {
    where.projectId = parseInt(projectId)
  }

  if (divisionId) {
    where.divisionId = parseInt(divisionId)
    if (!projectId) {
      where.projectId = null
    }
  }

  if (from || to) {
    where.meetingDate = {}
    if (from) where.meetingDate.gte = new Date(from)
    if (to) where.meetingDate.lte = new Date(to)
  }

  if (q) {
    where.OR = [
      { title:     { contains: q } },
      { summary:   { contains: q } },
      { content:   { contains: q } },
      { decisions: { contains: q } },
    ]
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, code: true, division: { select: { id: true, code: true, colorHex: true } } } },
      division: { select: { id: true, code: true, name: true, colorHex: true } },
      actionItems: { orderBy: { dueDate: 'asc' } },
    },
    orderBy: { meetingDate: 'desc' },
  })
  return NextResponse.json(meetings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { actionItems, projectId, divisionId, ...meetingData } = body
  const parsedProjId = projectId ? parseInt(projectId) : null
  const parsedDivId  = divisionId ? parseInt(divisionId) : null

  const meeting = await prisma.meeting.create({
    data: {
      ...meetingData,
      projectId: parsedProjId,
      divisionId: parsedDivId,
      actionItems: actionItems
        ? { create: actionItems.map((ai: any) => ({ ...ai, projectId: parsedProjId })) }
        : undefined,
    },
    include: {
      project: { select: { id: true, name: true, code: true, division: { select: { id: true, code: true, colorHex: true } } } },
      division: { select: { id: true, code: true, name: true, colorHex: true } },
      actionItems: true,
    },
  })
  return NextResponse.json(meeting, { status: 201 })
}
