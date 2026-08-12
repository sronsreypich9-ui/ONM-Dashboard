import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook ingestion endpoint for external feeds (Discord/Slack/daily reports).
 * 
 * Expected payload:
 * {
 *   source: "discord" | "slack" | "email" | "api",
 *   projectCode: string,       // e.g. "OPV-001"
 *   type: "memo" | "issue" | "action_item",
 *   data: {
 *     // For memo:
 *     meetingDate?: string,
 *     title?: string,
 *     summary?: string,
 *     decisions?: string,
 *     attendees?: string[],
 *     // For issue:
 *     issueTitle?: string,
 *     description?: string,
 *     severity?: "Low"|"Med"|"High"|"Critical",
 *     // For action_item:
 *     description?: string,
 *     owner?: string,
 *     dueDate?: string,
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { source, projectCode, type, data } = body

    if (!projectCode || !type || !data) {
      return NextResponse.json({ error: 'Missing required fields: projectCode, type, data' }, { status: 400 })
    }

    // Import prisma here to avoid issues in edge runtime
    const { prisma } = await import('@/lib/db')

    const project = await prisma.project.findUnique({ where: { code: projectCode } })
    if (!project) {
      return NextResponse.json({ error: `Project not found: ${projectCode}` }, { status: 404 })
    }

    let result: any = null

    if (type === 'memo') {
      result = await prisma.meeting.create({
        data: {
          projectId: project.id,
          meetingDate: data.meetingDate ? new Date(data.meetingDate) : new Date(),
          title: data.title || `Feed Update — ${new Date().toLocaleDateString()}`,
          attendees: JSON.stringify(data.attendees || []),
          summary: data.summary || '',
          decisions: data.decisions,
          source: source || 'feed',
          createdBy: 'webhook',
        },
      })
    } else if (type === 'issue') {
      result = await prisma.issue.create({
        data: {
          projectId: project.id,
          title: data.issueTitle || data.title || 'Feed Issue',
          description: data.description,
          severity: data.severity || 'Med',
          status: 'Open',
          owner: data.owner,
          needsVpAttention: data.severity === 'Critical' || data.severity === 'High',
        },
      })
    } else if (type === 'action_item') {
      result = await prisma.actionItem.create({
        data: {
          projectId: project.id,
          description: data.description || '',
          owner: data.owner || 'Unassigned',
          dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
          status: 'Open',
        },
      })
    } else {
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true, created: result }, { status: 201 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
