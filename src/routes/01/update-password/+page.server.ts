import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { redirect } from '@sveltejs/kit';
import { updatePasswordSchema } from '$lib/pages/auth-01/update-password/schema';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (session.session == null) {
        redirect(303, '/01/login')
    }
}

export const actions: Actions = {
    updatePassword: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(updatePasswordSchema));
        if (!form.valid) {
            return form;
        }
        const { error } = await supabase.auth.updateUser({ password: form.data.password })
        if (error) {
            console.error(error)
            return message(form, error.message, {
                status: 400
            })
        }
        return { form, success: true }
    },
}
