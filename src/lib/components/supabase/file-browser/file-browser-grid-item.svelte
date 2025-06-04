<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { FolderIcon, FileIcon } from '@lucide/svelte';
	import { displaySize } from '$lib/components/ui/file-drop-zone';
	import { isFolder, type ExplorerNode } from '$lib/components/supabase/file-viewer/types.svelte';
	import FileBrowserActions from './file-browser-actions.svelte';
	import FileBrowserItemIcon from './file-browser-item-icon.svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { WithElementRef } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';

	let {
		child,
		actionList,
		...restProps
	}: {
		child: ExplorerNode;
		actionList: Snippet<[ExplorerNode]>;
	} & WithElementRef<HTMLButtonAttributes> = $props();
</script>

<Button class="h-full w-full" variant="ghost" data-testid={child.name} {...restProps}>
	<div class="flex h-full w-full flex-col items-center justify-center gap-4">
		<FileBrowserItemIcon node={child} />
		<p>{child.name}</p>
		<div class="flex w-full items-center justify-between">
			{#if isFolder(child)}
				<p class="text-muted-foreground text-xs">{child.children.length} items</p>
			{:else}
				<p class="text-muted-foreground text-xs">{displaySize(child?.fileData.size)}</p>
			{/if}
			{@render actionList(child)}
		</div>
	</div>
</Button>
