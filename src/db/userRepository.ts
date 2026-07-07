import { db } from "./index"
import { User, PublicUser } from "../types"

export function findUserByEmail(email: string): User | undefined {
	const stmt = db.prepare("SELECT * FROM users WHERE email = ?")
	return stmt.get(email) as User | undefined
}

export function findUserById(id: number): User | undefined {
	const stmt = db.prepare("SELECT * FROM users WHERE id = ?")
	return stmt.get(id) as User | undefined
}

export function createUser(email: string, passwordHash: string): User {
	const stmt = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
	const info = stmt.run(email, passwordHash)
	const user = findUserById(Number(info.lastInsertRowid))

	if (!user) {
		throw new Error("Failed to create user")
	}
	return user
}

export function toPublicUser(user: User): PublicUser {
	return {
		id: user.id,
		email: user.email,
		role: user.role,
		created_at: user.created_at,
	}
}

export function storeRefreshToken(userId: number, tokenHash: string, expiresAt: string): void {
	const stmt = db.prepare(
		"INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
	)
	stmt.run(userId, tokenHash, expiresAt)
}

export function findValidRefreshToken(tokenHash: string) {
	const stmt = db.prepare(`
		SELECT * FROM refresh_tokens
		WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > datetime('now')
	`)
	return stmt.get(tokenHash) as
		| { id: number, user_id: number, expires_at: string }
		| undefined
}

export function revokeRefreshToken(tokenHash: string): void {
	const stmt = db.prepare(`
		UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE token_hash = ?
	`)
	stmt.run(tokenHash)
}
