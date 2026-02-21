import { ApiReference } from '@scalar/nextjs-api-reference'
import { publicOpenApiSpec } from '@/lib/openapi-public'

// GET /docs/public — Documentação pública (sem autenticação)
export const GET = ApiReference({
  content: publicOpenApiSpec as Record<string, unknown>,
  theme: 'deepSpace',
  darkMode: true,
  forceDarkModeState: 'dark',
  hideDarkModeToggle: true,
  layout: 'modern',
  metaData: {
    title: 'Bore Gerenciador - API Pública',
    description: 'Documentação da API pública do Bore Gerenciador',
  },
})