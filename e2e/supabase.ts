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

export async function createUser(email: string, password: string = 'password') {
    const { data, error } = await supabase_full_access.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data.user;
}

export async function getBucketFiles(bucketId: string, folder: string) {
    const { data, error } = await supabase_full_access
        .schema('storage')
        .from('objects')
        .select(`pathTokens: path_tokens
            `)
        .eq('bucket_id', bucketId)
        .filter('path_tokens->>0', 'eq', folder);
    
    if (error) {
        throw new Error(error.message);
    }
    
    return data.map(file => file.pathTokens?.slice(1).join('/') || '');
}