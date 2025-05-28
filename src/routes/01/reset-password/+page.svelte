<script lang="ts">
	import type { PageData } from './$types';
    import ResetPasswordForm from '$lib/pages/auth-01/reset-password/reset-password-form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<ResetPasswordForm {data} mode="login"/>
</div>
