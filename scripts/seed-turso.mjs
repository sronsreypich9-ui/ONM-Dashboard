// seed-turso.mjs — seeds the Turso database directly using libsql client
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env
const envFile = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx)
  let val = trimmed.slice(idx + 1)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  process.env[key] = val
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function run(sql, args = []) {
  return db.execute({ sql, args })
}

async function main() {
  console.log('🌱 Seeding ONM Energy Turso database...')
  console.log('   DB:', process.env.TURSO_DATABASE_URL)

  // Clear tables (reverse FK order)
  await run('DELETE FROM "KPIReading"')
  await run('DELETE FROM "KPI"')
  await run('DELETE FROM "ActionItem"')
  await run('DELETE FROM "Issue"')
  await run('DELETE FROM "Meeting"')
  await run('DELETE FROM "Project"')
  await run('DELETE FROM "Division"')
  await run('DELETE FROM "User"')
  console.log('✅ Tables cleared')

  // USERS
  const now = new Date().toISOString()
  const adminHash = await bcrypt.hash('Admin@1234', 10)
  const viewerHash = await bcrypt.hash('Viewer@1234', 10)

  await run(`INSERT INTO "User" (email,name,passwordHash,role,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    ['admin@onm.com', 'VP Admin', adminHash, 'Admin', now, now])
  await run(`INSERT INTO "User" (email,name,passwordHash,role,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    ['viewer@onm.com', 'VP Viewer', viewerHash, 'Viewer', now, now])
  console.log('✅ Users created (admin@onm.com / Admin@1234 | viewer@onm.com / Viewer@1234)')

  // DIVISIONS
  const divisions = [
    { code: 'OPV', name: 'Operation & Maintenance, Solar PV Division', colorHex: '#f59e0b', leadName: 'Sak Sereyvuth · Senior Director' },
    { code: 'ESS', name: 'Energy Storage System Division',             colorHex: '#3b82f6', leadName: 'Suom Vireak · Director' },
    { code: 'WPD', name: 'Wind Power Division',                        colorHex: '#06b6d4', leadName: 'Suom Vireak · Director'   },
    { code: 'GSS', name: 'Grid & Substation Division',                 colorHex: '#8b5cf6', leadName: 'Tann Slengdy · Director' },
    { code: 'HFO', name: 'HFO & LNG Division',                         colorHex: '#ef4444', leadName: 'Tann Slengdy · Director'},
  ]
  const divIds = {}
  for (const d of divisions) {
    const r = await run(
      `INSERT INTO "Division" (code,name,colorHex,leadName,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
      [d.code, d.name, d.colorHex, d.leadName, now, now]
    )
    divIds[d.code] = Number(r.lastInsertRowid)
  }
  console.log('✅ Divisions created:', Object.keys(divIds).join(', '))

  // OPV PROJECTS (19)
  const opvProjects = [
    { code:'OPV-001', name:'SNTR 80MW Thmart Pong',          location:'Kampong Speu Province',           mw:80,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'Annual O&M Performance Audit',         msd:'2026-11-27', vp:0 },
    { code:'OPV-002', name:'SNTS 60MW Toek Phos',            location:'Kampong Chhnang / Pursat',        mw:60,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'Q3 Module Soiling Assessment',         msd:'2026-11-01', vp:0 },
    { code:'OPV-003', name:'SNTI 30MW Sna Ansa',             location:'Pursat Province',                 mw:30,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'Inverter PM Schedule',                 msd:'2026-10-31', vp:0 },
    { code:'OPV-004', name:'SNTS 60MW Sna Ansa',             location:'Kampong Chhnang / Pursat',        mw:60,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'Bi-annual Substation Maintenance',     msd:'2026-09-15', vp:0 },
    { code:'OPV-005', name:'SNTO 100MW Toek Phos',           location:'Pursat Province',                 mw:100, rag:'Green',  pct:100, phase:'COD Operations',            ms:'Performance Ratio Year 2 Review',      msd:'2026-09-30', vp:0 },
    { code:'OPV-006', name:'SNTD 60MW Amp Leang (PV+BESS)',  location:'Svay Rieng Province',             mw:60,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'BESS Capacity Test Q4',                msd:'2026-10-31', vp:0 },
    { code:'OPV-007', name:'SNTO 50MW Toek Phos',            location:'Pursat Province',                 mw:50,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'1-Year Warranty Inspection',           msd:'2027-01-08', vp:0 },
    { code:'OPV-008', name:'DMF 30MW Amp Leang (PV+BESS)',   location:'Kampong Chhnang Province',        mw:30,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'BMS Calibration Test',                 msd:'2026-09-20', vp:0 },
    { code:'OPV-009', name:'BYE 150MW (Phase I + II)',        location:'Kampong Chhnang Province',        mw:150, rag:'Green',  pct:100, phase:'COD Operations',            ms:'Grid Protection Relay Audit',          msd:'2026-11-15', vp:0 },
    { code:'OPV-010', name:'SNTB 150MW Sna Ansa (PV+BESS)',  location:'Pursat Province',                 mw:150, rag:'Green',  pct:100, phase:'COD Operations',            ms:'SoH Assessment',                       msd:'2026-10-15', vp:0 },
    { code:'OPV-011', name:'SNTZ 10MW Sna Ansa (PV+BESS)',   location:'Pursat Province',                 mw:10,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'Annual Thermography Survey',           msd:'2026-12-01', vp:0 },
    { code:'OPV-012', name:'SNTF 20MW Bavet',                location:'Bavet, Svay Rieng Province',      mw:20,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'SCADA Integration Final Sign-off',     msd:'2026-10-01', vp:0 },
    { code:'OPV-013', name:'SNTV 60MW (PV+BESS)',            location:'Svay Rieng Province',             mw:60,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'1-Year COD Milestone Audit',           msd:'2026-11-30', vp:0 },
    { code:'OPV-014', name:'MSGP 20MW (PV+BESS)',            location:'Pursat Province',                 mw:20,  rag:'Green',  pct:100, phase:'COD Operations',            ms:'Q3 Operations Review',                 msd:'2026-09-15', vp:0 },
    { code:'OPV-015', name:'ENG 100MW',                      location:'Battambang Province',             mw:100, rag:'Green',  pct:100, phase:'COD Operations',            ms:'Grid Compliance Certificate',          msd:'2026-09-30', vp:0 },
    { code:'OPV-016', name:'SNTJ 350MW',                     location:'Pursat Province',                 mw:350, rag:'Yellow', pct:95,  phase:'Pre-Commissioning',         ms:'Final Commercial COD Run',             msd:'2026-10-15', vp:0 },
    { code:'OPV-017', name:'SNTU 350MW',                     location:'Pursat Province',                 mw:350, rag:'Yellow', pct:72,  phase:'Construction',              ms:'Transformer Bay Commissioning',        msd:'2026-11-15', vp:1 },
    { code:'OPV-018', name:'SNTX 30MW',                      location:'Pursat Province',                 mw:30,  rag:'Red',    pct:60,  phase:'Construction',              ms:'Structure Foundation Delay Recovery',  msd:'2026-10-01', vp:1 },
    { code:'OPV-019', name:'RSM 100MW',                      location:'Pursat Province',                 mw:100, rag:'Yellow', pct:45,  phase:'Civil Works & Substation',  ms:'Civil Piling Completion',             msd:'2026-12-15', vp:0 },
  ]
  const projIds = {}
  for (const p of opvProjects) {
    const r = await run(
      `INSERT INTO "Project" (divisionId,name,code,location,capacityMw,statusRag,percentComplete,currentPhase,nextMilestone,nextMilestoneDate,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [divIds['OPV'], p.name, p.code, p.location, p.mw, p.rag, p.pct, p.phase, p.ms, new Date(p.msd).toISOString(), p.vp, now, now]
    )
    projIds[p.code] = Number(r.lastInsertRowid)
  }

  // ESS PROJECTS
  const essProjects = [
    { code:'ESS-001', name:'Chiang Mai BESS Project', location:'Chiang Mai',   mw:20,  rag:'Green',  pct:100, phase:'COD Operations',     ms:'SoH Assessment Q3',         vp:0 },
    { code:'ESS-002', name:'Rayong BESS Project',     location:'Rayong',       mw:30,  rag:'Yellow', pct:72,  phase:'System Integration', ms:'BMS Commissioning',         vp:0 },
    { code:'ESS-003', name:'Songkhla BESS Project',   location:'Songkhla',     mw:15,  rag:'Red',    pct:45,  phase:'Civil Works',        ms:'Battery Rack Installation', vp:1 },
  ]
  for (const p of essProjects) {
    const r = await run(
      `INSERT INTO "Project" (divisionId,name,code,location,capacityMw,statusRag,percentComplete,currentPhase,nextMilestone,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [divIds['ESS'], p.name, p.code, p.location, p.mw, p.rag, p.pct, p.phase, p.ms, p.vp, now, now]
    )
    projIds[p.code] = Number(r.lastInsertRowid)
  }

  // WPD
  let r = await run(
    `INSERT INTO "Project" (divisionId,name,code,location,capacityMw,statusRag,percentComplete,currentPhase,nextMilestone,nextMilestoneDate,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [divIds['WPD'],'Hua Sai Wind Farm','WPD-001','Nakhon Si Thammarat',90,'Yellow',83,'Turbine Installation','Grid Connection Ready',new Date('2026-10-15').toISOString(),1,now,now]
  )
  projIds['WPD-001'] = Number(r.lastInsertRowid)

  // GSS
  r = await run(
    `INSERT INTO "Project" (divisionId,name,code,location,statusRag,percentComplete,currentPhase,nextMilestone,nextMilestoneDate,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [divIds['GSS'],'Pathum Thani 115kV Substation Upgrade','GSS-001','Pathum Thani','Green',100,'COD Operations','Relay Coordination Study',new Date('2026-09-30').toISOString(),0,now,now]
  )
  projIds['GSS-001'] = Number(r.lastInsertRowid)

  // HFO PROJECTS
  const hfoProjects = [
    { code:'HFO-001', name:'Map Ta Phut HFO Power Plant',     location:'Rayong',      mw:120, rag:'Green',  pct:100, phase:'COD Operations',              ms:'Overhaul Scheduling',        vp:0 },
    { code:'HFO-002', name:'Laem Chabang HFO Plant',          location:'Chonburi',    mw:80,  rag:'Yellow', pct:100, phase:'COD Operations',              ms:'Emission Compliance Audit',  vp:0 },
    { code:'HFO-003', name:'Chana LNG Power Plant',           location:'Songkhla',    mw:200, rag:'Green',  pct:100, phase:'COD Operations',              ms:'LNG Contract Renewal',       vp:0 },
    { code:'HFO-004', name:'Surat Thani HFO Plant',           location:'Surat Thani', mw:60,  rag:'Red',    pct:55,  phase:'Engineering & Procurement',   ms:'EPC Contract Award',         vp:1 },
    { code:'HFO-005', name:'Chumphon LNG Terminal & Plant',   location:'Chumphon',    mw:150, rag:'Yellow', pct:70,  phase:'Construction',                ms:'Tank Foundation Complete',   vp:0 },
  ]
  for (const p of hfoProjects) {
    r = await run(
      `INSERT INTO "Project" (divisionId,name,code,location,capacityMw,statusRag,percentComplete,currentPhase,nextMilestone,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [divIds['HFO'], p.name, p.code, p.location, p.mw, p.rag, p.pct, p.phase, p.ms, p.vp, now, now]
    )
    projIds[p.code] = Number(r.lastInsertRowid)
  }
  console.log('✅ Projects created:', Object.keys(projIds).length)

  // MEETINGS
  r = await run(
    `INSERT INTO "Meeting" (projectId,meetingDate,title,attendees,summary,decisions,source,createdBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [projIds['OPV-018'], new Date('2026-08-02').toISOString(), 'SNTX 30MW — Construction Delay & Site Piling Review',
     JSON.stringify(['Somchai Pattana (OPV Lead)','Pursat Site Manager','Civil Contractor']),
     'Heavy rainfall in Pursat province delayed foundation civil works by 3 weeks. Piling rig mobilization pending.',
     'Deploy secondary piling rig by Aug 15. Fast-track drainage trenching.', 'manual', 'admin@onm.com', now, now]
  )
  const m1 = Number(r.lastInsertRowid)
  await run(`INSERT INTO "ActionItem" (meetingId,projectId,description,owner,dueDate,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [m1, projIds['OPV-018'], 'Mobilize 2nd piling rig to site', 'Civil Contractor', new Date('2026-08-15').toISOString(), 'In-progress', now, now])
  await run(`INSERT INTO "ActionItem" (meetingId,projectId,description,owner,dueDate,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [m1, projIds['OPV-018'], 'Submit revised construction recovery plan', 'Pursat Site Manager', new Date('2026-08-10').toISOString(), 'Overdue', now, now])
  await run(`INSERT INTO "Issue" (projectId,title,severity,status,owner,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [projIds['OPV-018'], 'Foundation civil works 3 weeks behind baseline schedule', 'High', 'Open', 'Pursat Site Manager', 1, now, now])
  await run(`INSERT INTO "Issue" (projectId,title,severity,status,owner,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [projIds['OPV-018'], 'Site water drainage capacity insufficient during heavy rains', 'Med', 'Open', 'Civil Contractor', 0, now, now])

  r = await run(
    `INSERT INTO "Meeting" (projectId,meetingDate,title,attendees,summary,decisions,source,createdBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [projIds['OPV-017'], new Date('2026-08-05').toISOString(), 'SNTU 350MW — Transformer Delivery & Substation Milestone',
     JSON.stringify(['Somchai Pattana (OPV Lead)','Siemens EPC Manager','VP Representative']),
     '350MW substation Transformer Bay 1 & 2 structural steel installed. Transformer shipping delivery confirmed for Sep 10.',
     'Prepare transformer foundation pad inspection by Aug 25.', 'manual', 'admin@onm.com', now, now]
  )
  const m2 = Number(r.lastInsertRowid)
  await run(`INSERT INTO "ActionItem" (meetingId,projectId,description,owner,dueDate,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [m2, projIds['OPV-017'], 'Complete foundation pad inspection', 'Siemens EPC Manager', new Date('2026-08-25').toISOString(), 'Open', now, now])
  await run(`INSERT INTO "Issue" (projectId,title,severity,status,owner,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [projIds['OPV-017'], 'Transformer shipping clearance delayed at customs', 'High', 'Open', 'Logistics Lead', 1, now, now])

  r = await run(
    `INSERT INTO "Meeting" (projectId,meetingDate,title,attendees,summary,decisions,source,createdBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [projIds['OPV-001'], new Date('2026-08-04').toISOString(), 'SNTR 80MW Thmart Pong — Monthly O&M Performance Review',
     JSON.stringify(['Somchai Pattana','Thmart Pong Site Lead','O&M Crew']),
     'Performance ratio reached 83.1% (exceeding 80% target). Total generation 14,200 MWh for July. Inverter availability 99.4%.',
     'Schedule module cleaning for Zone B in late August.', 'manual', 'admin@onm.com', now, now]
  )
  const m3 = Number(r.lastInsertRowid)
  await run(`INSERT INTO "ActionItem" (meetingId,projectId,description,owner,dueDate,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [m3, projIds['OPV-001'], 'Execute Zone B panel washing campaign', 'Thmart Pong Site Lead', new Date('2026-08-28').toISOString(), 'Open', now, now])

  await run(`INSERT INTO "Issue" (projectId,title,severity,status,owner,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [projIds['ESS-003'], 'Unexpected rock formation causing piling delay', 'Critical', 'Open', 'Civil Contractor', 1, now, now])
  await run(`INSERT INTO "Issue" (projectId,title,severity,status,owner,needsVpAttention,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`,
    [projIds['HFO-004'], 'All EPC bids exceed approved budget by 15-20%', 'Critical', 'Open', 'Finance Team', 1, now, now])
  console.log('✅ Meetings, issues & action items created')

  // KPIs for OPV-001
  r = await run(`INSERT INTO "KPI" (projectId,name,unit,target,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    [projIds['OPV-001'], 'Plant Availability', '%', 98, now, now])
  const kpiAv = Number(r.lastInsertRowid)
  r = await run(`INSERT INTO "KPI" (projectId,name,unit,target,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    [projIds['OPV-001'], 'Performance Ratio', '%', 80, now, now])
  const kpiPR = Number(r.lastInsertRowid)
  r = await run(`INSERT INTO "KPI" (projectId,name,unit,target,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    [projIds['OPV-001'], 'Energy Generated', 'MWh', 13500, now, now])
  const kpiGen = Number(r.lastInsertRowid)

  const months = ['2026-02','2026-03','2026-04','2026-05','2026-06','2026-07']
  const avVals  = [99.1, 98.9, 99.4, 99.2, 99.0, 99.4]
  const prVals  = [82.4, 81.8, 83.0, 82.5, 82.8, 83.1]
  const genVals = [13800, 14100, 14500, 14250, 13950, 14200]
  for (let i = 0; i < months.length; i++) {
    await run(`INSERT INTO "KPIReading" (kpiId,period,actualValue,createdAt) VALUES (?,?,?,?)`, [kpiAv,  months[i], avVals[i],  now])
    await run(`INSERT INTO "KPIReading" (kpiId,period,actualValue,createdAt) VALUES (?,?,?,?)`, [kpiPR,  months[i], prVals[i],  now])
    await run(`INSERT INTO "KPIReading" (kpiId,period,actualValue,createdAt) VALUES (?,?,?,?)`, [kpiGen, months[i], genVals[i], now])
  }

  // KPIs for OPV-005
  r = await run(`INSERT INTO "KPI" (projectId,name,unit,target,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    [projIds['OPV-005'], 'Plant Availability', '%', 98, now, now])
  const kpiAv5 = Number(r.lastInsertRowid)
  r = await run(`INSERT INTO "KPI" (projectId,name,unit,target,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`,
    [projIds['OPV-005'], 'Energy Generated', 'MWh', 16500, now, now])
  const kpiGen5 = Number(r.lastInsertRowid)
  const av5   = [98.5, 98.8, 99.1, 98.9, 99.3, 99.2]
  const gen5  = [16200, 16800, 17100, 16900, 16600, 17000]
  for (let i = 0; i < months.length; i++) {
    await run(`INSERT INTO "KPIReading" (kpiId,period,actualValue,createdAt) VALUES (?,?,?,?)`, [kpiAv5,  months[i], av5[i],  now])
    await run(`INSERT INTO "KPIReading" (kpiId,period,actualValue,createdAt) VALUES (?,?,?,?)`, [kpiGen5, months[i], gen5[i], now])
  }
  console.log('✅ KPIs & readings created')

  console.log('')
  console.log('🎉 Seed complete!')
  console.log('   Divisions: 5 | Projects: 29 | Users: 2')
  console.log('   Login: admin@onm.com / Admin@1234')
  console.log('           viewer@onm.com / Viewer@1234')
}

main().catch(e => { console.error(e); process.exit(1) })
