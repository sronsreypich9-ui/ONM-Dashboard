import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { id: _id, project, createdAt, updatedAt, ...data } = body
  const issue = await prisma.issue.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(issue)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.issue.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
