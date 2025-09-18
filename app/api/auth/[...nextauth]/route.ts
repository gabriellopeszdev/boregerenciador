import NextAuth, { AuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

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
      // Este callback agora é o único portão de entrada.
      if (account?.provider === "discord") {
        try {
          const guildId = process.env.DISCORD_GUILD_ID
          const requiredRoleId = process.env.DISCORD_STAFF_ROLE_ID
          

          if (!guildId || !requiredRoleId) {
            console.error("IDs do servidor ou do cargo não configurados no .env")
            return false // Impede o login se as variáveis não estiverem definidas
          }

          // 1. Fazer a chamada à API do Discord para pegar os dados do membro no seu servidor
          const response = await fetch(
            `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            }
          )

          // Se a resposta não for OK, o usuário provavelmente não está no servidor
          if (!response.ok) {
            console.log("Usuário não encontrado no servidor do Discord.")
            return false
          }

          const member = await response.json()
          
          // 2. Verificar se o usuário tem o cargo necessário
          const hasRole = member.roles.includes(requiredRoleId)

          if (hasRole) {
            console.log("Login autorizado: usuário tem o cargo de staff.")
            return true // Permite o login
          } else {
            console.log("Login negado: usuário não tem o cargo de staff.")
            return false // Nega o login
          }

        } catch (error) {
          console.error("Erro ao verificar cargo no Discord:", error)
          return false
        }
      }
      return false // Bloqueia qualquer outro tipo de login
    },

    async jwt({ token, user }) {
      // Se o usuário passou pelo `signIn`, ele é um staff.
      // Adicionamos essa informação ao token.
      if (user) {
        token.role = "staff"
      }
      return token
    },

    async session({ session, token }) {
      // Passa a informação do 'role' para a sessão do cliente.
      if (token && session.user) {
        session.user.id = token.sub // ID do usuário do Discord
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }