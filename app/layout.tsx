import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import VhFix from "@/components/vh-fix"

export const metadata: Metadata = {
  title: "Bore Admin Painel",
  description: "Sistema de moderação para Bore",
  icons: {
    icon: "/logo_bore.ico",
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <VhFix />
        <Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
