<script lang="ts">
	import { downloadZip } from 'client-zip';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import {
		deepCopyExplorerNode,
		type ExplorerNode,
		FileLeaf,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import BreadcrumbRecursive from '$lib/components/supabase/file-viewer/breadcrumb-recursive.svelte';
	import DataTable from './data-table.svelte';
	import { List, Grid2x2 } from '@lucide/svelte/icons';
	import FileBrowserActions from './file-browser-actions.svelte';
	import { cn } from '$lib/utils/utils';
	import FileUpload from './file-upload.svelte';

	interface FileFunctions {
		onDelete: (files: string[]) => Promise<Error | null>;
		download: (files: string[]) => Promise<Error | { path: string; data: Blob }[]>;
        upload: (file: File) => Promise<Error | { path: string; data: Blob }>;
	}

	let {
		currentFolder = $bindable(),
		homeFolderPath = '/',
		fileFunctions,
		class: className,
		showActions = true
	}: {
		currentFolder: Folder;
		fileFunctions?: FileFunctions;
		class?: string;
		homeFolderPath?: string;
		showActions?: boolean;
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

    async function onUpload(file: File) {
        const error = await fileFunctions?.upload(file);
        if (error) {
            console.error(error);
        }
        currentFolder.children.push(new FileLeaf(file.name, currentFolder, { mimetype: file.type, size: file.size, updatedAt: new Date(file.lastModified) }, file));
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

		const error = await fileFunctions?.onDelete(toDelete);
		if (error) {
			console.error(error);
		} else {
			currentFolder.children = currentFolder.children.filter((f) => f.name !== node.name);
		}
	}

	async function downloadNode(node: ExplorerNode) {
		const files = await fileFunctions?.download(
			getAllFiles(node, homeFolderPath + getPath(node).slice(1).join('/'))
		);
		if (files == undefined || files instanceof Error) {
			console.error(files);
			return;
		}
		let blob: Blob;
		if (files.length === 1) {
			blob = files[0].data;
		} else {
			blob = await downloadZip(
				files.map((f) => {
					return { name: f.path, data: f.data, lastModified: new Date() };
				})
			).blob();
		}
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = node.name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	async function moveNode(node: ExplorerNode, newParent: Folder) {
		// Have to update like this for state changes. Maybe there is a better way aka derived in the table
		// So always have children as derived state
		node.parent!.children = node.parent!.children.filter((f) => f.name !== node.name);
		newParent.children = [...newParent.children, node];
		node.parent = newParent;
		return null;
	}

	async function copyNode(node: ExplorerNode, newParent: Folder) {
		const originalName = node.name;

		let baseName = originalName;
		let extension = '';
		const dotIndex = originalName.lastIndexOf('.');
		if (dotIndex !== -1) {
			baseName = originalName.substring(0, dotIndex);
			extension = originalName.substring(dotIndex); // includes the “.”
		}

		let name = originalName;
		let i = 1;
		while (newParent.children.find((f) => f.name === name)) {
			name = `${baseName}_copy_${i}${extension}`;
			i++;
		}
		const newNode = deepCopyExplorerNode(node, newParent);
		newNode.name = name;
		newParent.children = [...newParent.children, newNode];
		return null;
	}
</script>

<div class={cn('flex flex-col', className)}>
	<div
		class="mx-4 mb-4 flex flex-0 items-center justify-between rounded border border-gray-300 bg-gray-100 p-4"
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
			<!-- <Button variant="outline">Upload</Button> -->
            <FileUpload uploadToAdapter={fileFunctions?.upload} />
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

	<DataTable
		data={currentFolder.children}
		onNodeClicked={clickedNode}
		{display}
		class="min-h-0 flex-1 mx-4"
		{showActions}
	>
		{#snippet actionList(node: ExplorerNode)}
			<FileBrowserActions
				{node}
				onDelete={deleteNode}
				onMove={moveNode}
				onCopy={copyNode}
				onDownload={downloadNode}
			/>
		{/snippet}
	</DataTable>
</div>
