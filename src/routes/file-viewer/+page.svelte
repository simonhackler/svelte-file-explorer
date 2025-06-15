<script lang="ts">
	import { Toaster, toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';

	import AdapterFileBrowser from '$lib/components/file-browser/ui/adapter-file-browser.svelte';
	import { SupabaseAdapter } from '$lib/components/file-browser/adapters/supabase/supabase-adapter';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	const user = $derived(data.user as User);
	const supabaseAdapter = new SupabaseAdapter(supabase, user.id);
</script>

<AdapterFileBrowser
	adapter={supabaseAdapter}
	pathPrefix={user.id + '/'}
/>

<Toaster />
