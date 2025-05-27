import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema } from '$lib/pages/login/schema';

export const load: PageServerLoad = async () => {
    return {
        form: await superValidate(zod(loginSchema)),
    };
};

export const actions: Actions = {
    signup: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(loginSchema));
        if (!form.valid) {
            return form;
        }

        const { error } = await supabase.auth.signUp({ email: form.data.email, password: form.data.password })

        if (error) {
            console.error(error)
            return message(form, error.message, {
                status: 400
            })
        } else {
            return message(form, 'Check your email for a login link.')
        }
    },
    login: async ({ request, locals: { supabase } }) => {
        const form = await superValidate(request, zod(loginSchema));
        if (!form.valid) {
            return form;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: form.data.email, password: form.data.password })
        if (error) {
            console.error(error)
            return message(form, error.message, {
                status: 400
            })
        } else {
            redirect(303, '/protected')
        }
    },
}
