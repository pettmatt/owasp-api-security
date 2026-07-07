import { Request, Response, NextFunction } from "express"
import { config } from "../config"

export class AppError extends Error {
	public readonly statusCode: number
	public readonly isOperational: boolean

	constructor(message: string, statusCode = 500) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = true
		Error.captureStackTrace(this, this.constructor)
	}
}

// Catches errors thrown/passed via next(err) in any route or middleware.
// Never leaks stack traces or internal error details to the client in
// production, and never echoes back raw error objects that might contain
// sensitive info (e.g. DB constraint messages with internal details).
export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_next: NextFunction
): void {
	let statusCode = 500
	let message = "Internal server error"

	if (err instanceof AppError) {
		statusCode = err.statusCode
		message = err.message
	} else if (
		typeof err === "object" &&
		err !== null &&
		"code" in err &&
		(err as { code?: string }).code === "ERR_SQLITE_ERROR" &&
		"message" in err &&
		typeof (err as { message?: string }).message === "string" &&
		(err as { message: string }).message.includes("UNIQUE constraint failed")
	) {
		statusCode = 409
		message = "A resource already exists"
	}

	if (!config.isProduction && statusCode === 500) {
		// eslint-disable-next-line no-console
		console.error(err)
	}

	res.status(statusCode).json({ error: message })
}

export function notFoundHandler(req: Request, res: Response): void {
	res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
}
