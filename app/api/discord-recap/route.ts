import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const alertLevel = searchParams.get('alertLevel')
    const projectId  = searchParams.get('projectId')

    const where: any = {}
    if (alertLevel && alertLevel !== 'All') {
      where.alertLevel = alertLevel
    }
    if (projectId) {
      where.projectId = parseInt(projectId)
    }

    const recaps = await prisma.discordRecap.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        division: { select: { id: true, name: true, code: true, colorHex: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(recaps)
  } catch (error) {
    console.error('Error fetching Discord recaps:', error)
    return NextResponse.json({ error: 'Failed to fetch Discord recaps' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { channelName, threadTitle, threadUrl, rawMessages, executiveSummary, alertLevel, detectedIssues, actionItems, projectId, divisionId, createdBy } = body

    if (!channelName || !threadTitle || !rawMessages) {
      return NextResponse.json({ error: 'channelName, threadTitle, and rawMessages are required' }, { status: 400 })
    }

    const newRecap = await prisma.discordRecap.create({
      data: {
        channelName,
        threadTitle,
        threadUrl: threadUrl || null,
        rawMessages,
        executiveSummary: executiveSummary || 'No summary generated.',
        alertLevel: alertLevel || 'Normal',
        detectedIssues: typeof detectedIssues === 'string' ? detectedIssues : JSON.stringify(detectedIssues || []),
        actionItems: typeof actionItems === 'string' ? actionItems : JSON.stringify(actionItems || []),
        projectId: projectId ? parseInt(projectId) : null,
        divisionId: divisionId ? parseInt(divisionId) : null,
        createdBy: createdBy || 'Discord AI Assistant',
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        division: { select: { id: true, name: true, code: true, colorHex: true } },
      },
    })

    return NextResponse.json(newRecap, { status: 201 })
  } catch (error) {
    console.error('Error creating Discord recap:', error)
    return NextResponse.json({ error: 'Failed to create Discord recap' }, { status: 500 })
  }
}
