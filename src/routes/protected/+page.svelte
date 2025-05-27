<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();
	let { supabase } = $derived(data);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
	};
</script>

<Button onclick={logout}>Logout</Button>
<p>Protected</p>
