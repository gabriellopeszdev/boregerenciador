const killPort = require("kill-port")

const ports = [3000, 3001, 4000, 4001]

async function cleanPorts() {
  for (const port of ports) {
    try {
      await killPort(port, "tcp")
      console.log(`[dev:clean] porta ${port} liberada`)
    } catch {
      console.log(`[dev:clean] porta ${port} já estava livre`)
    }
  }
}

cleanPorts().catch((error) => {
  console.error("[dev:clean] erro ao limpar portas", error)
  process.exit(1)
})
