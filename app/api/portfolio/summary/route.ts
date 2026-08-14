import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [projects, issues, actionItems] = await Promise.all([
      prisma.project.findMany({
        include: { division: true },
      }),
      prisma.issue.findMany({ where: { status: { not: 'Resolved' } } }),
      prisma.actionItem.findMany({ where: { status: { not: 'Done' } } }),
    ])

    const total = projects.length
    const byRag = {
      Green:  projects.filter((p) => p.statusRag === 'Green').length,
      Yellow: projects.filter((p) => p.statusRag === 'Yellow').length,
      Red:    projects.filter((p) => p.statusRag === 'Red').length,
    }

    const highSeverityIssues = issues.filter(
      (i) => i.severity === 'High' || i.severity === 'Critical'
    ).length

    const now = new Date()
    const overdueActions = actionItems.filter(
      (a) => new Date(a.dueDate) < now && a.status !== 'Done'
    ).length

    const vpAttentionProjects = projects.filter((p) => p.needsVpAttention)

    // Total installed capacity (MW) across all projects
    const totalCapacityMw = projects.reduce(
      (sum, p) => sum + (p.capacityMw ?? 0), 0
    )

    // COD Operating projects (100% complete)
    const codOperatingCount = projects.filter(
      (p) => p.currentPhase === 'COD Operations' || p.percentComplete === 100
    ).length

    // Under Construction count
    const underConstructionCount = projects.filter(
      (p) => p.percentComplete < 100
    ).length

    // Group by division
    const divisionMap: Record<number, { divisionId: number; count: number; rags: string[] }> = {}
    for (const p of projects) {
      if (!divisionMap[p.divisionId]) {
        divisionMap[p.divisionId] = { divisionId: p.divisionId, count: 0, rags: [] }
      }
      divisionMap[p.divisionId].count++
      divisionMap[p.divisionId].rags.push(p.statusRag)
    }

    return NextResponse.json(
      {
        total,
        byRag,
        highSeverityIssues,
        overdueActions,
        vpAttentionProjects,
        divisionSummary: Object.values(divisionMap),
        totalCapacityMw,
        codOperatingCount,
        underConstructionCount,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
