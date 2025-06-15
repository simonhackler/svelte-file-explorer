<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import type SupabaseClient from '@supabase/supabase-js/dist/module/SupabaseClient';
	import AdapterFileBrowser from '$lib/components/file-browser/ui/adapter-file-browser.svelte';
	import { SupabaseAdapter } from '../adapters/supabase/supabase-adapter';

	let { supabase, user }: { supabase: SupabaseClient; user: User } = $props();

	const supabaseAdapter = new SupabaseAdapter(supabase, user.id);
</script>

<AdapterFileBrowser 
	adapter={supabaseAdapter} 
	homeFolderPath={user.id + '/'} 
	pathPrefix={user.id + '/'}
	class="" 
/>
