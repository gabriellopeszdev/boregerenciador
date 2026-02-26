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
import { Search, Volume2, Clock, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

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
  const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0, pages: 1 })
  const { toast } = useToast()

  useEffect(() => {
    fetchMutes()
  }, [currentPage, searchTerm])

  const fetchMutes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "6",
        searchTerm: searchTerm,
      })

      const response = await apiClient.get<MutePaginationResponse>(`/api/mutes?${params}`)
      const data = response.data
      
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
      await apiClient.post(`/api/mutes/${muteId}/unmute`)
      toast({
        title: "✅ Sucesso!",
        description: `O mute de ${muteName} foi removido com sucesso.`,
      })
      setTimeout(() => {
        fetchMutes()
      }, 1500)
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
    <Card className="bg-[#0a0a0a] border-zinc-900 shadow-xl mx-auto px-2">
      <div className="flex items-center justify-between px-3 py-0.5 border-b border-zinc-900">
        <h2 className="text-xs font-semibold text-zinc-200">Mutes <span className="text-zinc-600 font-normal ml-1">({pagination.total})</span></h2>
        <div className="relative w-32">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600" />
          <input
            placeholder="Buscar mute..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#111] border border-zinc-800 text-zinc-400 pl-8 pr-3 h-7 rounded-sm text-[11px] focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-zinc-800" /></div>
        ) : (
          <>
            <div className="px-6 py-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-900 hover:bg-transparent">
                    <TableHead className="py-1 pl-8 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Player</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Motivo</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Mutado por</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Data do Mute</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Status</TableHead>
                    <TableHead className="py-1 pr-8 text-sm uppercase tracking-wider text-zinc-400 font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mutes.map((mute) => (
                    <TableRow key={mute.id} className="border-zinc-900/50 hover:bg-zinc-900/40 transition-colors duration-150">
                      <TableCell className="py-1 pl-8 font-medium">{(mute as any).name || `Player #${mute.id}`}</TableCell>
                      <TableCell className="py-1 max-w-xs truncate">{mute.reason}</TableCell>
                      <TableCell className="py-1">{(mute as any).muted_by || `${mute.muted_by}`}</TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          {format(new Date(mute.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge variant={mute.active ? "default" : "secondary"} className={mute.active ? "bg-orange-600" : ""}>{mute.active ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="py-1 pr-8 text-right">
                        <Button type="button" size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handleUnmute(mute.id, (mute as any).name || "Jogador") }} disabled={unmuteLoading === mute.id} className="gap-1">
                          <Volume2 className="h-3 w-3" />
                          {unmuteLoading === mute.id ? "Desmutando..." : "Desmutar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="lg:hidden space-y-4">
              {mutes.map((mute) => (
                <div key={mute.id}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium mb-1">{(mute as any).name || `Player #${mute.id}`}</div>
                        <div className="text-sm text-zinc-500">Mutado por: {(mute as any).muted_by || `User #${mute.muted_by}`}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleUnmute(mute.id, (mute as any).name || "Jogador") }} disabled={unmuteLoading === mute.id}>
                            <Volume2 className="h-4 w-4 mr-2" />
                            {unmuteLoading === mute.id ? "Desmutando..." : "Desmutar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm mb-3 p-2 bg-zinc-900 rounded">
                      <strong>Motivo:</strong> {mute.reason}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Clock className="h-4 w-4" />
                        {format(new Date(mute.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                      <Badge variant={mute.active ? "default" : "secondary"} className={mute.active ? "bg-orange-600" : ""}>{mute.active ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {Array.isArray(mutes) && mutes.length === 0 && (
              <div className="text-center py-8 text-zinc-500">{searchTerm ? "Nenhum mute encontrado com essa busca" : "Nenhum mute registrado"}</div>
            )}
          </>
        )}
      </CardContent>

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
