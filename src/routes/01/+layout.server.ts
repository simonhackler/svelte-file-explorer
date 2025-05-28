import type { LayoutServerLoad } from './$types';
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema } from '$lib/pages/auth-01/login-signup/schema';

export const load: LayoutServerLoad = async () => {
    return {
        loginForm: await superValidate(zod(loginSchema)),
    };
};
