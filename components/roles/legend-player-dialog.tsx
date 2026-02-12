"use client"

import { useState } from "react"
import type { Player } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LegendPlayerDialogProps {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LegendPlayerDialog({ player, open, onOpenChange, onSuccess }: LegendPlayerDialogProps) {
  const [expirationDate, setExpirationDate] = useState<string>("")
  const [vipLevel, setVipLevel] = useState<number>(4)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddLegend = async () => {
    if (!player || !expirationDate) return

    setLoading(true)
    try {
      const response = await fetch(`/api/players/${player.id}/legend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          vipLevel,
          expirationDate,
        }),
      })

      if (response.ok) {
        toast({
          title: "✅ Sucesso!",
          description: `${player.name} agora tem vip=${vipLevel} até ${expirationDate}.`,
        })
        setTimeout(() => {
          onOpenChange(false)
          setExpirationDate("")
          onSuccess?.()
        }, 1500)
      } else {
        const data = await response.json()
        toast({
          title: "❌ Erro!",
          description: data.error || "Falha ao adicionar legend.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[legend-dialog] Erro:", error)
      toast({
        title: "❌ Erro!",
        description: "Erro ao tentar adicionar legend.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLegend = async () => {
    if (!player) return

    setLoading(true)
    try {
      const response = await fetch(`/api/players/${player.id}/legend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "remove",
        }),
      })

      if (response.ok) {
        toast({
          title: "✅ Sucesso!",
          description: `Legend removido de ${player.name}.`,
        })
        setTimeout(() => {
          onOpenChange(false)
          setExpirationDate("")
          onSuccess?.()
        }, 1500)
      } else {
        const data = await response.json()
        toast({
          title: "❌ Erro!",
          description: data.error || "Falha ao remover legend.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[legend-dialog] Erro:", error)
      toast({
        title: "❌ Erro!",
        description: "Erro ao tentar remover legend.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Gerenciar Legend
          </DialogTitle>
          <DialogDescription>
            Você está gerenciando o status de legend do player <strong>{player?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="expiration">Data e Hora de Expiração</Label>
              <Input
                id="expiration"
                type="datetime-local"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                disabled={loading}
              />
            <p className="text-xs text-muted-foreground">Formato: YYYY-MM-DD HH:mm</p>
          </div>

            <div className="space-y-2">
              <Label htmlFor="vipLevel">Tipo</Label>
              <select
                id="vipLevel"
                value={vipLevel}
                onChange={(e) => setVipLevel(Number(e.target.value))}
                className="w-full rounded border bg-background p-2"
                disabled={loading}
              >
                <option value={3}>VIP (3)</option>
                <option value={4}>Legend (4)</option>
              </select>
            </div>

          {player?.vip === 4 && (
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
              <strong>Status atual:</strong> Legend ativo
              {player.expired_vip && (
                <div className="text-xs mt-1">Expira em: {player.expired_vip}</div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveLegend}
            disabled={loading || player?.vip !== 4}
          >
            {loading ? "Processando..." : "Remover Legend"}
          </Button>
          <Button
            type="button"
            onClick={handleAddLegend}
            disabled={loading || !expirationDate}
          >
            {loading ? "Adicionando..." : "Adicionar Legend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
