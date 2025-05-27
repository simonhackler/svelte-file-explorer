import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/schema';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
if (!SUPABASE_SERVICE_ROLE_KEY || !PUBLIC_SUPABASE_URL) {
	throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or PUBLIC_SUPABASE_URL');
}

export const supabase_full_access = createClient<Database>(
	PUBLIC_SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY
);

