import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

function getPrisma() {
  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL || 'file:./dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  return new PrismaClient({ adapter })
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'onm-bu-dashboard-vp-secret-2026-key',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'User Name', type: 'text' },
        password: { label: 'Password',  type: 'password' },
      },
      async authorize(credentials) {
        const userInput = (credentials?.username || (credentials as any)?.email || '').trim()
        if (!userInput || !credentials?.password) return null

        const inputLower = userInput.toLowerCase()
        const pw = credentials.password.trim()

        // 1. Check database for any registered user (Viewers, Editors, Admins created in app)
        const prisma = getPrisma()
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: inputLower },
                { name: userInput },
                { email: { contains: inputLower.replace(/\s+/g, '') } },
                { name: { contains: userInput } },
              ],
            },
          })

          if (user) {
            const valid = await bcrypt.compare(pw, user.passwordHash)
            if (valid) {
              return {
                id:         String(user.id),
                email:      user.email,
                name:       user.name,
                role:       user.role,
                divisionId: user.divisionId ? String(user.divisionId) : null,
              }
            }
          }
        } catch (dbErr) {
          console.error('Database auth lookup error:', dbErr)
        } finally {
          await prisma.$disconnect()
        }

        // 2. Fallback for VP. Tann Tourthang as Viewer
        const isTannViewer =
          inputLower.includes('tann') ||
          inputLower.includes('tourthang') ||
          inputLower.includes('vptanntourthang')

        if (isTannViewer && (pw === '1108' || pw === '1234' || pw.toLowerCase() === 'viewer@1234')) {
          return {
            id: '2',
            email: 'vptanntourthang@onm.com',
            name: 'VP. Tann Tourthang',
            role: 'Viewer',
            divisionId: null,
          }
        }

        // 3. Fallback for Sron Sreypich as VP Admin
        const isSronAdmin =
          inputLower === 'sron sreypich' ||
          inputLower === 'admin@onm.com' ||
          inputLower === 'admin'

        const isPwMatch =
          pw === '1108' ||
          pw === 'Admin@1234' ||
          pw.toLowerCase() === 'admin1234'

        if (isSronAdmin && isPwMatch) {
          return {
            id: '1',
            email: 'admin@onm.com',
            name: 'Sron Sreypich',
            role: 'Admin',
            divisionId: null,
          }
        }

        return null
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role       = (user as any).role
        token.divisionId = (user as any).divisionId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role       = token.role       as string | undefined
        (session.user as any).divisionId = token.divisionId as string | null | undefined
        (session.user as any).id         = token.sub
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
