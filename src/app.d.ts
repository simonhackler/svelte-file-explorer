import { createServerClient } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from './schema';

type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseServerClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
