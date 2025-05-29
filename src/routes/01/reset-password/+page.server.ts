import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { resetPasswordSchema } from '$lib/pages/auth-01/reset-password/schema';

export const actions: Actions = {
    resetPassword: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(resetPasswordSchema));
        if (!form.valid) {
            return form;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(form.data.email)
        if (error) {
            console.error(error)
            return message(form, error.message, {
                status: 400
            })
        }
        return { form, success: true }
    },
}
