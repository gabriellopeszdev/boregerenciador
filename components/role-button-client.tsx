"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

interface Props {
  initialCanManage?: boolean | null
}

export function RoleButtonClient({ initialCanManage = null }: Props) {
  const { data: session } = useSession()
  const [hasPermission, setHasPermission] = useState<boolean | null>(initialCanManage)

  useEffect(() => {
    const check = async () => {
      try {
        // Primeiro tentar GET (server-side DB-first)
        const resp = await fetch('/api/config/can-manage')
        if (resp.ok) {
          const json = await resp.json()
          if (json.canManage !== undefined) {
            setHasPermission(Boolean(json.canManage))
            // if true, we can stop
            if (json.canManage) return
          }
        }

        // Se server-side não conseguiu (ou false), e temos token no cliente, POST token para checar no servidor via Discord
        if (session?.accessToken) {
          const postResp = await fetch('/api/config/can-manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session.accessToken }),
          })
          if (postResp.ok) {
            const json = await postResp.json()
            setHasPermission(Boolean(json.canManage))
            return
          }
        }

        setHasPermission(false)
      } catch (err) {
        console.error('[role-button-client] erro ao checar can-manage:', err)
        setHasPermission(false)
      }
    }

    check()
  }, [session])

  if (hasPermission === null) return null
  if (!hasPermission) return null

  return (
    <>
    {/* <Button asChild>
      <Link href="/dashboard/roles">
        <Crown className="h-4 w-4 mr-2" />
        Setar Legend & Mod
      </Link>
    </Button> */}
    </>
  )
}
