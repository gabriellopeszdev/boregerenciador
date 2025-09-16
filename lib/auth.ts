import { getServerSession } from "next-auth/next"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPlayerByName } from "./queries"
import { hasPermission } from "./types"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const player = await getPlayerByName(credentials.username)

          if (!player || !hasPermission(player)) {
            return null
          }

          if (player.password !== credentials.password) {
            return null
          }

          return {
            id: player.id.toString(),
            name: player.name,
            email: `${player.name}@haxball.local`,
            role:
              player.ceo === 1
                ? "ceo"
                : player.diretor === 1
                  ? "diretor"
                  : player.admin === 1
                    ? "admin"
                    : player.gerente === 1
                      ? "gerente"
                      : "mod",
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
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
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
}

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}
