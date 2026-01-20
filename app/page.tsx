
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">

      {/* Background animated blobs (behind everything) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 60, -40, 0], y: [0, -30, 20, 0], scale: [1, 1.06, 0.96, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full filter blur-2xl opacity-90"
          style={{ width: 420, height: 420, top: -120, left: -120, background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.6), rgba(99,102,241,0.18) 40%, transparent 60%)", mixBlendMode: 'screen' }}
        />

        <motion.div
          animate={{ x: [0, -80, 40, 0], y: [0, 20, -20, 0], scale: [1, 0.96, 1.04, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute rounded-full filter blur-2xl opacity-88"
          style={{ width: 520, height: 520, top: -60, right: -140, background: "radial-gradient(circle at 70% 30%, rgba(20,184,166,0.5), rgba(20,184,166,0.14) 40%, transparent 60%)", mixBlendMode: 'screen' }}
        />

        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -40, 30, 0], scale: [1, 1.04, 0.97, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute rounded-full filter blur-xl opacity-82"
          style={{ width: 360, height: 360, bottom: -100, left: -80, background: "radial-gradient(circle at 40% 60%, rgba(249,115,22,0.48), rgba(249,115,22,0.12) 40%, transparent 60%)", mixBlendMode: 'screen' }}
        />

        {/* subtle floating dots */}
        <motion.div
          animate={{ y: [0, -28, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute w-2 h-2 rounded-full bg-white/30 blur-sm"
          style={{ top: '25%', left: '60%' }}
        />
        <motion.div
          animate={{ y: [0, 18, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.8 }}
          className="absolute w-1.5 h-1.5 rounded-full bg-white/25 blur-sm"
          style={{ top: '70%', left: '30%' }}
        />
      </div>

      {/* Gradient overlay above blobs (reduced opacity to reveal blobs) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-background opacity-40" />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative z-10 flex flex-col items-center justify-center min-h-screen">

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 80 }} className="relative z-10 bg-card/80 rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full ring-1 ring-white/6">
        <motion.div className="mb-6 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.06 }}
            initial={{ scale: 0.96, y: 0, rotate: 0 }}
            animate={{
              scale: 1,
              y: [0, -8, 0, 6, 0],
              rotate: [0, 1.5, 0, -1.5, 0]
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-black/70 rounded-full p-3 shadow-lg flex items-center justify-center"
            style={{ width: 186, height: 186 }}
          >
            <Image src="/logo_bore.png" alt="Logo Bore" width={120} height={120} className="object-contain" priority />
          </motion.div>
        </motion.div>

        <motion.h1 initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="text-4xl font-extrabold text-primary mb-2 text-center drop-shadow-lg">Bem-vindo ao Bore Gerenciador</motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-lg text-muted-foreground mb-8 text-center">Gerenciamento da sala Bore Arena</motion.p>

        <Link href="/login">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-md hover:bg-primary/90 transition-all">Entrar</motion.button>
        </Link>
      </motion.div>

      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-10 text-muted-foreground text-xs opacity-70">&copy; {new Date().getFullYear()} Bore</motion.footer>
    </motion.main>
    </div>
  );
}
