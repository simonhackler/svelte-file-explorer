<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { onMount } from 'svelte';

    let count = $state(30);
	onMount(() => {
		const timer = setInterval(() => {
			if (count > 0) {
				count -= 1;
			} else {
				clearInterval(timer);
			}
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Check your email</Card.Title>
		<Card.Description
			>Check your email for instructions on how to reset your password</Card.Description
		>
	</Card.Header>
	<Card.Content>
        {#if count > 0}
            <p>Didn't receive an email? Resend in {count} seconds</p>
        {/if}
		<Button href="/01/reset-password" class="w-full" disabled={count > 0}>Resend</Button>
	</Card.Content>
</Card.Root>
