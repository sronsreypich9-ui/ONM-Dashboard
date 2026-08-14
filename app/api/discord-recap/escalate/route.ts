import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { recapId, issueTitle, severity, owner, description, projectId, type } = await req.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Please select a project to associate this issue with.' }, { status: 400 })
    }

    if (type === 'actionItem') {
      const newAction = await prisma.actionItem.create({
        data: {
          projectId: parseInt(projectId),
          description: issueTitle || description || 'Discord action item',
          owner: owner || 'Unassigned',
          dueDate: new Date(Date.now() + 5 * 86400000),
          status: 'Open',
        },
      })
      return NextResponse.json({ message: 'Action item created successfully!', actionItem: newAction })
    }

    // Default: Create Issue
    const newIssue = await prisma.issue.create({
      data: {
        projectId: parseInt(projectId),
        title: issueTitle || 'Escalated Discord Issue',
        description: description || 'Escalated from Discord discussion thread.',
        severity: severity || 'High',
        status: 'Open',
        owner: owner || 'Unassigned',
        needsVpAttention: severity === 'Critical' || severity === 'High',
      },
    })

    // Update project flags if critical
    if (severity === 'Critical' || severity === 'High') {
      await prisma.project.update({
        where: { id: parseInt(projectId) },
        data: {
          needsVpAttention: true,
          statusRag: severity === 'Critical' ? 'Red' : 'Yellow',
        },
      })
    }

    return NextResponse.json({ message: 'Issue escalated to official project register!', issue: newIssue })
  } catch (error) {
    console.error('Error escalating Discord issue:', error)
    return NextResponse.json({ error: 'Failed to escalate issue' }, { status: 500 })
  }
}
