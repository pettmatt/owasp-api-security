import express, { Application } from "express"
import helmet from "helmet"
import cors from "cors"
import { config } from "./config"
import { generalLimiter } from "./middleware/rateLimiter"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler"
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"

export function createApp(): Application {
	const app = express()
	app.set("trust proxy", 1)
	app.use(helmet()) // Sets headers

	// Restrict cross-origin requests to an explicit allowlist rather than "*".
	app.use(
		cors({
		    origin: config.corsOrigins,
		    credentials: true,
		    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		})
	)

	// Limit request body size to reduce DoS surface from huge payloads.
	app.use(express.json({ limit: "10kb" }))
	app.use(express.urlencoded({ extended: false, limit: "10kb" }))
	// Baseline rate limiting on all routes auth routes layer on a stricter limit.
	app.use(generalLimiter)

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok", uptime: process.uptime() })
	})

	app.use("/api/auth", authRoutes)
	app.use("/api/users", userRoutes)
	app.use(notFoundHandler)
	app.use(errorHandler)

	return app
}
