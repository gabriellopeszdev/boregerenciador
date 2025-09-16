import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPlayerByName } from "@/lib/queries"
// Importe as duas funções auxiliares do seu arquivo de tipos
import { hasPermission, getPlayerRole } from "@/lib/types" 
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
          console.log("Missing credentials")
          return null
        }

        try {
          console.log("Attempting login for username:", credentials.username)
          const player = await getPlayerByName(credentials.username)

          if (!player) {
            console.log("Player not found in database")
            return null
          }

          // console.log("Player found:", {
          //   id: player.id,
          //   name: player.name,
          //   ceo: player.ceo,
          //   diretor: player.diretor,
          //   admin: player.admin,
          //   gerente: player.gerente,
          //   mod: player.mod,
          // })

          if (!hasPermission(player)) {
            console.log("Player does not have required permissions")
            return null
          }

          console.log("Player has permissions, checking password")

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            player.password as string 
          )

          if (!passwordMatch) {
            console.log("Password mismatch")
            return null
          }

          console.log("Login successful")


          const role = getPlayerRole(player)

          const rooms = player.admin || player.gerente || player.mod || null

          return {
            id: player.id.toString(),
            name: player.name,
            email: `${player.name}@haxball.local`,
            role: role,
            rooms: rooms,
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
        token.rooms = user.rooms
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
        session.user.rooms = token.rooms as number[] | null 
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }