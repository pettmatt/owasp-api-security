import { Router, Request, Response, NextFunction } from "express"
import { findUserById, toPublicUser } from "../db/userRepository"
import { requireAuth, requireRole } from "../middleware/auth"
import { AppError } from "../middleware/errorHandler"

const router = Router()

router.get("/user", requireAuth, (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = findUserById(req.user!.sub)
		if (!user)
			throw new AppError("user not found", 404)

		res.status(200).json({ user: toPublicUser(user) })
	} catch (err) {
		next(err)
	}
})

router.get("/:id", requireAuth, requireRole("admin"),
	(req: Request, res: Response, next: NextFunction) => {
		try {
			const id = Number(req.params.id)
			if (!Number.isInteger(id) || id <= 0)
				throw new AppError("Invalid user id", 400)
			const user = findUserById(id)
			if (!user)
				throw new AppError("User not found", 404)

			res.status(200).json({ user: toPublicUser(user) })
		} catch (err) {
			next(err)
		}
	})

export default router
