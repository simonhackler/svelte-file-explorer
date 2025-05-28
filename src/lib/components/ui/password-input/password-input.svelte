<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils/utils.js';

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'>
	>;

	let {
		value = $bindable(),
		class: className,
		...restProps
	}: Props = $props();

	let revealed = $state(false);
</script>

<div class="relative w-full">
	<Input {...restProps} bind:value type={revealed ? 'text' : 'password'} files={undefined} class={cn(className)} />
	<button
		type="button"
		onclick={() => (revealed = !revealed)}
		aria-label={revealed ? 'Hide password' : 'Show password'}
		class="absolute inset-y-0 right-2 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
        tabindex="-1"
	>
		{#if revealed}
			<EyeOff class="size-5" />
		{:else}
			<Eye class="size-5" />
		{/if}
	</button>
</div>
