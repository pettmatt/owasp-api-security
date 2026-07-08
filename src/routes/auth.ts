import { Router, Request, Response, NextFunction } from "express"
import {
	findUserByEmail,
	createUser,
	toPublicUser,
	storeRefreshToken,
	findValidRefreshToken,
	revokeRefreshToken,
	findUserById,
} from "../db/userRepository"
import {
	hashPassword,
	verifyPassword,
	signAccessToken,
	generateRefreshToken,
	hashToken,
	refreshExpiryDate,
} from "../utils/authUtils"
import { registerSchema, loginSchema, refreshSchema } from "../utils/schemas"
import { validateBody } from "../middleware/validate"
import { authLimiter } from "../middleware/rateLimiter"
import { AppError } from "../middleware/errorHandler"

const router = Router()

router.post("/register", authLimiter, validateBody(registerSchema),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body
			const existing = findUserByEmail(email)
			// Generic message avoids confirming which emails are registered.
			if (existing)
				throw new AppError("Unable to register with these details", 409)

			const passwordHash = await hashPassword(password)
			const user = createUser(email, passwordHash)

			const accessToken = signAccessToken({
				sub: user.id,
				email: user.email,
				role: user.role,
			})
			const refreshToken = generateRefreshToken()
			storeRefreshToken(user.id, hashToken(refreshToken), refreshExpiryDate())

			res.status(201).json({
				user: toPublicUser(user),
				accessToken,
				refreshToken,
			})
		} catch (err) {
		    next(err)
		}
	}
)

router.post(
	"/login",
	authLimiter,
	validateBody(loginSchema),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body
			const user = findUserByEmail(email)
			// Always run bcrypt.compare even if user is missing, using a dummy
			// hash, to avoid leaking user existence via response timing.
			const dummyHash = "$2b$12$CwTycUXWue0Thq9StjUM0uJ8yiJ8yiJ8yiJ8yiJ8yiJ8yiJ8yiJ8y"
			const passwordMatches = await verifyPassword(
				password,
				user?.password_hash ?? dummyHash
			)

			if (!user || !passwordMatches)
				throw new AppError("Invalid email or password", 401)

			const accessToken = signAccessToken({
				sub: user.id,
				email: user.email,
				role: user.role,
			})
			const refreshToken = generateRefreshToken()
			storeRefreshToken(user.id, hashToken(refreshToken), refreshExpiryDate())

			res.status(200).json({
				user: toPublicUser(user),
				accessToken,
				refreshToken,
			})
		} catch (err) {
			next(err)
		}
	}
)

router.post("/refresh", authLimiter, validateBody(refreshSchema),
	(req: Request, res: Response, next: NextFunction) => {
		try {
			const { refreshToken } = req.body
			const tokenHash = hashToken(refreshToken)
			const stored = findValidRefreshToken(tokenHash)
			if (!stored)
				throw new AppError("Invalid or expired refresh token", 401)
			const user = findUserById(stored.user_id)
			if (!user)
				throw new AppError("Invalid or expired refresh token", 401)

			// Rotate: revoke the old refresh token and issue a new one. This
			// limits the damage if a refresh token is ever stolen/replayed.
			revokeRefreshToken(tokenHash)
			const newRefreshToken = generateRefreshToken()
			storeRefreshToken(user.id, hashToken(newRefreshToken), refreshExpiryDate())

			const accessToken = signAccessToken({
				sub: user.id,
				email: user.email,
				role: user.role,
			})

			res.status(200).json({ accessToken, refreshToken: newRefreshToken })
		} catch (err) {
			next(err)
		}
	}
)

router.post("/logout", validateBody(refreshSchema),
	(req: Request, res: Response, next: NextFunction) => {
		try {
			const { refreshToken } = req.body
			revokeRefreshToken(hashToken(refreshToken))
			res.status(200).json({ message: "Logged out successfully" })
		} catch (err) {
	    	next(err)
		}
	}
)

export default router
