"use client"

import { useState, useEffect } from "react"
import type { Mute } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"
import { Search, Volume2, Clock, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface MutePaginationResponse {
  data: Mute[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function MutesTable() {
  const [mutes, setMutes] = useState<Mute[]>([])
  const [loading, setLoading] = useState(false)
  const [unmuteLoading, setUnmuteLoading] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const { toast } = useToast()

  useEffect(() => {
    fetchMutes()
  }, [currentPage, searchTerm])

  const fetchMutes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        searchTerm: searchTerm,
      })

      const response = await fetch(`/api/mutes?${params}`)
      if (!response.ok) throw new Error("Falha ao buscar mutes")

      const data: MutePaginationResponse = await response.json()
      
      setMutes(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error("[mutes-table] Erro ao buscar mutes:", error)
      toast({
        title: "❌ Erro!",
        description: "Falha ao carregar mutes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnmute = async (muteId: number, muteName: string) => {
    setUnmuteLoading(muteId)
    try {
      const response = await fetch(`/api/mutes/${muteId}/unmute`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "✅ Sucesso!",
          description: `O mute de ${muteName} foi removido com sucesso.`,
        })
        setTimeout(() => {
          fetchMutes()
        }, 1500)
      } else {
        toast({
          title: "❌ Erro!",
          description: `Falha ao remover o mute de ${muteName}.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[mutes-table] Erro ao desmutar:", error)
      toast({
        title: "❌ Erro!",
        description: `Erro ao tentar remover o mute de ${muteName}.`,
        variant: "destructive",
      })
    } finally {
      setUnmuteLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Mutes ({pagination.total})</span>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mute..."
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
                    <TableHead>Mutado por</TableHead>
                    <TableHead>Data do Mute</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mutes.map((mute, index) => (
                    <motion.tr
                      key={mute.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {(mute as any).name || `Player #${mute.id}`}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {mute.reason}
                      </TableCell>
                      <TableCell>
                        {(mute as any).muted_by || `${mute.muted_by}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(mute.time), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={mute.active ? "default" : "secondary"}
                          className={mute.active ? "bg-orange-600" : ""}
                        >
                          {mute.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            handleUnmute(mute.id, (mute as any).name || "Jogador")
                          }}
                          disabled={unmuteLoading === mute.id}
                          className="gap-1"
                        >
                          <Volume2 className="h-3 w-3" />
                          {unmuteLoading === mute.id ? "Desmutando..." : "Desmutar"}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {mutes.map((mute, index) => (
                <motion.div
                  key={mute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium mb-1">
                          {(mute as any).name || `Player #${mute.id}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mutado por: {(mute as any).muted_by || `User #${mute.muted_by}`}
                        </div>
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
                              handleUnmute(mute.id, (mute as any).name || "Jogador")
                            }}
                            disabled={unmuteLoading === mute.id}
                          >
                            <Volume2 className="h-4 w-4 mr-2" />
                            {unmuteLoading === mute.id ? "Desmutando..." : "Desmutar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm mb-3 p-2 bg-muted rounded">
                      <strong>Motivo:</strong> {mute.reason}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(mute.time), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                      <Badge
                        variant={mute.active ? "default" : "secondary"}
                        className={mute.active ? "bg-orange-600" : ""}
                      >
                        {mute.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {mutes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhum mute encontrado com essa busca" : "Nenhum mute registrado"}
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
