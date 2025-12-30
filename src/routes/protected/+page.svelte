<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let { supabase } = $derived(data);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
		goto(resolve('/'));
	};
</script>

<Button onclick={logout}>Logout</Button>
<p>Protected</p>
