import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/';

	console.log('Auth confirm called with URL:', url.toString());
	console.log('Auth confirm params:', {
		token_hash: token_hash?.substring(0, 10) + '...',
		type,
		next
	});

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		console.log('VerifyOtp result:', { error: error?.message || 'success' });
		if (!error) {
			console.log('Redirecting to:', next);
			redirect(303, next);
		} else {
			console.error('VerifyOtp error:', error);
		}
	}

	console.log('Redirecting to auth error');
	redirect(303, '/auth/error');
};
