import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 Auth attempt:', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          environment: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        let adminUser
        try {
          adminUser = await prisma.adminUser.findUnique({
            where: {
              email: credentials.email
            }
          })
        } catch (dbError) {
          console.error('❌ Database error:', dbError)
          return null
        }

        console.log('👤 User found:', !!adminUser, adminUser?.isActive)

        if (!adminUser || !adminUser.isActive) {
          console.log('❌ User not found or inactive')
          return null
        }

        let isPasswordValid
        try {
          isPasswordValid = await bcrypt.compare(
            credentials.password,
            adminUser.passwordHash
          )
        } catch (bcryptError) {
          console.error('❌ Bcrypt error:', bcryptError)
          return null
        }

        console.log('🔑 Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          return null
        }

        // Update last login
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: adminUser.id.toString(),
          email: adminUser.email,
          name: `${adminUser.firstName} ${adminUser.lastName}`,
          role: adminUser.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}
