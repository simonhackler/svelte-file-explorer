import { loginSchema } from "../login-signup/schema";

export const updatePasswordSchema = loginSchema.pick({ password: true });

export type UpdatePasswordSchema = typeof updatePasswordSchema;
