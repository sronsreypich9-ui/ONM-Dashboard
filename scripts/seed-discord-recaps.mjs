import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma  = new PrismaClient({ adapter })

const sampleRecaps = [
  {
    channelName: '#opv-site-updates',
    threadTitle: 'SNTU 350MW Substation Delay & 230kV Transformer Testing Failure',
    threadUrl: 'https://discord.com/channels/1092839281/1192838192/1293819283',
    alertLevel: 'Critical',
    projectCode: 'OPV-017',
    divCode: 'OPV',
    rawMessages: `[08:15 AM] @engineer_rakasm: Good morning team. We ran the 230kV main transformer insulation test for SNTU 350MW this morning.
[08:18 AM] @lead_insulation: Phase A and Phase C passed dielectric tests, but Phase B showed moisture contamination in the oil sample.
[08:25 AM] @vp_office: What is the impact on COD schedule? Can we re-dry the oil on site?
[08:32 AM] @lead_insulation: Yes, we dispatched the OEM Thailand technical crew with vacuum oil re-filtration unit. ETA Banteay Meanchey site tomorrow 10 AM.
[08:40 AM] @grid_coordinator: This delays grid synchronization run by 5 to 7 days. I will notify EDC system operators right away.`,
    executiveSummary: `• High-voltage 230kV main transformer dielectric test failed on Phase B due to trace moisture contamination.
• OEM Thailand specialized crew dispatched with mobile vacuum oil filtration unit (ETA tomorrow 10:00 AM).
• Estimated 5–7 days delay to grid synchronization run; EDC grid dispatcher notified.`,
    detectedIssues: JSON.stringify([
      {
        title: 'SNTU 350MW 230kV Main Transformer Phase B Dielectric Failure',
        severity: 'Critical',
        owner: 'Sak Sereyvuth',
        description: 'Dielectric insulation test failed on Phase B due to oil moisture contamination. OEM vacuum filtration team dispatched.',
      },
    ]),
    actionItems: JSON.stringify([
      {
        description: 'Coordinate OEM site arrival & vacuum oil re-filtration unit setup',
        owner: 'Sak Sereyvuth',
        dueDate: '2026-08-16',
      },
      {
        description: 'Submit revised grid synchronization schedule to EDC dispatcher',
        owner: 'Sron Sreypich',
        dueDate: '2026-08-17',
      },
    ]),
  },
  {
    channelName: '#ess-bess-commissioning',
    threadTitle: 'SNTK 500MW/1000MWH BESS Container 14 Thermal Management Calibration',
    threadUrl: 'https://discord.com/channels/1092839281/1192838193/1293819284',
    alertLevel: 'Attention',
    projectCode: 'ESS-003',
    divCode: 'ESS',
    rawMessages: `[10:05 AM] @bess_lead: During the 50% SOC continuous charge test on SNTK 500MW/1000MWH BESS, Container 14 HVAC cooling loop sensor reported temperature drift (+4.2°C).
[10:12 AM] @bms_dev: BMS safety logic automatically throttled charge rate from 0.5C to 0.25C to prevent thermal stress.
[10:20 AM] @suom_vireak: Excellent safety response. Is this a physical pump issue or sensor calibration?
[10:28 AM] @bess_lead: Thermal imaging confirmed physical cell temperatures are normal (28°C). It is telemetry sensor drift on RTD Module 3. Patching Firmware v2.4.1 tonight.`,
    executiveSummary: `• Container 14 HVAC cooling loop telemetry sensor reported +4.2°C drift during 50% SOC charge test.
• Automated BMS safety system successfully throttled C-rate from 0.5C to 0.25C to maintain safe cell limits.
• Thermal imaging verified physical cell temperatures are normal (28°C). BMS Firmware v2.4.1 update scheduled tonight.`,
    detectedIssues: JSON.stringify([
      {
        title: 'BESS Container 14 HVAC Telemetry Sensor Calibration Drift',
        severity: 'Med',
        owner: 'Suom Vireak',
        description: 'RTD sensor drift triggered automated charge rate throttling. Physical cell temperatures verified normal.',
      },
    ]),
    actionItems: JSON.stringify([
      {
        description: 'Deploy BMS Firmware v2.4.1 update to Containers 14-20',
        owner: 'Suom Vireak',
        dueDate: '2026-08-15',
      },
    ]),
  },
  {
    channelName: '#gss-grid-alerts',
    threadTitle: 'GSS Patrol and Maintenance RTK-TBM 230kV Routine Inspection Complete',
    threadUrl: 'https://discord.com/channels/1092839281/1192838194/1293819285',
    alertLevel: 'Normal',
    projectCode: 'GSS-001',
    divCode: 'GSS',
    rawMessages: `[02:00 PM] @gss_patrol: Q3 high-resolution drone thermography inspection of RTK-TBM 230kV transmission line is complete.
[02:15 PM] @tann_slengdy: Any thermal anomaly or insulator hot spot detected?
[02:22 PM] @gss_patrol: Zero thermal anomalies detected across all 142 transmission towers. Right-of-way clearance complies 100% with EDC safety standards.`,
    executiveSummary: `• Quarterly drone thermography inspection of 230kV RTK-TBM transmission line completed successfully.
• All 142 transmission towers inspected with zero thermal anomalies or insulator hot spots.
• Right-of-way vegetation clearance complies 100% with EDC safety distance requirements.`,
    detectedIssues: JSON.stringify([]),
    actionItems: JSON.stringify([
      {
        description: 'Archive Q3 thermography imagery report into GSS engineering portal',
        owner: 'Tann Slengdy',
        dueDate: '2026-08-20',
      },
    ]),
  },
]

async function main() {
  console.log('💬 Seeding Discord Recaps…\n')

  for (const r of sampleRecaps) {
    const proj = await prisma.project.findFirst({ where: { code: r.projectCode } })
    const div  = await prisma.division.findFirst({ where: { code: r.divCode } })

    const created = await prisma.discordRecap.create({
      data: {
        channelName: r.channelName,
        threadTitle: r.threadTitle,
        threadUrl: r.threadUrl,
        rawMessages: r.rawMessages,
        executiveSummary: r.executiveSummary,
        alertLevel: r.alertLevel,
        detectedIssues: r.detectedIssues,
        actionItems: r.actionItems,
        projectId: proj?.id,
        divisionId: div?.id,
        createdBy: 'Discord AI Bot',
      },
    })
    console.log(`  ✨ Created Discord Recap [${created.alertLevel}]: ${created.threadTitle}`)
  }

  const count = await prisma.discordRecap.count()
  console.log(`\n✅ Done! Total Discord Recaps in database: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
