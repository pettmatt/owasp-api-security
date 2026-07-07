import { z } from "zod"

// Strong-ish password policy: min length + at least one letter and one number.
// Adjust to your product"s needs, but avoid going below 8 characters.
const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.max(128, "Password is too long")
	.regex(/[A-Za-z]/, "Password must contain at least one letter")
	.regex(/[0-9]/, "Password must contain at least one number")

export const registerSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.email("Invalid email address")
		.max(254),
	password: passwordSchema,
})

export const loginSchema = z.object({
	email: z.string().trim().toLowerCase().email("Invalid email address"),
	password: z.string().min(1, "Password is required").max(128),
})

export const refreshSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
