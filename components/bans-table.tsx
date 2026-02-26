"use client"

import { useState, useEffect } from "react"
import type { Ban } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Search, Trash2, Clock, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

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
  const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0, pages: 1 })
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
        limit: "6",
        searchTerm: searchTerm,
      })

      const response = await apiClient.get<BanPaginationResponse>(`/api/bans?${params}`)
      const data = response.data
      
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
      await apiClient.post(`/api/bans/${banId}/unban`)
      toast({
        title: "✅ Sucesso!",
        description: `O ban de ${banName} foi removido com sucesso.`,
      })
      setTimeout(() => {
        fetchBans()
      }, 1500)
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
    <Card className="bg-[#0a0a0a] border-zinc-900 shadow-xl mx-auto px-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-0.5 border-b border-zinc-900">
        <h2 className="text-xs font-semibold text-zinc-200">Bans <span className="text-zinc-600 font-normal ml-1">({pagination.total})</span></h2>
        <div className="relative w-32">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600" />
          <input
            placeholder="Buscar ban..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#111] border border-zinc-800 text-zinc-400 pl-8 pr-3 h-7 rounded-sm text-[11px] focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-800" /></div>
        ) : (
          <>
            <div className="px-6 py-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-900 hover:bg-transparent">
                    <TableHead className="py-1 pl-8 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Player</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Motivo</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Banido por</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Data do Ban</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">IP</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Sala</TableHead>
                    <TableHead className="py-1 pr-8 text-sm uppercase tracking-wider text-zinc-400 font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bans.map((ban) => (
                    <TableRow key={ban.id} className="border-zinc-900/50 hover:bg-zinc-900/40 transition-colors duration-150">
                      <TableCell className="py-1 pl-8 font-medium truncate max-w-xs">{ban.name}</TableCell>
                      <TableCell className="py-1 max-w-xs truncate">{ban.reason}</TableCell>
                      <TableCell className="py-1 max-w-xs truncate">{ban.banned_by}</TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          {format(new Date(ban.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 font-mono text-sm truncate max-w-xs">{ban.ipv4}</TableCell>
                      <TableCell className="py-1">
                        <Badge variant="outline">Sala {ban.room}</Badge>
                      </TableCell>
                      <TableCell className="py-1 pr-8 text-right">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {bans.map((ban) => (
                <div key={ban.id}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium mb-1 truncate">{ban.name}</div>
                        <div className="text-sm text-zinc-500">Banido por: {ban.banned_by}</div>
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
                    <div className="text-sm mb-3 p-2 bg-zinc-900 rounded">
                      <strong>Motivo:</strong> {ban.reason}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-zinc-500">
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
                </div>
              ))}
            </div>

            {Array.isArray(bans) && bans.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                {searchTerm ? "Nenhum ban encontrado com essa busca" : "Nenhum ban registrado"}
              </div>
            )}
          </>
        )}
      </CardContent>

        {/* Paginação fixa fora da área rolável (altura reduzida) */}
        <div className="py-1 px-6 border-t border-zinc-900 flex items-center justify-between bg-transparent">
          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Página {pagination.page} / {pagination.pages || 1}</p>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] uppercase font-bold text-zinc-500 hover:bg-zinc-900 hover:text-white disabled:opacity-30" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={pagination.page === 1 || loading}>Anterior</Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] uppercase font-bold text-zinc-500 hover:bg-zinc-900 hover:text-white disabled:opacity-30" onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))} disabled={pagination.page === pagination.pages || loading}>Próximo</Button>
          </div>
        </div>
      </Card>
  )
}
