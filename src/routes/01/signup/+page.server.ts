import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema } from '$lib/pages/auth-01/login-signup/schema';

export const actions: Actions = {
    signup: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(loginSchema));
        if (!form.valid) {
            return form;
        }

        const emailRedirectTo = new URL(request.url).origin + '/protected';

        const { error } = await supabase.auth.signUp({
            email: form.data.email, password: form.data.password,
            options: {
                emailRedirectTo,
            }
        })

        if (error) {
            console.error(error)
            return message(form, error.message, {
                status: 400
            })
        } else {
            return message(form, 'Check your email for a login link.')
        }
    }
}
