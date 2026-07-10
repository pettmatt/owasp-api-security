import rateLimit from "express-rate-limit"
import { config } from "../config"

// General API rate limit (for DoS)
export const generalLimiter = rateLimit({
	windowMs: config.rateLimitWindowMs,
	max: config.rateLimitMax,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests, please try again later" },
})

// Stricter limit for auth endpoints. Mitigates credential stuffing and
// brute-force login/registration attempts.
export const authLimiter = rateLimit({
	windowMs: config.rateLimitWindowMs,
	max: config.authRateLimitMax,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many attempts, please try again later" },
	skipSuccessfulRequests: false,
})
