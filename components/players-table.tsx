"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ban, VolumeX, Shield, Star, Briefcase, Gavel, ChevronLeft, ChevronRight, Loader2, Key, Search, Users } from "lucide-react"
import { BanPlayerDialog } from "./ban-player-dialog"
import { MutePlayerDialog } from "./mute-player-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"
import { apiClient } from "@/lib/api-client"

const API_URL = "/api/players";
const PLAYERS_PER_PAGE = 6;

export function PlayersTable({ currentUser }: { currentUser: any }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`${API_URL}?page=${currentPage}&limit=${PLAYERS_PER_PAGE}&searchTerm=${searchTerm}`)
      setPlayers(Array.isArray(response.data.players) ? response.data.players : []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchPlayers(); }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(totalCount / PLAYERS_PER_PAGE);

  const handleAction = (player: Player, type: 'ban' | 'mute' | 'pass') => {
    setSelectedPlayer(player);
    if (type === 'ban') setBanDialogOpen(true);
    if (type === 'mute') setMuteDialogOpen(true);
    if (type === 'pass') setPasswordDialogOpen(true);
  }

  return (
    <div className="w-full mx-auto p-2 space-y-4 sm:max-w-[520px] md:max-w-[760px] lg:max-w-[920px]">
      <Card className="bg-[#0a0a0a] border-zinc-900 shadow-xl mx-auto px-2">
        {/* Barra de Ferramentas Integrada (compacta) */}
        <div className="flex items-center justify-between px-3 py-0.5 border-b border-zinc-900">
          <h2 className="text-xs font-semibold text-zinc-200">
            Players <span className="text-zinc-600 font-normal ml-1">({totalCount})</span>
          </h2>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600" />
            <input
              placeholder="Buscar player..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#111] border border-zinc-800 text-zinc-400 pl-8 pr-3 h-7 rounded-sm text-[11px] focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-800" /></div>
          ) : (
              <div className="px-6 py-1"> 
              <Table>
              <TableHeader>
                <TableRow className="border-zinc-900 hover:bg-transparent">
                    <TableHead className="py-1 pl-8 text-sm uppercase tracking-wider text-zinc-400 font-semibold">ID</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Nome</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold text-center hidden lg:table-cell">Cargo</TableHead>
                    <TableHead className="py-1 text-sm uppercase tracking-wider text-zinc-400 font-semibold">Status</TableHead>
                    <TableHead className="py-1 pr-8 text-sm uppercase tracking-wider text-zinc-400 font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow 
                    key={player.id} 
                    className="border-zinc-900/50 hover:bg-zinc-900/40 transition-colors duration-150 group"
                  >
                      <TableCell className="py-1 pl-8 font-mono text-sm text-zinc-300">#{player.id}</TableCell>
                      <TableCell className="py-1 font-medium text-sm text-zinc-200">{player.name || "—"}</TableCell>
                      <TableCell className="py-1 text-center hidden lg:table-cell">
                      <Badge className="bg-zinc-900 border-zinc-800 text-zinc-400 text-xs font-semibold px-3 py-0 h-5 rounded-sm uppercase tracking-tighter">
                        PLAYER
                      </Badge>
                    </TableCell>
                      <TableCell className="py-1">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${player.loggedin === 1 ? "bg-emerald-500" : "bg-zinc-700"}`} />
                        <span className={`text-sm ${player.loggedin === 1 ? "text-emerald-500/80" : "text-zinc-500"}`}>
                          {player.loggedin === 1 ? "Online" : "Offline"}
                        </span>
                      </div>
                    </TableCell>
                      <TableCell className="py-1 pr-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleAction(player, 'ban')} className="text-zinc-500 hover:text-white transition-colors" title="Banir">
                            <Ban className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleAction(player, 'mute')} className="text-zinc-500 hover:text-white transition-colors" title="Mutar">
                            <VolumeX className="h-4 w-4" />
                          </button>
                        {(currentUser?.dono === 1 || currentUser?.diretor === 1 || currentUser?.gerente === 1) && (
                            <button onClick={() => handleAction(player, 'pass')} className="text-zinc-500 hover:text-white transition-colors" title="Senha">
                              <Key className="h-4 w-4" />
                            </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
              </div>
          )}
        </CardContent>

        {/* Paginação fixa fora da área rolável (altura reduzida) */}
          <div className="py-0.5 px-6 border-t border-zinc-900 flex items-center justify-between bg-transparent">
          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
            Página {currentPage} / {totalPages || 1}
          </p>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
                className="h-6 px-3 text-[10px] uppercase font-bold text-zinc-500 hover:bg-zinc-900 hover:text-white disabled:opacity-30"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
                className="h-6 px-3 text-[10px] uppercase font-bold text-zinc-500 hover:bg-zinc-900 hover:text-white disabled:opacity-30"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      </Card>

      <BanPlayerDialog player={selectedPlayer} open={banDialogOpen} onOpenChange={setBanDialogOpen} currentUser={currentUser} />
      <MutePlayerDialog player={selectedPlayer} open={muteDialogOpen} onOpenChange={setMuteDialogOpen} currentUser={currentUser} />
      <ChangePasswordDialog player={selectedPlayer} open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} onPasswordChanged={fetchPlayers} />
    </div>
  )
}