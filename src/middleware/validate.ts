import { Request, Response, NextFunction } from "express"
import { ZodObject, ZodError } from "zod"

// Validates req.body against a zod schema and replaces req.body with the
// parsed (and coerced/trimmed/lowercased) result. Rejects unknown/malformed
// input before it reaches any business logic or database query.
export function validateBody(schema: ZodObject<any, any>) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body)
		if (!result.success) {
			const zodError = result.error as ZodError
			res.status(400).json({
				error: "Validation failed",
				details: zodError.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				})),
			})
			return
		}

		req.body = result.data
		next()
	}
}
