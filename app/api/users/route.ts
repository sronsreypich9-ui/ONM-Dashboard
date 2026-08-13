import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/users — List all registered users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/users — Create a new user with Username, Password, and Role
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, username, password, role } = body

    const userNameInput = (username || name || '').trim()
    if (!userNameInput || !password) {
      return NextResponse.json({ error: 'User Name and Password are required' }, { status: 400 })
    }

    const assignedRole = ['Admin', 'Editor', 'Viewer'].includes(role) ? role : 'Viewer'
    const passwordHash = await bcrypt.hash(password, 10)
    const emailKey = userNameInput.toLowerCase().replace(/\s+/g, '') + '@onm.com'

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { name: userNameInput },
          { email: emailKey },
        ],
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'A user with this User Name already exists' }, { status: 400 })
    }

    const newUser = await prisma.user.create({
      data: {
        name: userNameInput,
        email: emailKey,
        passwordHash,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
