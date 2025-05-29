import { loginSchema } from "../login-signup/schema";

export const resetPasswordSchema = loginSchema.pick({ email: true });

export type ResetPasswordSchema = typeof resetPasswordSchema;
