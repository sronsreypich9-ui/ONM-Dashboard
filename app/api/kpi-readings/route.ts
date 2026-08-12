import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const reading = await prisma.kPIReading.create({ data: body })
  return NextResponse.json(reading, { status: 201 })
}
