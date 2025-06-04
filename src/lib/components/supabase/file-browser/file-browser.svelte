<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import {
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import BreadcrumbRecursive from '$lib/components/supabase/file-viewer/breadcrumb-recursive.svelte';
	import DataTable from './data-table.svelte';
	import { List, Grid2x2 } from '@lucide/svelte/icons';
	import FileBrowserActions from './file-browser-actions.svelte';

	let {
		currentFolder = $bindable(),
		homeFolderPath = '/',
		onDelete
	}: {
		currentFolder: Folder;
		onDelete?: (files: string[]) => Promise<Error | null>;
		homeFolderPath?: string;
	} = $props();

	let showCreateFolder = $state(false);
	let display: 'grid' | 'list' = $state('grid');
	let createFolderInput: HTMLInputElement | null = $state(null);

	function setCurrentFolder(folder: Folder) {
		currentFolder = folder;
	}

	function getPath(node: ExplorerNode): string[] {
		let path = [node.name];
		let parent = node.parent;
		while (parent !== null) {
			path.push(parent.name);
			parent = parent.parent;
		}
		return path.reverse();
	}

	function clickedNode(item: ExplorerNode) {
		if (isFolder(item)) {
			setCurrentFolder(item);
		}
	}

	function createFolder(inputEvent: Event) {
		showCreateFolder = false;
		const newFolderName = createFolderInput!.value;
		if (newFolderName === '') {
			return;
		}
		currentFolder.children.push(new Folder(newFolderName, currentFolder, []));
	}

	function getAllFiles(node: ExplorerNode, currentPath: string): string[] {
		if (isFolder(node)) {
			const paths = [];
			for (let child of node.children) {
				const childPaths = getAllFiles(child, currentPath + '/' + child.name);
				paths.push(...childPaths);
			}
			return paths;
		} else {
			return [currentPath];
		}
	}

	$effect(() => {
		if (showCreateFolder) {
			createFolderInput?.focus();
		}
	});

	async function deleteNode(node: ExplorerNode) {
		const path = homeFolderPath + getPath(node).slice(1).join('/');
		const toDelete = getAllFiles(node, path);

		const error = await onDelete(toDelete);
		if (error) {
			console.error(error);
		} else {
			currentFolder.children = currentFolder.children.filter((f) => f.name !== node.name);
		}
	}

	function moveNode(node: ExplorerNode) {}

	function copyNode(node: ExplorerNode) {}
</script>

<div class="h-[100cqh]">
	<div
		class="mx-4 mb-4 flex items-center justify-between rounded border border-gray-300 bg-gray-100 p-4"
	>
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<BreadcrumbRecursive
					folder={currentFolder}
					isLast={true}
					onBreadCrumbClick={(folder) => setCurrentFolder(folder)}
				/>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Button onclick={() => (showCreateFolder = true)} variant="outline"
						><Plus class="mr-2" />folder</Button
					>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="flex gap-2">
			<Button variant="outline">Upload</Button>
			<Button onclick={() => (showCreateFolder = true)} variant="outline"
				><Plus class="mr-2" />Create folder</Button
			>
			<Button variant="outline" onclick={() => (display = display === 'grid' ? 'list' : 'grid')}>
				{#if display === 'list'}
					<Grid2x2 />
				{:else}
					<List />
				{/if}
			</Button>
		</div>
	</div>

	<DataTable data={currentFolder.children} onNodeClicked={clickedNode} {display}>
		{#snippet actionList(node: ExplorerNode)}
			<FileBrowserActions {node} onDelete={deleteNode} onMove={moveNode} onCopy={copyNode} />
		{/snippet}
	</DataTable>
</div>
