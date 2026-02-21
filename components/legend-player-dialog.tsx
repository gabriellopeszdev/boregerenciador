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
import { apiClient } from "@/lib/api-client"

interface LegendPlayerDialogProps {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LegendPlayerDialog({ player, open, onOpenChange, onSuccess }: LegendPlayerDialogProps) {
  const [rooms, setRooms] = useState<string>("1")
  const [expirationDate, setExpirationDate] = useState<string>("")
  const [tipo, setTipo] = useState<number>(4)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddLegend = async () => {
    if (!player || !expirationDate) return;

    setLoading(true);
    try {
      // Payload final: apenas 'tipo' e 'expiresAt'
      const payload = {
        action: "add",
        tipo,
        expiresAt: expirationDate,
      };
      await apiClient.post(`/api/players/${player.id}/legend`, payload);

      toast({
        title: "✅ Sucesso!",
        description: `${player.name} agora tem tipo=${tipo} até ${expirationDate}.`,
      });
      setTimeout(() => {
        onOpenChange(false);
        setRooms("1");
        setExpirationDate("");
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error("[legend-dialog] Erro:", error);
      toast({
        title: "❌ Erro!",
        description: "Erro ao tentar adicionar legend.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveLegend = async () => {
    if (!player) return

    setLoading(true)
    try {
      // Payload final: apenas 'tipo'
      await apiClient.post(`/api/players/${player.id}/legend`, {
        action: "remove",
        tipo,
      })

      toast({
        title: "✅ Sucesso!",
        description: `Legend removido de ${player.name}.`,
      })
      setTimeout(() => {
        onOpenChange(false)
        setRooms("1")
        setExpirationDate("")
        onSuccess?.()
      }, 1500)
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
            <Label htmlFor="rooms">Salas (separadas por vírgula)</Label>
            <Input
              id="rooms"
              placeholder="1,2,3"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Ex: 1,2,3 para salas 1, 2 e 3</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Data de Expiração</Label>
            <Input
              id="expiration"
              type="datetime-local"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(Number(e.target.value))}
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
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveLegend}
            disabled={loading}
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
