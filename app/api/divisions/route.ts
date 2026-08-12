import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const divisions = await prisma.division.findMany({
    include: {
      projects: {
        select: { id: true, statusRag: true, needsVpAttention: true, percentComplete: true },
      },
    },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(divisions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const division = await prisma.division.create({ data: body })
  return NextResponse.json(division, { status: 201 })
}
