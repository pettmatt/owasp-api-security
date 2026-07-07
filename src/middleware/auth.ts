import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/authUtils"
import jwt from "jsonwebtoken"

// Verifies the Bearer access token and attaches the decoded payload to
// req.user. Does not trust any client-supplied identity claims otherwise.
export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	const header = req.headers.authorization
	if (!header || !header.startsWith("Bearer")) {
		res.status(401).json({ error: "Missing or malformed Authorization header" })
		return
	}

	const token = header.slice("Bearer ".length).trim()

	try {
		req.user = verifyAccessToken(token)
		next()
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
		    res.status(401).json({ error: "Access token expired" })
		    return
		}
		res.status(401).json({ error: "Invalid access token" })
	}
}

export function requireRole(...roles: Array<"user" | "admin">) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ error: "Authentication required" })
			return
		}
		if (!roles.includes(req.user.role)) {
			res.status(403).json({ error: "Insufficient permissions" })
			return
		}
		next()
	}
}
