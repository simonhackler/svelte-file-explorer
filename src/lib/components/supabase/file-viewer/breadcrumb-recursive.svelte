<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { FileLeaf, ExplorerNode, Folder } from '$lib/components/supabase/file-viewer/types';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import BreadcrumbRecursive from './breadcrumb-recursive.svelte';

	interface Props {
		folder: Folder;
		isLast?: boolean;
        onBreadCrumbClick: (folder: Folder) => void;
	}

	let { folder, isLast = true, onBreadCrumbClick }: Props = $props();


</script>

{#if folder.parent}
	<BreadcrumbRecursive {onBreadCrumbClick} folder={folder.parent} isLast={false} />
{/if}
{#if !isLast}
	<Breadcrumb.Item>
		<Button variant="ghost" onclick={() => onBreadCrumbClick(folder)}>{folder.name}</Button>
	</Breadcrumb.Item>
	<Breadcrumb.Separator />
{:else}
	<Breadcrumb.Item>
		<Button variant="ghost" onclick={() => onBreadCrumbClick(folder)}>{folder.name}</Button>
	</Breadcrumb.Item>
{/if}
