import { ApiReference } from '@scalar/nextjs-api-reference'
import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { getUserRoles } from '@/lib/discord-roles'
import { privateOpenApiSpec } from '@/lib/openapi-private'

// Handler do Scalar (pré-configurado)
const scalarHandler = ApiReference({
  content: privateOpenApiSpec as Record<string, unknown>,
  theme: 'deepSpace',
  darkMode: true,
  forceDarkModeState: 'dark',
  hideDarkModeToggle: true,
  layout: 'modern',
  metaData: {
    title: 'Bore Gerenciador - API Privada (Admin)',
    description: 'Documentação da API administrativa do Bore Gerenciador',
  },
})

// GET /docs/private — Documentação privada (requer Dono, Diretor ou Gerente)
export async function GET() {
  // 1. Verificar autenticação
  const session = await getServerAuthSession()
  if (!session) {
    return NextResponse.json(
      { error: 'Não autenticado. Faça login em /login primeiro.' },
      { status: 401 }
    )
  }

  // 2. Verificar cargo (Dono, Diretor ou Gerente)
  const roles = await getUserRoles()
  if (!roles.isCEO && !roles.isDiretor && !roles.isGerente) {
    return NextResponse.json(
      {
        error: 'Sem permissão',
        message: 'Apenas Dono, Diretor ou Gerente podem acessar a documentação privada.',
      },
      { status: 403 }
    )
  }

  // 3. Se tem permissão, renderizar o Scalar
  return scalarHandler()
}
