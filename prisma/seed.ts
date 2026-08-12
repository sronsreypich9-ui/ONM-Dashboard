import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Updating ONM Energy dashboard seed data with official OPV project list...')

  // Clear existing records to ensure a clean refresh of real data
  await prisma.kPIReading.deleteMany()
  await prisma.kPI.deleteMany()
  await prisma.actionItem.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.project.deleteMany()
  await prisma.division.deleteMany()
  await prisma.user.deleteMany()

  // ============================================================
  // USERS
  // ============================================================
  const adminHash = await bcrypt.hash('admin123', 10)
  const viewerHash = await bcrypt.hash('viewer123', 10)

  await prisma.user.create({
    data: { email: 'vp@onm-energy.com', name: 'VP Office', passwordHash: viewerHash, role: 'Viewer' },
  })
  await prisma.user.create({
    data: { email: 'admin@onm-energy.com', name: 'System Admin', passwordHash: adminHash, role: 'Admin' },
  })

  // ============================================================
  // DIVISIONS
  // ============================================================
  const opv = await prisma.division.create({
    data: { code: 'OPV', name: 'Operation & Maintenance, Solar PV Division', colorHex: '#f59e0b', leadName: 'Mr. Somchai Pattana' },
  })
  const ess = await prisma.division.create({
    data: { code: 'ESS', name: 'Energy Storage System Division', colorHex: '#3b82f6', leadName: 'Ms. Nattaya Wongsuk' },
  })
  const wpd = await prisma.division.create({
    data: { code: 'WPD', name: 'Wind Power Division', colorHex: '#06b6d4', leadName: 'Mr. Krit Siriwat' },
  })
  const gss = await prisma.division.create({
    data: { code: 'GSS', name: 'Grid & Substation Division', colorHex: '#8b5cf6', leadName: 'Ms. Pornpan Sathit' },
  })
  const hfo = await prisma.division.create({
    data: { code: 'HFO', name: 'HFO & LNG Division', colorHex: '#ef4444', leadName: 'Mr. Wanchai Rungsang' },
  })

  // ============================================================
  // OPV PROJECTS (19 Real Operating & Under-Construction Projects)
  // ============================================================
  const opvProjects = [
    { code: 'OPV-001', name: 'SNTR 80MW Thmart Pong', location: 'Kampong Speu Province', capacityMw: 80, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Annual O&M Performance Audit', nextMilestoneDate: new Date('2026-11-27'), needsVpAttention: false },
    { code: 'OPV-002', name: 'SNTS 60MW Toek Phos', location: 'Kampong Chhnang / Pursat', capacityMw: 60, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Q3 Module Soiling Assessment', nextMilestoneDate: new Date('2026-11-01'), needsVpAttention: false },
    { code: 'OPV-003', name: 'SNTI 30MW Sna Ansa', location: 'Pursat Province', capacityMw: 30, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Inverter PM Schedule', nextMilestoneDate: new Date('2026-10-31'), needsVpAttention: false },
    { code: 'OPV-004', name: 'SNTS 60MW Sna Ansa', location: 'Kampong Chhnang / Pursat', capacityMw: 60, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Bi-annual Substation Maintenance', nextMilestoneDate: new Date('2026-09-15'), needsVpAttention: false },
    { code: 'OPV-005', name: 'SNTO 100MW Toek Phos', location: 'Pursat Province', capacityMw: 100, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Performance Ratio Year 2 Review', nextMilestoneDate: new Date('2026-09-30'), needsVpAttention: false },
    { code: 'OPV-006', name: 'SNTD 60MW Amp Leang (PV+BESS)', location: 'Svay Rieng Province', capacityMw: 60, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'BESS Capacity Test Q4', nextMilestoneDate: new Date('2026-10-31'), needsVpAttention: false },
    { code: 'OPV-007', name: 'SNTO 50MW Toek Phos', location: 'Pursat Province', capacityMw: 50, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: '1-Year Warranty Inspection', nextMilestoneDate: new Date('2027-01-08'), needsVpAttention: false },
    { code: 'OPV-008', name: 'DMF 30MW Amp Leang (PV+BESS)', location: 'Kampong Chhnang Province', capacityMw: 30, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'BMS Calibration Test', nextMilestoneDate: new Date('2026-09-20'), needsVpAttention: false },
    { code: 'OPV-009', name: 'BYE 150MW (Phase I + II)', location: 'Kampong Chhnang Province', capacityMw: 150, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Grid Protection Relay Audit', nextMilestoneDate: new Date('2026-11-15'), needsVpAttention: false },
    { code: 'OPV-010', name: 'SNTB 150MW Sna Ansa (PV+BESS)', location: 'Pursat Province', capacityMw: 150, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'SoH Assessment', nextMilestoneDate: new Date('2026-10-15'), needsVpAttention: false },
    { code: 'OPV-011', name: 'SNTZ 10MW Sna Ansa (PV+BESS)', location: 'Pursat Province', capacityMw: 10, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Annual Thermography Survey', nextMilestoneDate: new Date('2026-12-01'), needsVpAttention: false },
    { code: 'OPV-012', name: 'SNTF 20MW Bavet', location: 'Bavet, Svay Rieng Province', capacityMw: 20, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'SCADA Integration Final Sign-off', nextMilestoneDate: new Date('2026-10-01'), needsVpAttention: false },
    { code: 'OPV-013', name: 'SNTV 60MW (PV+BESS)', location: 'Svay Rieng Province', capacityMw: 60, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: '1-Year COD Milestone Audit', nextMilestoneDate: new Date('2026-11-30'), needsVpAttention: false },
    { code: 'OPV-014', name: 'MSGP 20MW (PV+BESS)', location: 'Pursat Province', capacityMw: 20, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Q3 Operations Review', nextMilestoneDate: new Date('2026-09-15'), needsVpAttention: false },
    { code: 'OPV-015', name: 'ENG 100MW', location: 'Battambang Province', capacityMw: 100, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Grid Compliance Certificate', nextMilestoneDate: new Date('2026-09-30'), needsVpAttention: false },
    { code: 'OPV-016', name: 'SNTJ 350MW', location: 'Pursat Province', capacityMw: 350, statusRag: 'Yellow', percentComplete: 95, currentPhase: 'Pre-Commissioning', nextMilestone: 'Final Commercial COD Run', nextMilestoneDate: new Date('2026-10-15'), needsVpAttention: false },
    { code: 'OPV-017', name: 'SNTU 350MW', location: 'Pursat Province', capacityMw: 350, statusRag: 'Yellow', percentComplete: 72, currentPhase: 'Construction', nextMilestone: 'Transformer Bay Commissioning', nextMilestoneDate: new Date('2026-11-15'), needsVpAttention: true },
    { code: 'OPV-018', name: 'SNTX 30MW', location: 'Pursat Province', capacityMw: 30, statusRag: 'Red', percentComplete: 60, currentPhase: 'Construction', nextMilestone: 'Structure Foundation Delay Recovery', nextMilestoneDate: new Date('2026-10-01'), needsVpAttention: true },
    { code: 'OPV-019', name: 'RSM 100MW', location: 'Pursat Province', capacityMw: 100, statusRag: 'Yellow', percentComplete: 45, currentPhase: 'Civil Works & Substation', nextMilestone: 'Civil Piling Completion', nextMilestoneDate: new Date('2026-12-15'), needsVpAttention: false },
  ]

  const opvProjectRecords = []
  for (const p of opvProjects) {
    const rec = await prisma.project.create({
      data: {
        divisionId: opv.id,
        name: p.name,
        code: p.code,
        location: p.location,
        capacityMw: p.capacityMw,
        statusRag: p.statusRag,
        percentComplete: p.percentComplete,
        currentPhase: p.currentPhase,
        nextMilestone: p.nextMilestone,
        nextMilestoneDate: p.nextMilestoneDate,
        needsVpAttention: p.needsVpAttention,
      },
    })
    opvProjectRecords.push(rec)
  }

  // ============================================================
  // ESS PROJECTS (3)
  // ============================================================
  const essProjects = [
    { code: 'ESS-001', name: 'Chiang Mai BESS Project', location: 'Chiang Mai', capacityMw: 20, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'SoH Assessment Q3', needsVpAttention: false },
    { code: 'ESS-002', name: 'Rayong BESS Project', location: 'Rayong', capacityMw: 30, statusRag: 'Yellow', percentComplete: 72, currentPhase: 'System Integration', nextMilestone: 'BMS Commissioning', needsVpAttention: false },
    { code: 'ESS-003', name: 'Songkhla BESS Project', location: 'Songkhla', capacityMw: 15, statusRag: 'Red', percentComplete: 45, currentPhase: 'Civil Works', nextMilestone: 'Battery Rack Installation', needsVpAttention: true },
  ]

  const essProjectRecords = []
  for (const p of essProjects) {
    const rec = await prisma.project.create({
      data: {
        divisionId: ess.id,
        name: p.name,
        code: p.code,
        location: p.location,
        capacityMw: p.capacityMw,
        statusRag: p.statusRag,
        percentComplete: p.percentComplete,
        currentPhase: p.currentPhase,
        nextMilestone: p.nextMilestone,
        nextMilestoneDate: new Date(Date.now() + Math.random() * 60 * 86400000),
        needsVpAttention: p.needsVpAttention,
      },
    })
    essProjectRecords.push(rec)
  }

  // ============================================================
  // WPD PROJECT (1)
  // ============================================================
  const wpdProj = await prisma.project.create({
    data: {
      divisionId: wpd.id,
      name: 'Hua Sai Wind Farm',
      code: 'WPD-001',
      location: 'Nakhon Si Thammarat',
      capacityMw: 90,
      statusRag: 'Yellow',
      percentComplete: 83,
      currentPhase: 'Turbine Installation',
      nextMilestone: 'Grid Connection Ready',
      nextMilestoneDate: new Date('2026-10-15'),
      needsVpAttention: true,
    },
  })

  // ============================================================
  // GSS PROJECT (1)
  // ============================================================
  const gssProj = await prisma.project.create({
    data: {
      divisionId: gss.id,
      name: 'Pathum Thani 115kV Substation Upgrade',
      code: 'GSS-001',
      location: 'Pathum Thani',
      capacityMw: null,
      statusRag: 'Green',
      percentComplete: 100,
      currentPhase: 'COD Operations',
      nextMilestone: 'Relay Coordination Study',
      nextMilestoneDate: new Date('2026-09-30'),
      needsVpAttention: false,
    },
  })

  // ============================================================
  // HFO PROJECTS (5)
  // ============================================================
  const hfoProjects = [
    { code: 'HFO-001', name: 'Map Ta Phut HFO Power Plant', location: 'Rayong', capacityMw: 120, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Overhaul Scheduling', needsVpAttention: false },
    { code: 'HFO-002', name: 'Laem Chabang HFO Plant', location: 'Chonburi', capacityMw: 80, statusRag: 'Yellow', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'Emission Compliance Audit', needsVpAttention: false },
    { code: 'HFO-003', name: 'Chana LNG Power Plant', location: 'Songkhla', capacityMw: 200, statusRag: 'Green', percentComplete: 100, currentPhase: 'COD Operations', nextMilestone: 'LNG Contract Renewal', needsVpAttention: false },
    { code: 'HFO-004', name: 'Surat Thani HFO Plant', location: 'Surat Thani', capacityMw: 60, statusRag: 'Red', percentComplete: 55, currentPhase: 'Engineering & Procurement', nextMilestone: 'EPC Contract Award', needsVpAttention: true },
    { code: 'HFO-005', name: 'Chumphon LNG Terminal & Plant', location: 'Chumphon', capacityMw: 150, statusRag: 'Yellow', percentComplete: 70, currentPhase: 'Construction', nextMilestone: 'Tank Foundation Complete', needsVpAttention: false },
  ]

  const hfoProjectRecords = []
  for (const p of hfoProjects) {
    const rec = await prisma.project.create({
      data: {
        divisionId: hfo.id,
        name: p.name,
        code: p.code,
        location: p.location,
        capacityMw: p.capacityMw,
        statusRag: p.statusRag,
        percentComplete: p.percentComplete,
        currentPhase: p.currentPhase,
        nextMilestone: p.nextMilestone,
        nextMilestoneDate: new Date(Date.now() + Math.random() * 120 * 86400000),
        needsVpAttention: p.needsVpAttention,
      },
    })
    hfoProjectRecords.push(rec)
  }

  // ============================================================
  // MEETINGS, ISSUES, & ACTION ITEMS FOR KEY PROJECTS
  // ============================================================
  // OPV-018 (Red - SNTX 30MW under construction)
  const opv018 = opvProjectRecords[17]
  const m1 = await prisma.meeting.create({
    data: {
      projectId: opv018.id,
      meetingDate: new Date('2026-08-02'),
      title: 'SNTX 30MW — Construction Delay & Site Piling Review',
      attendees: JSON.stringify(['Somchai Pattana (OPV Lead)', 'Pursat Site Manager', 'Civil Contractor']),
      summary: 'Heavy rainfall in Pursat province delayed foundation civil works by 3 weeks. Piling rig mobilization pending.',
      decisions: 'Deploy secondary piling rig by Aug 15. Fast-track drainage trenching.',
      source: 'manual',
      createdBy: 'admin@onm-energy.com',
    },
  })
  await prisma.actionItem.createMany({
    data: [
      { meetingId: m1.id, projectId: opv018.id, description: 'Mobilize 2nd piling rig to site', owner: 'Civil Contractor', dueDate: new Date('2026-08-15'), status: 'In-progress' },
      { meetingId: m1.id, projectId: opv018.id, description: 'Submit revised construction recovery plan', owner: 'Pursat Site Manager', dueDate: new Date('2026-08-10'), status: 'Overdue' },
    ],
  })
  await prisma.issue.createMany({
    data: [
      { projectId: opv018.id, title: 'Foundation civil works 3 weeks behind baseline schedule', severity: 'High', status: 'Open', owner: 'Pursat Site Manager', needsVpAttention: true },
      { projectId: opv018.id, title: 'Site water drainage capacity insufficient during heavy rains', severity: 'Med', status: 'Open', owner: 'Civil Contractor', needsVpAttention: false },
    ],
  })

  // OPV-017 (Yellow - SNTU 350MW under construction)
  const opv017 = opvProjectRecords[16]
  const m2 = await prisma.meeting.create({
    data: {
      projectId: opv017.id,
      meetingDate: new Date('2026-08-05'),
      title: 'SNTU 350MW — Transformer Delivery & Substation Milestone',
      attendees: JSON.stringify(['Somchai Pattana (OPV Lead)', 'Siemens EPC Manager', 'VP Representative']),
      summary: '350MW substation Transformer Bay 1 & 2 structural steel installed. Transformer shipping delivery confirmed for Sep 10.',
      decisions: 'Prepare transformer foundation pad inspection by Aug 25.',
      source: 'manual',
      createdBy: 'editor@onm-energy.com',
    },
  })
  await prisma.actionItem.create({
    data: { meetingId: m2.id, projectId: opv017.id, description: 'Complete foundation pad inspection', owner: 'Siemens EPC Manager', dueDate: new Date('2026-08-25'), status: 'Open' },
  })
  await prisma.issue.create({
    data: { projectId: opv017.id, title: 'Transformer shipping clearance delayed at customs', severity: 'High', status: 'Open', owner: 'Logistics Lead', needsVpAttention: true },
  })

  // OPV-001 (SNTR 80MW Thmart Pong - Operating)
  const opv001 = opvProjectRecords[0]
  const m3 = await prisma.meeting.create({
    data: {
      projectId: opv001.id,
      meetingDate: new Date('2026-08-04'),
      title: 'SNTR 80MW Thmart Pong — Monthly O&M Performance Review',
      attendees: JSON.stringify(['Somchai Pattana', 'Thmart Pong Site Lead', 'O&M Crew']),
      summary: 'Performance ratio reached 83.1% (exceeding 80% target). Total generation 14,200 MWh for July. Inverter availability 99.4%.',
      decisions: 'Schedule module cleaning for Zone B in late August.',
      source: 'manual',
      createdBy: 'editor@onm-energy.com',
    },
  })
  await prisma.actionItem.create({
    data: { meetingId: m3.id, projectId: opv001.id, description: 'Execute Zone B panel washing campaign', owner: 'Thmart Pong Site Lead', dueDate: new Date('2026-08-28'), status: 'Open' },
  })

  // ESS-003 & HFO-004 Meetings & Issues
  const ess003 = essProjectRecords[2]
  await prisma.issue.create({
    data: { projectId: ess003.id, title: 'Unexpected rock formation causing piling delay', severity: 'Critical', status: 'Open', owner: 'Civil Contractor', needsVpAttention: true },
  })

  const hfo004 = hfoProjectRecords[3]
  await prisma.issue.create({
    data: { projectId: hfo004.id, title: 'All EPC bids exceed approved budget by 15-20%', severity: 'Critical', status: 'Open', owner: 'Finance Team', needsVpAttention: true },
  })

  // ============================================================
  // KPIs & MONTHLY READINGS FOR OPV PROJECTS
  // ============================================================
  const kpiAv001 = await prisma.kPI.create({
    data: { projectId: opv001.id, name: 'Plant Availability', unit: '%', target: 98 },
  })
  const kpiPR001 = await prisma.kPI.create({
    data: { projectId: opv001.id, name: 'Performance Ratio', unit: '%', target: 80 },
  })
  const kpiGen001 = await prisma.kPI.create({
    data: { projectId: opv001.id, name: 'Energy Generated', unit: 'MWh', target: 13500 },
  })

  const months = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07']
  const avVals = [99.1, 98.9, 99.4, 99.2, 99.0, 99.4]
  const prVals = [82.4, 81.8, 83.0, 82.5, 82.8, 83.1]
  const genVals = [13800, 14100, 14500, 14250, 13950, 14200]
  for (let i = 0; i < months.length; i++) {
    await prisma.kPIReading.createMany({
      data: [
        { kpiId: kpiAv001.id, period: months[i], actualValue: avVals[i] },
        { kpiId: kpiPR001.id, period: months[i], actualValue: prVals[i] },
        { kpiId: kpiGen001.id, period: months[i], actualValue: genVals[i] },
      ],
    })
  }

  // OPV-005 (SNTO 100MW) KPIs
  const opv005 = opvProjectRecords[4]
  const kpiAv005 = await prisma.kPI.create({
    data: { projectId: opv005.id, name: 'Plant Availability', unit: '%', target: 98 },
  })
  const kpiGen005 = await prisma.kPI.create({
    data: { projectId: opv005.id, name: 'Energy Generated', unit: 'MWh', target: 16500 },
  })
  for (let i = 0; i < months.length; i++) {
    await prisma.kPIReading.createMany({
      data: [
        { kpiId: kpiAv005.id, period: months[i], actualValue: [98.5, 98.8, 99.1, 98.9, 99.3, 99.2][i] },
        { kpiId: kpiGen005.id, period: months[i], actualValue: [16200, 16800, 17100, 16900, 16600, 17000][i] },
      ],
    })
  }

  console.log('✅ Seed updated successfully with real OPV portfolio data!')
  console.log(`   Divisions: 5`)
  console.log(`   OPV Projects: 19 real projects (SNTR 80MW, SNTS 60MW, SNTI 30MW, SNTO 100MW, SNTJ 350MW, SNTU 350MW, SNTX 30MW, RSM 100MW, etc.)`)
  console.log(`   Total Projects: ${opvProjects.length + essProjects.length + 1 + 1 + hfoProjects.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
