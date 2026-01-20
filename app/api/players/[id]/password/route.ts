import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPlayerById, updatePlayerPassword } from "@/lib/queries"
import { encryptPassword } from "@/lib/encryption"
import type { Player } from "@/lib/types"
import { getUserRoles } from "@/lib/discord-roles"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const playerId = parseInt(id)

    // Verificar se o usuário tem permissão via Discord (CEO, Diretor ou Gerente)
    const userRoles = await getUserRoles()
    if (!userRoles.hasAnyPermission) {
      return Response.json(
        { error: "Você não tem permissão para alterar senhas" },
        { status: 403 }
      )
    }

    const { newPassword } = await request.json()

    if (!newPassword || typeof newPassword !== "string") {
      return Response.json(
        { error: "Senha inválida" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Verificar se o jogador existe
    const player = await getPlayerById(playerId)
    if (!player) {
      return Response.json(
        { error: "Jogador não encontrado" },
        { status: 404 }
      )
    }

    // Criptografar a nova senha com bcrypt
    const encryptedPassword = await encryptPassword(newPassword)

    // Atualizar a senha
    await updatePlayerPassword(playerId, encryptedPassword)

    return Response.json({
      message: "Senha alterada com sucesso",
      playerId,
    })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return Response.json(
      { error: "Erro ao alterar senha" },
      { status: 500 }
    )
  }
}
