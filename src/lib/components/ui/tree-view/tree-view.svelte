<!--
	Installed from @ieedan/shadcn-svelte-extras
-->

<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		children?: Snippet<[]>;
	};

	let { children, class: className }: Props = $props();
</script>

<div class={cn('flex flex-col', className)}>
	{@render children?.()}
</div>
