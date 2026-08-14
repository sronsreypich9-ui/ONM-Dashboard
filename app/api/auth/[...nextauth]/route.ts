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
        const prisma = getPrisma()
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: inputLower },
                { name: userInput },
                { email: { contains: inputLower } },
                { name: { contains: userInput } },
              ],
            },
          })
          if (!user) return null

          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null

          return {
            id:         String(user.id),
            email:      user.email,
            name:       user.name,
            role:       user.role,
            divisionId: user.divisionId ? String(user.divisionId) : null,
          }
        } finally {
          await prisma.$disconnect()
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8-hour session
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
