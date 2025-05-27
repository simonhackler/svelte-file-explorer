<script lang="ts">
	import LoginForm from '$lib/pages/login/login-form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm {data} />
</div>
