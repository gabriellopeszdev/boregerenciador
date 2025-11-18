"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Search, Crown, Zap, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { LegendPlayerDialog } from "./roles/legend-player-dialog"
import { ModPlayerDialog } from "./roles/mod-player-dialog"

const API_URL = "/api/players"
const PLAYERS_PER_PAGE = 10

interface RolesTableProps {
  currentUser: Player | null
}

export function RolesTable({ currentUser }: RolesTableProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [legendDialogOpen, setLegendDialogOpen] = useState(false)
  const [modDialogOpen, setModDialogOpen] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [currentPage, searchTerm])

  const fetchPlayers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PLAYERS_PER_PAGE.toString(),
        searchTerm: searchTerm,
      })

      console.log(`[roles-table] Buscando players - página ${currentPage}, busca: "${searchTerm}"`)

      const response = await fetch(`${API_URL}?${params}`)
      if (!response.ok) throw new Error("Failed to fetch players")

      const data = await response.json()
      console.log(`[roles-table] Recebido ${data.players.length} de ${data.totalCount} players`)
      
      setPlayers(data.players)
      setTotalCount(data.totalCount)
    } catch (error) {
      console.error("[roles-table] Erro ao buscar players:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PLAYERS_PER_PAGE)

  const handleLegendPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setLegendDialogOpen(true)
  }

  const handleModPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setModDialogOpen(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>Players ({totalCount})</span>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar player..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Legend</TableHead>
                      <TableHead>Mod</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player, index) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-sm">{player.id}</TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          {player.vip === 4 ? (
                            <Badge className="bg-yellow-500/20 text-yellow-300 gap-1">
                              <Crown className="h-3 w-3" />
                              Legend
                            </Badge>
                          ) : player.vip === 3 ? (
                            <Badge className="bg-emerald-600/20 text-emerald-300 gap-1">
                              VIP
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {player.mod && (Array.isArray(player.mod) ? player.mod.length > 0 : Boolean(player.mod)) ? (
                            <Badge className="bg-blue-500/20 text-blue-300 gap-1">
                              <Zap className="h-3 w-3" />
                              {Array.isArray(player.mod) ? JSON.stringify(player.mod) : String(player.mod)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={player.loggedin === 1 ? "default" : "secondary"}>
                            {player.loggedin === 1 ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLegendPlayer(player)}
                              className="gap-1"
                            >
                              <Crown className="h-3 w-3" />
                              Legend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleModPlayer(player)}
                              className="gap-1"
                            >
                              <Zap className="h-3 w-3" />
                              Mod
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
                {players.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Nenhum player encontrado</div>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{player.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {player.id}</div>
                        </div>
                        <Badge variant={player.loggedin === 1 ? "default" : "secondary"}>
                          {player.loggedin === 1 ? "Online" : "Offline"}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <strong>Legend:</strong>{" "}
                          {player.vip === 4 ? (
                            <Badge className="ml-1 bg-yellow-500/20 text-yellow-300">Legend</Badge>
                          ) : player.vip === 3 ? (
                            <Badge className="ml-1 bg-emerald-600/20 text-emerald-300">VIP</Badge>
                          ) : (
                            <Badge className="ml-1" variant="secondary">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm">
                          <strong>Mod:</strong>{" "}
                          {player.mod && (Array.isArray(player.mod) ? player.mod.length > 0 : Boolean(player.mod)) ? (
                            <Badge className="ml-1 bg-blue-500/20 text-blue-300">
                              {Array.isArray(player.mod) ? JSON.stringify(player.mod) : String(player.mod)}
                            </Badge>
                          ) : (
                            <Badge className="ml-1" variant="secondary">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLegendPlayer(player)}
                          className="flex-1 gap-1"
                        >
                          <Crown className="h-3 w-3" />
                          Legend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModPlayer(player)}
                          className="flex-1 gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          Mod
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {players.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">Nenhum player encontrado</div>
              )}

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({totalCount} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <LegendPlayerDialog
        player={selectedPlayer}
        open={legendDialogOpen}
        onOpenChange={setLegendDialogOpen}
        onSuccess={fetchPlayers}
      />

      <ModPlayerDialog
        player={selectedPlayer}
        open={modDialogOpen}
        onOpenChange={setModDialogOpen}
        onSuccess={fetchPlayers}
      />
    </>
  )
}
