"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { VolumeX } from "lucide-react"

interface MutePlayerDialogProps {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: any
}

export function MutePlayerDialog({ player, open, onOpenChange, currentUser }: MutePlayerDialogProps) {
  const [reason, setReason] = useState("")
  const [conn, setConn] = useState("")
  const [ipv4, setIpv4] = useState("")
  const [auth, setAuth] = useState("")
  // highlight-next-line
  const [room, setRoom] = useState("0") // Alterado para iniciar com "0"
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (player) {
      setConn(player.conn || "")
      setIpv4(player.ipv4 || "")
      setAuth(player.auth || "")
      // highlight-next-line
      setRoom((player.room ?? 0).toString()) // Alterado para tratar o caso de a sala ser 0
    }
  }, [player])

  const handleMute = async () => {
    if (!player || !reason.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/mutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: player.name,
          reason: reason.trim(),
          conn: conn.trim(),
          ipv4: ipv4.trim(),
          auth: auth.trim(),
          // highlight-next-line
          room: parseInt(room) ?? 0, // Alterado para tratar o caso de a sala ser 0
        }),
      })

      if (response.ok) {
        onOpenChange(false)
        setReason("")
        setConn("")
        setIpv4("")
        setAuth("")
        // highlight-next-line
        setRoom("0") // Alterado para resetar para "0"
        router.refresh()
      }
    } catch (error) {
      console.error("Error muting player:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5 text-orange-500" />
            Mutar Player
          </DialogTitle>
          <DialogDescription>
            Você está prestes a mutar o player <strong>{player?.name}</strong>. Esta
            ação pode ser revertida posteriormente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do mute</Label>
            <Textarea
              id="reason"
              placeholder="Digite o motivo do mute..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conn">Conexão</Label>
              <Input id="conn" value={conn} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipv4">IP</Label>
              <Input id="ipv4" value={ipv4} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auth">Auth</Label>
              <Input
                id="auth"
                value={auth}
                readOnly

                type="password" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Sala</Label>
               <Input
                id="room"
                type="number"
                placeholder="0"
                value={room}
                min="0" 
                onChange={(e) => {
                  if (e.target.value === "" || parseInt(e.target.value) >= 0) {
                    setRoom(e.target.value)
                  }
                }}

              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleMute}
            disabled={loading || !reason.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? "Mutando..." : "Mutar Player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}