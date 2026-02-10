"use client"

import { useSocket } from "@/hooks/use-socket"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function SocketStatus() {
  const { status, isConnected } = useSocket()

  if (status === "connecting") {
    return (
      <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Conectando...
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
        <Wifi className="h-3 w-3" />
        Online
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1 text-red-600 border-red-600">
      <WifiOff className="h-3 w-3" />
      Offline
    </Badge>
  )
}
