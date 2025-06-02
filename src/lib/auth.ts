import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

interface UserWithUsername {
  username: string
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Authorize called with:', credentials)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        console.log('Found user:', user ? { id: user.id, email: user.email } : null)

        if (!user) {
          console.log('User not found')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('Invalid password')
          return null
        }

        const result = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        }
        
        console.log('Returning user:', result)
        return result
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.username = (user as UserWithUsername).username
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.username = token.username as string
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  }
} 