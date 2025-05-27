import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if(!session.session) {
        redirect(303, '/')
    }
}
