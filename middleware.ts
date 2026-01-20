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
   * - / (home) e /login
   * - api, _next/static, _next/image (arquivos internos)
   * - _vercel (analytics que está dando erro de MIME)
   * - favicon.ico e logobore.png (arquivos na raiz da pasta public)
   */
  '/((?!api|_next/static|_next/image|_vercel|favicon.ico|logobore.png|login|$).*)',
],
}