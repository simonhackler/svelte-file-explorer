import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const session = await safeGetSession();
	console.log('Protected route - session check:', {
		hasSession: !!session.session,
		hasUser: !!session.user
	});
	if (!session.session) {
		console.log('No session found, redirecting to /');
		redirect(303, '/');
	}
	console.log('Session found, allowing access to protected route');
};
