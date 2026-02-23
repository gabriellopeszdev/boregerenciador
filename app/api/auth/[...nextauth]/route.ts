// Local do arquivo: /app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { logger } from "../../../../backend/src/lib/logger"


const handler = async (...args: any[]) => {
	// Função utilitária para garantir array
	function safeArray(val: any) {
		if (Array.isArray(val)) return val;
		if (val == null) return [];
		return [val];
	}
	try {

		return await NextAuth(authOptions)(...args)
	} catch (error) {
		logger.error({ error }, "nextauth_handler_error")
		const res = args[1]
		if (res && typeof res.status === "function") {
			return res.status(500).json({ error: "Internal server error" })
		}
		throw error
	}
}

export { handler as GET, handler as POST }