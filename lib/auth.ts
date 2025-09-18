// Local do arquivo: /lib/auth.ts

import { getServerSession } from "next-auth/next"
import type { AuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

// ESTA É A SUA ÚNICA E CORRETA CONFIGURAÇÃO
export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "identify email guilds.members.read",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "discord") {
        try {
          const guildId = process.env.DISCORD_GUILD_ID
          const requiredRoleId = process.env.DISCORD_STAFF_ROLE_ID

          if (!guildId || !requiredRoleId) {
            console.error("IDs do servidor ou do cargo não configurados no .env")
            return false
          }
          
          const response = await fetch(
            `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            }
          )

          if (!response.ok) {
            console.log("Usuário não encontrado no servidor do Discord.")
            return false
          }

          const member = await response.json()
          const hasRole = member.roles.includes(requiredRoleId)

          if (hasRole) {
            console.log("Login autorizado: usuário tem o cargo de staff.")
            return true
          } else {
            console.log("Login negado: usuário não tem o cargo de staff.")
            return false
          }
        } catch (error) {
          console.error("Erro ao verificar cargo no Discord:", error)
          return false
        }
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = "staff"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
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

export function getServerAuthSession() {
  return getServerSession(authOptions)
}