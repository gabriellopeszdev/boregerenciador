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
import { Ban } from "lucide-react"

interface BanPlayerDialogProps {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: any // Você pode querer tipar isso melhor depois
}

export function BanPlayerDialog({ player, open, onOpenChange, currentUser }: BanPlayerDialogProps) {
  const [reason, setReason] = useState("")
  const [conn, setConn] = useState("")
  const [ipv4, setIpv4] = useState("")
  const [auth, setAuth] = useState("")
  const [room, setRoom] = useState("1")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (player) {
      setConn(player.conn || "")
      setIpv4(player.ipv4 || "")
      setAuth(player.auth || "")
      setRoom((player.room || 1).toString())
    }
  }, [player])

  const handleBan = async () => {
    if (!player || !reason.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/bans", {
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
          room: parseInt(room) || 1, // Usando parseInt aqui para garantir que é um número
        }),
      })

      if (response.ok) {
        onOpenChange(false)
        setReason("")
        setConn("")
        setIpv4("")
        setAuth("")
        setRoom("1")
        router.refresh()
      }
    } catch (error) {
      console.error("Error banning player:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Banir Player
          </DialogTitle>
          <DialogDescription>
            Você está prestes a banir o player <strong>{player?.name}</strong>. Esta
            ação pode ser revertida posteriormente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do ban</Label>
            <Textarea
              id="reason"
              placeholder="Digite o motivo do ban..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conn">Conexão</Label>
              <Input id="conn" placeholder="ID da conexão" value={conn} onChange={(e) => setConn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipv4">IP</Label>
              <Input id="ipv4" placeholder="Endereço IP" value={ipv4} onChange={(e) => setIpv4(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auth">Auth</Label>
              <Input
                id="auth"
                placeholder="Token de autenticação"
                value={auth}
                onChange={(e) => setAuth(e.target.value)}
                type="password" 
                readOnly       
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
          <Button variant="destructive" onClick={handleBan} disabled={loading || !reason.trim()}>
            {loading ? "Banindo..." : "Banir Player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}