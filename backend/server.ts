import "dotenv/config"
import { createServer } from "http"
import { createApp } from "./src/app"
import { logger } from "./src/lib/logger"
import { SocketGateway } from "./src/services/socket-gateway"

const backendPort = Number.parseInt(process.env.BACKEND_PORT || "4000", 10)

const app = createApp()
const server = createServer(app)
const socketGateway = new SocketGateway(server)

app.locals.socketGateway = socketGateway

server.on("error", (error) => {
  logger.error({ err: error, port: backendPort }, "backend_startup_error")
})

server.listen(backendPort, () => {
  logger.info({ url: `http://localhost:${backendPort}` }, "backend_ready")
})
