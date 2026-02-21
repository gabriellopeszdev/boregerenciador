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
import { Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface ModPlayerDialogProps {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ModPlayerDialog({ player, open, onOpenChange, onSuccess }: ModPlayerDialogProps) {
  const [rooms, setRooms] = useState<string>("1")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddMod = async () => {
    if (!player || !rooms.trim()) return

    setLoading(true)
    try {
      const roomsArray = rooms.split(",").map(r => Number.parseInt(r.trim())).filter(r => !isNaN(r))
      
      if (roomsArray.length === 0) {
        toast({
          title: "❌ Erro!",
          description: "Insira pelo menos uma sala válida.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      await apiClient.post(`/api/players/${player.id}/mod`, {
          action: "add",
          rooms: roomsArray,
        }
      )

      toast({
        title: "✅ Sucesso!",
        description: `${player.name} agora é Mod nas salas ${roomsArray.join(", ")}.`,
      })
      setTimeout(() => {
        onOpenChange(false)
        setRooms("1")
        onSuccess?.()
      }, 1500)
    } catch (error) {
      console.error("[mod-dialog] Erro:", error)
      toast({
        title: "❌ Erro!",
        description: "Erro ao tentar adicionar mod.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMod = async () => {
    if (!player) return

    setLoading(true)
    try {
      await apiClient.post(`/api/players/${player.id}/mod`, {
          action: "remove",
        }
      )

      toast({
        title: "✅ Sucesso!",
        description: `Mod removido de ${player.name}.`,
      })
      setTimeout(() => {
        onOpenChange(false)
        setRooms("1")
        onSuccess?.()
      }, 1500)
    } catch (error) {
      console.error("[mod-dialog] Erro:", error)
      toast({
        title: "❌ Erro!",
        description: "Erro ao tentar remover mod.",
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
            <Zap className="h-5 w-5 text-blue-500" />
            Gerenciar Mod
          </DialogTitle>
          <DialogDescription>
            Você está gerenciando o status de mod do player <strong>{player?.name}</strong>
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

          {player?.mod && Array.isArray(player.mod) && player.mod.length > 0 && (
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
              <strong>Salas atuais:</strong> {player.mod.join(", ")}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveMod}
            disabled={loading}
          >
            {loading ? "Processando..." : "Remover Mod"}
          </Button>
          <Button
            type="button"
            onClick={handleAddMod}
            disabled={loading || !rooms.trim()}
          >
            {loading ? "Adicionando..." : "Adicionar Mod"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
