import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // Essential NextAuth configuration
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required")
          }

          // Check if database is available
          try {
            await db.$connect()
          } catch (dbError) {
            console.error("Database connection error:", dbError)
            throw new Error("Database connection failed. Please check your database configuration.")
          }

          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            throw new Error("Invalid credentials")
          }

          if (!user.isActive) {
            throw new Error("Account is deactivated")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Invalid credentials")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          // Return null instead of throwing to avoid NextAuth configuration errors
          return null
        }
      }
    }),
    // Only add Google provider if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : [])
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = user.role
        token.id = user.id
      }

      // Handle Google OAuth
      if (account?.provider === "google") {
        try {
          // Find or create user in database
          let dbUser = await db.user.findUnique({
            where: { email: token.email! }
          })

          if (!dbUser) {
            // Create new user from Google OAuth
            dbUser = await db.user.create({
              data: {
                email: token.email!,
                name: token.name!,
                image: token.picture,
                role: "EMPLOYEE",
                isActive: true
              }
            })
          }

          token.role = dbUser.role
          token.id = dbUser.id
        } catch (error) {
          console.error("Google OAuth user creation error:", error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },

    async signIn({ user: _user, account: _account, profile: _profile }) {
      // Allow sign in for all providers
      return true
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect to dashboard after successful login
      return `${baseUrl}/dashboard`
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn({ user: _user, account: _account, isNewUser: _isNewUser }) {
      console.log(`User ${_user.email} signed in via ${_account?.provider}`)
    },
    async signOut({ session: _session, token: _token }) {
      console.log(`User signed out`)
    },
  },

  debug: process.env.NODE_ENV === "development",
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}
