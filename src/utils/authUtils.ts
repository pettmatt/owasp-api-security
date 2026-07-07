import bcrypt from "bcryptjs"
import crypto from "crypto"
import jwt, { SignOptions } from "jsonwebtoken"
import { config } from "../config"
import { JwtPayload } from "../types"

export async function hashPassword(plain: string): Promise<string> {
	return bcrypt.hash(plain, config.bcryptRounds)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash)
}

export function signAccessToken(payload: JwtPayload): string {
	const options: SignOptions = {
		expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
	}
	return jwt.sign(payload, config.jwtSecret, options)
}

export function verifyAccessToken(token: string): JwtPayload {
	return jwt.verify(token, config.jwtSecret) as unknown as JwtPayload
}

// Refresh tokens are opaque random strings. Stores only a SHA-256 hash of
// the token server-side, so a leaked database dump doesn't hand out usable tokens.
export function generateRefreshToken(): string {
	return crypto.randomBytes(48).toString("hex")
}

export function hashToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex")
}

export function refreshExpiryDate(): string {
	const ms = parseDurationToMs(config.jwtRefreshExpiresIn)
	return new Date(Date.now() + ms).toISOString()
}

function parseDurationToMs(duration: string): number {
	const match = /^(\d+)([smhd])$/.exec(duration.trim())
	if (!match)
		return 7 * 24 * 60 * 60 * 1000 // default 7d
	const value = Number(match[1])
	const unit = match[2]
	const unitMs: Record<string, number> = {
		s: 1000,
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000,
	}
	return value * unitMs[unit]
}
