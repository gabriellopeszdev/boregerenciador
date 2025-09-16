import { withAuth } from "next-auth/middleware"

const authorizedRoles = ["ceo", "diretor", "admin", "gerente", "mod"]

export default withAuth(
  function middleware(req) {
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) {
          return false
        }
        return authorizedRoles.includes(token.role as string)
      },
    },
  },
)

export const config = {
  // Protege todas as rotas que começam com /dashboard
  matcher: ["/dashboard/:path*"],
}