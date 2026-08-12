import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meeting = await prisma.meeting.findUnique({
    where: { id: parseInt(id) },
    include: { actionItems: true, project: { include: { division: true } }, division: true },
  })
  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(meeting)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { id: _id, project, actionItems, createdAt, updatedAt, ...data } = body
  const meeting = await prisma.meeting.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(meeting)
}

// PATCH — fast partial update for auto-save (content, title, attendees, tags, etc.)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  // Only allow safe fields — never overwrite relational data
  const allowed = ['title', 'content', 'summary', 'decisions', 'attendees', 'tags', 'meetingDate']
  const data: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }
  const meeting = await prisma.meeting.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(meeting)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.meeting.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}

