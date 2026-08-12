import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { id: _id, project, meeting, createdAt, updatedAt, ...data } = body
  const item = await prisma.actionItem.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.actionItem.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
