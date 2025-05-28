<script lang="ts">
	import type { PageData } from './$types';
	import LoginForm from '$lib/pages/auth-01/login-signup/login-signup-form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm {data} mode="login"/>
</div>
