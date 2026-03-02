import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/types"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as never,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          barangayId: user.barangayId,
          residentId: user.residentId,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role
        token.barangayId = (user as { barangayId?: string }).barangayId
        token.residentId = (user as { residentId?: string }).residentId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string; role?: string; barangayId?: string; residentId?: string }).id = token.sub
        ;(session.user as { id?: string; role?: string; barangayId?: string; residentId?: string }).role = token.role as string
        ;(session.user as { id?: string; role?: string; barangayId?: string; residentId?: string }).barangayId = token.barangayId as string
        ;(session.user as { id?: string; role?: string; barangayId?: string; residentId?: string }).residentId = token.residentId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
