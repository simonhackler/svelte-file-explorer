<script lang="ts">
	import type { PageProps } from './$types';
	import ResetPasswordForm from '$lib/pages/auth-01/reset-password/reset-password-form.svelte';
	('$lib/pages/auth-01/reset-password/reset-password-form.svelte');
	import ResetPasswordConfirmed from '$lib/pages/auth-01/reset-password/reset-password-confirmed.svelte';

	let { data, form }: PageProps = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	{#if form && form.success}
		<ResetPasswordConfirmed />
	{:else}
		<ResetPasswordForm {data} />
	{/if}
</div>
