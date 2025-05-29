<script lang="ts">
	import type { PageProps } from './$types';
	import UpdatePasswordForm from '$lib/pages/auth-01/update-password/update-password-form.svelte';

	let { data, form }: PageProps = $props();
    $inspect(form?.success);
    const updated = $derived(form?.success || false);
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    <UpdatePasswordForm {data} {updated}/>
</div>
