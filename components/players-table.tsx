"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Search, Ban, VolumeX, Crown, Shield, Star, Briefcase, Gavel, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { BanPlayerDialog } from "./ban-player-dialog"
import { MutePlayerDialog } from "./mute-player-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const API_URL = "/api/players";
const PLAYERS_PER_PAGE = 10;

interface PlayersTableProps {
  currentUser: any;
}

export function PlayersTable({ currentUser }: PlayersTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchPlayers() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}?page=${currentPage}&limit=${PLAYERS_PER_PAGE}&searchTerm=${searchTerm}`);
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data = await response.json();
        setPlayers(data.players);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlayers();
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(totalCount / PLAYERS_PER_PAGE);

  const getRoleIcon = (player: Player) => {
    if (player.ceo === 1) return <Crown className="h-4 w-4 text-yellow-500" />
    if (player.diretor === 1) return <Shield className="h-4 w-4 text-purple-500" />
    if (player.admin === 1) return <Star className="h-4 w-4 text-blue-500" />
    if (player.gerente === 1) return <Briefcase className="h-4 w-4 text-green-500" />
    if (player.mod === 1) return <Gavel className="h-4 w-4 text-orange-500" />
    return null
  }

  const getRoleName = (player: Player) => {
    if (player.ceo === 1) return "CEO"
    if (player.diretor === 1) return "Diretor"
    if (player.admin === 1) return "Admin"
    if (player.gerente === 1) return "Gerente"
    if (player.mod === 1) return "Moderador"
    return "Player"
  }

  const getRoleColor = (player: Player) => {
    if (player.ceo === 1) return "bg-yellow-500/20 text-yellow-300"
    if (player.diretor === 1) return "bg-purple-500/20 text-purple-300"
    if (player.admin === 1) return "bg-blue-500/20 text-blue-300"
    if (player.gerente === 1) return "bg-green-500/20 text-green-300"
    if (player.mod === 1) return "bg-orange-500/20 text-orange-300"
    return "bg-gray-500/20 text-gray-300"
  }

  const handleBanPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setBanDialogOpen(true)
  }

  const handleMutePlayer = (player: Player) => {
    setSelectedPlayer(player)
    setMuteDialogOpen(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

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
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
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
                          <Badge className={`gap-1 ${getRoleColor(player)}`}>
                            {getRoleIcon(player)}
                            {getRoleName(player)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={player.loggedin === 1 ? "default" : "secondary"}>
                            {player.loggedin === 1 ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleBanPlayer(player)} className="gap-1">
                              <Ban className="h-3 w-3" />
                              Ban
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleMutePlayer(player)} className="gap-1">
                              <VolumeX className="h-3 w-3" />
                              Mute
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
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-mono text-muted-foreground">#{player.id}</div>
                          <div className="font-medium">{player.name}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBanPlayer(player)}>
                              <Ban className="h-4 w-4 mr-2" />
                              Banir Player
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMutePlayer(player)}>
                              <VolumeX className="h-4 w-4 mr-2" />
                              Mutar Player
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={`gap-1 ${getRoleColor(player)}`}>
                          {getRoleIcon(player)}
                          {getRoleName(player)}
                        </Badge>
                        <Badge variant={player.loggedin === 1 ? "default" : "secondary"}>
                          {player.loggedin === 1 ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
          {players.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">Nenhum player encontrado</div>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <BanPlayerDialog
        player={selectedPlayer}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        currentUser={currentUser}
      />

      <MutePlayerDialog
        player={selectedPlayer}
        open={muteDialogOpen}
        onOpenChange={setMuteDialogOpen}
        currentUser={currentUser}
      />
    </>
  )
}