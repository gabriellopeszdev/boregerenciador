"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Props {
  initialIsCeo?: boolean | null
}

export default function ResetVipButton({ initialIsCeo = null }: Props) {
  const { data: session } = useSession()
  const [isCeo, setIsCeo] = useState<boolean | null>(initialIsCeo)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const check = async () => {
      try {
        const resp = await fetch('/api/config/is-ceo')
        if (resp.ok) {
          const json = await resp.json()
          if (json.isCeo) {
            setIsCeo(true)
            return
          }
        }

        // fallback: if server doesn't confirm, POST client token so server can check Discord
        if (session?.accessToken) {
          const postResp = await fetch('/api/config/is-ceo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session.accessToken }),
          })
          if (postResp.ok) {
            const json = await postResp.json()
            setIsCeo(Boolean(json.isCeo))
            return
          }
        }

        setIsCeo(false)
      } catch (err) {
        console.error('[reset-vip-button] erro ao checar is-ceo:', err)
        setIsCeo(false)
      }
    }

    check()
  }, [session])

  if (isCeo === null) return null
  if (!isCeo) return null

  const handleReset = async () => {
    if (!confirm("Tem certeza que deseja resetar o VIP de todos os players para 0? Esta ação não pode ser desfeita.")) return

    setLoading(true)
    try {
      const resp = await fetch("/api/config/reset-vip", { method: "POST" })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        toast({ title: "Erro ao resetar", description: err?.error || "Erro desconhecido", variant: "destructive" })
        setLoading(false)
        return
      }

      toast({ title: "Sucesso", description: "Todos os VIPs foram resetados para 0" })
    } catch (err) {
      console.error('[reset-vip-button] erro ao chamar API:', err)
      toast({ title: "Erro ao resetar", description: "Verifique o console do servidor", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleReset} disabled={loading}>
      <Crown className="h-4 w-4 mr-2" />
      Resetar VIPs (CEO)
    </Button>
  )
}
