<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { Ellipsis, Trash2, Folders, FolderOutput } from '@lucide/svelte';
	import type { ExplorerNode } from '../file-viewer/types.svelte';
	import FileBrowser from './file-browser.svelte';

	type NodeFunction = (node: ExplorerNode) => void;
	// TODO make onDelete async, display loading timer on node?
	let {
		node,
		onDelete,
		onMove,
		onCopy
	}: { node: ExplorerNode; onDelete: NodeFunction; onMove: NodeFunction; onCopy: NodeFunction } =
		$props();

	let open = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Ellipsis />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={() => onDelete(node)}
				><Trash2 /> <span>Delete</span></DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => (open = true)}
				><Folders /><span>Copy</span></DropdownMenu.Item
			>
			<DropdownMenu.Item><FolderOutput />Move</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open>
	<Dialog.Content class="min-w-full md:min-w-[80vw] max-h-[calc(100vh_-_100px)] container">
		<FileBrowser currentFolder={node.parent!} />
	</Dialog.Content>
</Dialog.Root>
