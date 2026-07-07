import { createApp } from "./app"
import { initSchema } from "./db"
import { config } from "./config"

initSchema()
const app = createApp()

const server = app.listen(config.port, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on port ${config.port} (${config.nodeEnv})`)
})

// Graceful shutdown on termination signals.
function shutdown(signal: string): void {
	// eslint-disable-next-line no-console
	console.log(`Received ${signal}, shutting down gracefully...`)
	server.close(() => {
		process.exit(0)
	})

	setTimeout(() => process.exit(1), 10_000).unref() // Force-exit
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

// Catch unhandled errors instead of letting the process crash silently.
process.on("unhandledRejection", (reason) => {
	// eslint-disable-next-line no-console
	console.error("Unhandled promise rejection:", reason)
})
