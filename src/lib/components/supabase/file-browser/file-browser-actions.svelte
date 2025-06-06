<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { Ellipsis, Trash2, Folders, FolderOutput, Download } from '@lucide/svelte';
	import { isFolder, type ExplorerNode, type Folder } from '../file-viewer/types.svelte';
	import FileBrowser from './file-browser.svelte';
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';

	type CopyOrMoveFunction = (node: ExplorerNode, parent: Folder) => Promise<Error | null>;
	let {
		node,
		onDownload,
		onDelete,
		onMove,
		onCopy
	}: {
		node: ExplorerNode;
		onDelete: (node: ExplorerNode) => Promise<void>;
		onDownload: (node: ExplorerNode) => Promise<void>;
		onMove: CopyOrMoveFunction;
		onCopy: CopyOrMoveFunction;
	} = $props();

	let open = $state(false);
	let currentFolder = $derived(node.parent!);
	let currentAction = $state('copy');

	function setActionCopy() {
		currentAction = 'copy';
		open = true;
	}

	function setActionMove() {
		currentAction = 'move';
		open = true;
	}

	async function handleCurrentAction() {
		let error = null;
		if (currentAction === 'copy') {
			error = await onCopy(node, currentFolder);
		} else if (currentAction === 'move') {
			error = await onMove(node, currentFolder);
		}
		if (error) {
			console.log(error);
		} else {
			open = false;
		}
	}

	const url = $derived(!isFolder(node) && node.fileData?.url?.then((url) => url));

	onDestroy(() => {
		console.log('destroyed');
	});
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
			<DropdownMenu.Item onclick={() => setActionCopy()}
				><Folders /><span>Copy</span></DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => setActionMove()}>
				<FolderOutput />Move</DropdownMenu.Item
			>
			{#if url}
				{#await url then url}
					<DropdownMenu.Item>
						<a class="flex gap-2 cursor-default" href={url} download={node.name}>
							<Download /> Download
						</a>
					</DropdownMenu.Item>
				{/await}
			{:else}
				<DropdownMenu.Item onclick={() => onDownload(node)}>
					<Download />Download</DropdownMenu.Item
				>
			{/if}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[calc(100vh_-_100px)] min-h-[calc(100vh_-_100px)] min-w-full flex-col md:min-w-[80vw]"
	>
		<FileBrowser bind:currentFolder class="min-h-0 flex-1" showActions={false} />
		<Button onclick={handleCurrentAction} class="flex-none"
			>{currentAction} {node.name} to {currentFolder.name}</Button
		>
	</Dialog.Content>
</Dialog.Root>
