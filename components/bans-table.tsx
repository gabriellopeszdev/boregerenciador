"use client"

import { useState, useEffect } from "react"
import type { Ban } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Search, Trash2, Clock, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface BanPaginationResponse {
  data: Ban[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function BansTable() {
  const [bans, setBans] = useState<Ban[]>([])
  const [loading, setLoading] = useState(false)
  const [unbanLoading, setUnbanLoading] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBans()
  }, [currentPage, searchTerm])

  const fetchBans = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        searchTerm: searchTerm,
      })

      const response = await fetch(`/api/bans?${params}`)
      if (!response.ok) throw new Error("Falha ao buscar bans")

      const data: BanPaginationResponse = await response.json()
      
      setBans(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error("[bans-table] Erro ao buscar bans:", error)
      toast({
        title: "❌ Erro!",
        description: "Falha ao carregar bans.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnban = async (banId: number, banName: string) => {
    setUnbanLoading(banId)
    try {
      const response = await fetch(`/api/bans/${banId}/unban`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "✅ Sucesso!",
          description: `O ban de ${banName} foi removido com sucesso.`,
        })
        setTimeout(() => {
          fetchBans()
        }, 1500)
      } else {
        toast({
          title: "❌ Erro!",
          description: `Falha ao remover o ban de ${banName}.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[bans-table] Erro ao desbanir:", error)
      toast({
        title: "❌ Erro!",
        description: `Erro ao tentar remover o ban de ${banName}.`,
        variant: "destructive",
      })
    } finally {
      setUnbanLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Bans ({pagination.total})</span>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ban..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <>
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
                  {bans.map((ban, index) => (
                    <motion.tr
                      key={ban.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium truncate max-w-xs">{ban.name}</TableCell>
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
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            handleUnban(ban.id, ban.name || "Jogador")
                          }}
                          disabled={unbanLoading === ban.id}
                          className="gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {unbanLoading === ban.id ? "Removendo..." : "Remover Ban"}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {bans.map((ban, index) => (
                <motion.div
                  key={ban.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium mb-1 truncate">{ban.name}</div>
                        <div className="text-sm text-muted-foreground">Banido por: {ban.banned_by}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              handleUnban(ban.id, ban.name || "Jogador")
                            }}
                            disabled={unbanLoading === ban.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {unbanLoading === ban.id ? "Removendo..." : "Remover Ban"}
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

            {bans.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhum ban encontrado com essa busca" : "Nenhum ban registrado"}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.pages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
