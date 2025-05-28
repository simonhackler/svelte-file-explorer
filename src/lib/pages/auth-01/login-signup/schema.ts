import { z } from "zod";

export const loginSchema = z.object({
    email: z.preprocess(
        (val) => (typeof val === "string" ? val.trim() : val),
        z.string().email()
    ),
    password: z.string().min(8, "Password must be at least 8 characters long").max(72, "Password must be at most 72 characters long").refine(
        (val) => !/\s/.test(val),
        {
            message: "Password must not contain whitespace characters",
        })
});

export type LoginSchema = typeof loginSchema;
