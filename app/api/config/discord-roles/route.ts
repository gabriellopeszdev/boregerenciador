import { NextResponse } from "next/server"

export async function GET() {
  const guildId = process.env.DISCORD_GUILD_ID ?? null
  const ceoRoleId = process.env.DISCORD_CEO_ROLE_ID ?? null
  const diretorRoleId = process.env.DISCORD_DIRETOR_ROLE_ID ?? null
  const gerenteRoleId = process.env.DISCORD_GERENTE_ROLE_ID ?? null

  return NextResponse.json({
    guildId,
    ceoRoleId,
    diretorRoleId,
    gerenteRoleId,
  })
}
