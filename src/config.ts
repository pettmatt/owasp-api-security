import dotenv from "dotenv"
import path from "path"

dotenv.config()

function required(name: string, fallback?: string): string {
	const value = process.env[name] ?? fallback
	if (value === undefined || value === "") {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value
}

function optionalInt(name: string, fallback: number): number {
	const raw = process.env[name]
	if (!raw) return fallback
	const parsed = parseInt(raw, 10)
	return Number.isNaN(parsed) ? fallback : parsed
}

const nodeEnv = process.env.NODE_ENV ?? "development"
const jwtSecret = required("JWT_SECRET")

// Fail fast in production if a weak/default secret is used.
if (nodeEnv === "production") {
	if (jwtSecret.includes("replace") || jwtSecret.length < 32) {
		throw new Error(
			"JWT_SECRET is missing, too short, or still set to the placeholder value. " +
				"Set a strong random secret (32+ chars) before running in production.",
		)
	}
}

export const config = {
	nodeEnv,
	isProduction: nodeEnv === "production",
	port: optionalInt("PORT", 3000),
	dbPath: process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.db"),
	jwtSecret,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
	jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
	corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean),
	rateLimitWindowMs: optionalInt("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
	rateLimitMax: optionalInt("RATE_LIMIT_MAX", 100),
	authRateLimitMax: optionalInt("AUTH_RATE_LIMIT_MAX", 10),
	bcryptRounds: optionalInt("BCRYPT_ROUNDS", 12),
}
