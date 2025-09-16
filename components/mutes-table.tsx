"use client";

import { useState } from "react";
import type { Mute } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Search, Volume2, Clock, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MutesTableProps {
  mutes: Mute[];
}

export function MutesTable({ mutes }: MutesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<number | null>(null);
  const router = useRouter();

  const filteredMutes = mutes.filter(
    (mute) =>
      (mute as any).name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mute as any).name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnmute = async (muteId: number) => {
    setLoading(muteId);
    try {
      const response = await fetch(`/api/mutes/${muteId}/unmute`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error unmuting player:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Mutes ({filteredMutes.length})</span>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mute..."
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
                <TableHead>Mutado por</TableHead>
                <TableHead>Data do Mute</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMutes.map((mute, index) => (
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
                    {(mute as any).muted_by_name || `User #${mute.muted_by}`}
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
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnmute(mute.id)}
                      disabled={loading === mute.id}
                      className="gap-1"
                    >
                      <Volume2 className="h-3 w-3" />
                      {loading === mute.id ? "Desmutando..." : "Desmutar"}
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredMutes.map((mute, index) => (
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
                      Mutado por:{" "}
                      {(mute as any).muted_by_name || `User #${mute.muted_by}`}
                    </div>
                  </div>
                  {mute.active && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild> 
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUnmute(mute.id)}
                          disabled={loading === mute.id}
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          {loading === mute.id ? "Desmutando..." : "Desmutar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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

        {filteredMutes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum mute encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
