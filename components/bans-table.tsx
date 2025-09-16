"use client"

import { useState } from "react"
import type { Ban } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Search, Trash2, Clock, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface BansTableProps {
  bans: Ban[]
}

export function BansTable({ bans }: BansTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState<number | null>(null)
  const router = useRouter()

  const filteredBans = bans.filter(
    (ban) =>
      ban.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ban.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ban.banned_by?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUnban = async (banId: number) => {
    setLoading(banId)
    try {
      const response = await fetch(`/api/bans/${banId}/unban`, {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error unbanning player:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Bans ({filteredBans.length})</span>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Banido por</TableHead>
                <TableHead>Data do Ban</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBans.map((ban, index) => (
                <motion.tr
                  key={ban.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{ban.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{ban.reason}</TableCell>
                  <TableCell>{ban.banned_by}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(ban.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{ban.ipv4}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Sala {ban.room}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnban(ban.id)}
                      disabled={loading === ban.id}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      {loading === ban.id ? "Removendo..." : "Remover Ban"}
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredBans.map((ban, index) => (
            <motion.div
              key={ban.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium mb-1">{ban.name}</div>
                    <div className="text-sm text-muted-foreground">Banido por: {ban.banned_by}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUnban(ban.id)} disabled={loading === ban.id}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {loading === ban.id ? "Removendo..." : "Remover Ban"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm mb-3 p-2 bg-muted rounded">
                  <strong>Motivo:</strong> {ban.reason}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(ban.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Sala {ban.room}</Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {ban.ipv4}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Nenhum ban encontrado</div>
        )}
      </CardContent>
    </Card>
  )
}
