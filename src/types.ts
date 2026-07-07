export interface User {
	id: number
	email: string
	password_hash: string
	role: "user" | "admin"
	created_at: string
	updated_at: string
}

export interface PublicUser {
	id: number
	email: string
	role: "user" | "admin"
	created_at: string
}

export interface JwtPayload {
	sub: number
	email: string
	role: "user" | "admin"
}

// Augment Express's Request type with the authenticated user.
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload
		}
	}
}
