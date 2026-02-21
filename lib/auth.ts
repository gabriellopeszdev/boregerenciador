import { getServerSession } from "next-auth/next"
import type { AuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: {
        params: {
          // Adicionado 'guilds' para estabilidade da API
          scope: "identify email guilds guilds.members.read",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account }) {
      // Verifica se o usuário faz parte do Staff para permitir o LOGIN inicial
      if (account?.provider === "discord") {
        try {
          const guildId = process.env.DISCORD_GUILD_ID;
          const requiredRoleId = process.env.DISCORD_STAFF_ROLE_ID;

          if (!guildId || !requiredRoleId) return false;

          const response = await fetch(
            `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
            {
              headers: { Authorization: `Bearer ${account.access_token}` },
              cache: 'no-store' // Evita cache antigo no login
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            return false;
          }

          const member = await response.json();
          return member.roles && member.roles.includes(requiredRoleId);
        } catch (error) {
          console.error("Erro no signIn:", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, account }) {
      // Salva o token do Discord no JWT
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Passa o token do JWT para a Sessão (acessível via getServerAuthSession)
      if (token && session.user) {
        session.user.id = token.sub
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  // Limitar duração da sessão para 1 hora (3600 segundos)
  // Isso faz com que cookies/sessions antigos expirem rapidamente após atualizações
  // e reduz problemas com cookies antigos perdendo acesso após deploys.
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
  },
  jwt: {
    maxAge: 60 * 60, // 1 hora
  },
}

export function getServerAuthSession() {
  return getServerSession(authOptions)
}