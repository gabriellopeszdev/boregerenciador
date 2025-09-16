import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPlayerByName } from "@/lib/queries"
import { hasPermission } from "@/lib/types"
import bcrypt from "bcrypt"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("[v0] Missing credentials")
          return null
        }

        try {
          console.log("[v0] Attempting login for username:", credentials.username)
          const player = await getPlayerByName(credentials.username)

          if (!player) {
            console.log("[v0] Player not found in database")
            return null
          }

          console.log("[v0] Player found:", {
            id: player.id,
            name: player.name,
            ceo: player.ceo,
            diretor: player.diretor,
            admin: player.admin,
            gerente: player.gerente,
            mod: player.mod,
          })

          if (!hasPermission(player)) {
            console.log("[v0] Player does not have required permissions")
            return null
          }

          console.log("[v0] Player has permissions, checking password")
          
          // --- AQUI ESTÁ A CORREÇÃO ---
          // Compara a senha fornecida com a senha hasheada do banco de dados
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            player.password
          )

          if (!passwordMatch) {
            console.log("[v0] Password mismatch")
            return null
          }
          // --- FIM DA CORREÇÃO ---

          console.log("[v0] Login successful")
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
          console.error("[v0] Auth error:", error)
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
})

export { handler as GET, handler as POST }