"use client"
import type React from "react"
import { logger } from "../../backend/src/lib/logger"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"


// Ícone do Discord (componente simples para não instalar uma biblioteca)
const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}>
    <path d="M20.317 4.36981C18.7994 3.13481 16.9945 2.24981 15 1.99981C15 1.99981 14.9459 2.27981 14.8979 2.54981C13.2304 2.11481 11.554 2.11481 9.89795 2.54981C9.84995 2.27981 9.80195 1.99981 9.80195 1.99981C7.81145 2.24981 6.00045 3.13481 4.48195 4.36981C1.61145 8.17481 0.957449 11.7508 1.22395 15.2238C3.39895 16.9188 5.61945 17.8488 7.82145 18.4528C8.11545 18.0478 8.38045 17.6218 8.60945 17.1688C7.66945 16.8438 6.78645 16.4278 5.97895 15.9378C6.15145 15.8238 6.32145 15.7038 6.48645 15.5788C9.55145 17.2948 13.2215 17.4888 16.5135 16.5188C17.1855 17.2488 17.9625 17.8598 18.8165 18.3448C19.5565 18.1068 20.2765 17.8328 20.9765 17.5228C22.0525 12.6088 22.2835 7.61881 20.317 4.36981ZM8.02145 13.6018C7.02145 13.6018 6.22145 12.6868 6.22145 11.5318C6.22145 10.3768 7.01545 9.46181 8.02145 9.46181C9.02745 9.46181 9.82145 10.3768 9.82145 11.5318C9.82145 12.6868 9.02745 13.6018 8.02145 13.6018ZM15.9785 13.6018C14.9785 13.6018 14.1785 12.6868 14.1785 11.5318C14.1785 10.3768 14.9725 9.46181 15.9785 9.46181C16.9845 9.46181 17.7785 10.3768 17.7785 11.5318C17.7785 12.6868 16.9845 13.6018 15.9785 13.6018Z" />
  </svg>
)
 
export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleDiscordSignIn = () => {
    setLoading(true)
    // Redireciona para o dashboard após o login bem-sucedido
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  // Função utilitária para garantir array
  function safeArray(val: any) {
    if (Array.isArray(val)) return val;
    if (val == null) return [];
    return [val];
  }

  // Exemplo de uso seguro:
  // Substitua 'props?.algumArray' pelo array real usado no componente
  // logger.debug('Array para .length', safeArray(props?.algumArray));
  // if (safeArray(props?.algumArray).length === 0) {
  //   logger.warn('Array vazio ou undefined');
  // }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight">Bore Admin</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Acesse o painel de moderação com sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  Acesso negado. Você não tem permissão ou sua conta Discord não está vinculada a um jogador.
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleDiscordSignIn} className="w-full h-12 text-lg" disabled={loading}>
              <DiscordIcon className="h-6 w-6 mr-2" />
              {loading ? "Aguarde..." : "Entrar com Discord"}
            </Button>
            <div className="mt-8 pt-6 border-t border-border/50 text-sm text-muted-foreground text-center">
              Apenas usuários com cargo de moderação podem acessar
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}