import { createClient } from '@libsql/client'

const db = createClient({ url: 'file:./dev.db' })

const sql = `
CREATE TABLE IF NOT EXISTS "DiscordRecap" (
  "id"               INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "channelName"      TEXT NOT NULL,
  "threadTitle"      TEXT NOT NULL,
  "threadUrl"        TEXT,
  "rawMessages"      TEXT NOT NULL,
  "executiveSummary" TEXT NOT NULL,
  "alertLevel"       TEXT NOT NULL DEFAULT 'Normal',
  "detectedIssues"   TEXT,
  "actionItems"      TEXT,
  "projectId"        INTEGER,
  "divisionId"       INTEGER,
  "createdBy"        TEXT,
  "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL,
  FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL
);
`

async function main() {
  console.log('🔧 Creating DiscordRecap table in local dev.db…')
  await db.execute(sql)
  console.log('✅ Table DiscordRecap created successfully!')
}

main().catch(console.error)
