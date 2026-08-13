import { defineConfig } from 'prisma/config'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    adapter: () => {
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
      return new PrismaLibSql(libsql)
    },
  },
})
