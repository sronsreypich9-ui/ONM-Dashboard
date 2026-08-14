import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { channelName, threadTitle, rawMessages, threadUrl } = await req.json()

    if (!rawMessages || !threadTitle) {
      return NextResponse.json({ error: 'rawMessages and threadTitle are required' }, { status: 400 })
    }

    // 1. Fetch existing projects to match against text
    const projects = await prisma.project.findMany({
      include: { division: true },
    })

    const textLower = (threadTitle + ' ' + rawMessages).toLowerCase()

    // 2. Project & Division Auto-matching
    let matchedProject = projects.find((p) =>
      textLower.includes(p.name.toLowerCase()) || textLower.includes(p.code.toLowerCase())
    )

    if (!matchedProject) {
      // Fallback matching by key terms
      if (textLower.includes('bess') || textLower.includes('storage')) {
        matchedProject = projects.find((p) => p.code.startsWith('ESS'))
      } else if (textLower.includes('wind')) {
        matchedProject = projects.find((p) => p.code.startsWith('WPD'))
      } else if (textLower.includes('substation') || textLower.includes('patrol')) {
        matchedProject = projects.find((p) => p.code.startsWith('GSS'))
      } else if (textLower.includes('power plant') || textLower.includes('hfo')) {
        matchedProject = projects.find((p) => p.code.startsWith('HFO'))
      }
    }

    // 3. Alert Level Detection
    let alertLevel = 'Normal'
    const criticalKeywords = ['fail', 'critical', 'dielectric', 'halt', 'delay 5', 'delay 7', 'delay 10', 'breakdown', 'emergency', 'trip']
    const attentionKeywords = ['drift', 'warning', 'throttle', 'calibration', 'check', 'investigate', 'issue', 'monitor']

    if (criticalKeywords.some((kw) => textLower.includes(kw))) {
      alertLevel = 'Critical'
    } else if (attentionKeywords.some((kw) => textLower.includes(kw))) {
      alertLevel = 'Attention'
    }

    // 4. Summarization Logic
    const lines = rawMessages.split('\n').filter((l: string) => l.trim().length > 0)
    const keyLines = lines.slice(0, 5)

    const summaryBullets = keyLines.map((l: string) => {
      const clean = l.replace(/^\[.*?\]\s*@\w+:\s*/, '').trim()
      return `• ${clean}`
    }).join('\n')

    const executiveSummary = summaryBullets || `• Discussed ${threadTitle} in channel ${channelName || '#general'}.`

    // 5. Detected Issues Extraction
    const detectedIssues: any[] = []
    if (alertLevel === 'Critical') {
      detectedIssues.push({
        title: `${matchedProject?.name || 'Site'} Critical Technical Alert from ${channelName || 'Discord'}`,
        severity: 'Critical',
        owner: matchedProject?.division?.leadName?.split('·')[0].trim() || 'Sak Sereyvuth',
        description: `Automated Discord Bot detection: Critical issue discussed regarding ${threadTitle}.`,
      })
    } else if (alertLevel === 'Attention') {
      detectedIssues.push({
        title: `${matchedProject?.name || 'Site'} Operational Telemetry Attention Needed`,
        severity: 'Med',
        owner: matchedProject?.division?.leadName?.split('·')[0].trim() || 'Suom Vireak',
        description: `Automated Discord Bot detection: Technical drift/attention needed in ${threadTitle}.`,
      })
    }

    // 6. Action Items Extraction
    const actionItems = [
      {
        description: `Review Discord discussion log & verify fix for: ${threadTitle}`,
        owner: matchedProject?.division?.leadName?.split('·')[0].trim() || 'Sak Sereyvuth',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      },
    ]

    // 7. Save to Database
    const recap = await prisma.discordRecap.create({
      data: {
        channelName: channelName || '#general',
        threadTitle,
        threadUrl: threadUrl || null,
        rawMessages,
        executiveSummary,
        alertLevel,
        detectedIssues: JSON.stringify(detectedIssues),
        actionItems: JSON.stringify(actionItems),
        projectId: matchedProject?.id || null,
        divisionId: matchedProject?.divisionId || null,
        createdBy: 'Discord AI Bot Engine',
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        division: { select: { id: true, name: true, code: true, colorHex: true } },
      },
    })

    return NextResponse.json(recap, { status: 201 })
  } catch (error) {
    console.error('Error analyzing Discord thread:', error)
    return NextResponse.json({ error: 'Failed to analyze Discord thread' }, { status: 500 })
  }
}
