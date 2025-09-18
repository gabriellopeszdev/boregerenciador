import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Protege todas as rotas, exceto:
     * - /api (rotas de API)
     * - /_next/static (arquivos estáticos)
     * - /_next/image (arquivos de imagem)
     * - favicon.ico (ícone)
     * - /login (página de login, para quebrar o loop)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}