import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null
      role?: string | null
      rooms?: number[] | null 
    } & DefaultSession["user"]
  }

  interface User {
    role?: string | null
    rooms?: number[] | null 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null
    rooms?: number[] | null 
  }
}