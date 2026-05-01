<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { type ExplorerNode, Folder } from '../browser-utils/types.svelte';
	import FileBrowser from './file-browser.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Ok } from 'wellcrafted/result';
	import type { FileFunctions } from '../adapters/adapter';

	let {
		nodes,
		open = $bindable(),
		currentAction,
		handleCurrentAction
	}: {
		nodes: ExplorerNode[];
		open: boolean;
		currentAction: 'copy' | 'move';
		handleCurrentAction: (nodes: ExplorerNode[], currentFolder: Folder) => Promise<void>;
	} = $props();

	let currentFolder = $derived<Folder>(
		nodes.length > 0 && nodes[0].parent ? nodes[0].parent : new Folder('home', null, [])
	);

	const noopFileFunctions: FileFunctions = {
		list: () => Promise.resolve(Ok([])),
		openDir: () => Promise.resolve(Ok(noopFileFunctions)),
		ensureDir: () => Promise.resolve(Ok(noopFileFunctions)),
		read: () => Promise.resolve(Ok(new File([], 'empty'))),
		readText: () => Promise.resolve(Ok('')),
		write: () => Promise.resolve(Ok(undefined)),
		remove: () => Promise.resolve(Ok(undefined))
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[calc(100vh_-_100px)] min-h-[calc(100vh_-_100px)] min-w-full flex-col md:min-w-[80vw]"
	>
		<FileBrowser
			bind:currentFolder
			class="min-h-0 flex-1"
			showActions={false}
			fileFunctions={noopFileFunctions}
		/>
		<Button onclick={() => handleCurrentAction(nodes, currentFolder)} class="flex-none"
			>{currentAction} {nodes.length == 1 ? nodes[0].name : 'files'} to {currentFolder.name}</Button
		>
	</Dialog.Content>
</Dialog.Root>
