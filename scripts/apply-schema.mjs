// apply-schema.mjs — applies the full schema to Turso via HTTP API
import { createClient } from '@libsql/client'

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
const TURSO_AUTH_TOKEN   = process.env.TURSO_AUTH_TOKEN

if (!TURSO_DATABASE_URL) { console.error('Missing TURSO_DATABASE_URL'); process.exit(1) }

const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN })

const statements = [
  // Division
  `CREATE TABLE IF NOT EXISTS "Division" (
    "id"        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code"      TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "colorHex"  TEXT NOT NULL,
    "leadName"  TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Division_code_key" ON "Division"("code")`,

  // Project
  `CREATE TABLE IF NOT EXISTS "Project" (
    "id"                INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "divisionId"        INTEGER NOT NULL,
    "name"              TEXT NOT NULL,
    "code"              TEXT NOT NULL,
    "location"          TEXT,
    "capacityMw"        REAL,
    "statusRag"         TEXT NOT NULL DEFAULT 'Green',
    "percentComplete"   REAL NOT NULL DEFAULT 0,
    "currentPhase"      TEXT,
    "nextMilestone"     TEXT,
    "nextMilestoneDate" DATETIME,
    "needsVpAttention"  INTEGER NOT NULL DEFAULT 0,
    "createdAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("divisionId") REFERENCES "Division"("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Project_code_key" ON "Project"("code")`,

  // Meeting
  `CREATE TABLE IF NOT EXISTS "Meeting" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId"   INTEGER,
    "divisionId"  INTEGER,
    "meetingDate" DATETIME NOT NULL,
    "title"       TEXT NOT NULL,
    "attendees"   TEXT NOT NULL,
    "summary"     TEXT NOT NULL,
    "decisions"   TEXT,
    "content"     TEXT,
    "tags"        TEXT,
    "source"      TEXT NOT NULL DEFAULT 'manual',
    "createdBy"   TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("projectId")  REFERENCES "Project"("id") ON DELETE CASCADE,
    FOREIGN KEY ("divisionId") REFERENCES "Division"("id")
  )`,

  // ActionItem
  `CREATE TABLE IF NOT EXISTS "ActionItem" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId"   INTEGER,
    "projectId"   INTEGER,
    "description" TEXT NOT NULL,
    "owner"       TEXT NOT NULL,
    "dueDate"     DATETIME NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'Open',
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("meetingId")  REFERENCES "Meeting"("id"),
    FOREIGN KEY ("projectId")  REFERENCES "Project"("id") ON DELETE CASCADE
  )`,

  // Issue
  `CREATE TABLE IF NOT EXISTS "Issue" (
    "id"               INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId"        INTEGER NOT NULL,
    "title"            TEXT NOT NULL,
    "description"      TEXT,
    "severity"         TEXT NOT NULL DEFAULT 'Med',
    "status"           TEXT NOT NULL DEFAULT 'Open',
    "owner"            TEXT,
    "needsVpAttention" INTEGER NOT NULL DEFAULT 0,
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
  )`,

  // KPI
  `CREATE TABLE IF NOT EXISTS "KPI" (
    "id"         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId"  INTEGER,
    "divisionId" INTEGER,
    "name"       TEXT NOT NULL,
    "unit"       TEXT NOT NULL,
    "target"     REAL,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("projectId")  REFERENCES "Project"("id") ON DELETE CASCADE,
    FOREIGN KEY ("divisionId") REFERENCES "Division"("id")
  )`,

  // KPIReading
  `CREATE TABLE IF NOT EXISTS "KPIReading" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kpiId"       INTEGER NOT NULL,
    "period"      TEXT NOT NULL,
    "actualValue" REAL NOT NULL,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE CASCADE
  )`,

  // User
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email"        TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role"         TEXT NOT NULL DEFAULT 'Viewer',
    "divisionId"   INTEGER,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
]

async function main() {
  console.log('🔧 Applying schema to Turso...')
  for (const sql of statements) {
    const tableName = sql.match(/"(\w+)"/)?.[1] ?? 'unknown'
    await db.execute(sql)
    console.log(`  ✅ ${tableName}`)
  }
  console.log('🎉 Schema applied successfully!')
}

main().catch(e => { console.error(e); process.exit(1) })
