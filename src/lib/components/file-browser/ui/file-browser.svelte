<script lang="ts">
	import { downloadZip } from 'client-zip';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		deepCopyExplorerNode,
		type ExplorerNode,
		FileLeaf,
		Folder,
		isFolder
	} from '$lib/components/file-browser/utils/types.svelte';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import BreadcrumbRecursive from '$lib/components/file-browser/ui/breadcrumb-recursive.svelte';
	import DataTable from './data-table.svelte';
	import { List, Grid2x2 } from '@lucide/svelte/icons';
	import FileBrowserActions from './file-browser-actions.svelte';
	import { cn } from '$lib/utils/utils';
	import FileUpload from './file-upload.svelte';
	import MoveCopyDialog from './move-copy-dialog.svelte';
	import { Input } from '$lib/components/ui/input';
	import type { FileFunctions } from '../adapters/adapter';

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

	async function onUpload(file: File, overwrite?: boolean) {
		const error = await fileFunctions?.upload(
			file,
			getPath(currentFolder).slice(1).join('/'),
			overwrite
		);
		if (error) {
			console.error(error);
			return error;
		}
		currentFolder.children = [
			...currentFolder.children.filter((f) => f.name !== file.name),
			new FileLeaf(file.name, currentFolder, {
				mimetype: file.type,
				size: file.size,
				updatedAt: new Date(file.lastModified),
				blob: file
			})
		];

		return null;
	}

	const regex = /^(?!\s)(?!.*\s$)[A-Za-z0-9 ]+$/;
	let showCreateInput = $state(false);

	function createFolder() {
		const newFolderName = createFolderInput!.value;
		if (newFolderName === '') {
			return;
		}
		const valid = regex.test(newFolderName);
		if (!valid) {
			return;
		}
		currentFolder.children = [
			...currentFolder.children,
			new Folder(newFolderName, currentFolder, [])
		];
		showCreateInput = false;
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

	async function deleteNodes(nodes: ExplorerNode[]) {
		const allFilesToDelete: string[] = [];

		for (const node of nodes) {
			const path = homeFolderPath + getPath(node).slice(1).join('/');
			const filePaths = getAllFiles(node, path);
			allFilesToDelete.push(...filePaths);
		}

		const error = await fileFunctions?.delete(allFilesToDelete);
		if (error) {
			console.error(error);
			return error;
		} else {
			// Remove all deleted nodes from their parents
			const nodeNames = new Set(nodes.map((n) => n.name));
			for (const node of nodes) {
				if (node.parent) {
					node.parent.children = node.parent.children.filter((f) => !nodeNames.has(f.name));
				}
			}
		}
		return null;
	}

	function getFullPath(node: ExplorerNode): string {
		return homeFolderPath + getPath(node).slice(1).join('/');
	}

	async function downloadNodes(nodes: ExplorerNode[]) {
		const allFilesToDownload: string[] = [];

		for (const node of nodes) {
			const filePaths = getAllFiles(node, getFullPath(node));
			allFilesToDownload.push(...filePaths);
		}

		const files = await fileFunctions?.download(allFilesToDownload);
		if (files == undefined || files instanceof Error) {
			console.error(files);
			return;
		}

		let blob: Blob;
		let downloadName: string;

		if (files.length === 1 && nodes.length === 1) {
			const file = files[0];
			if (file.result) {
				blob = file.result.data;
				downloadName = nodes[0].name;
			}
			else {
				throw new Error(`error when downloading file ${nodes[0].name}`)
			}
		} else {
			blob = await downloadZip(
				files.map((f) => {
					if (f.result) {
						return { name: f.result.path, input: f.result.data };
					}
					throw new Error(`error when downloading file`)
				})
			).blob();
			downloadName = nodes.length === 1 ? nodes[0].name + '.zip' : 'files.zip';
		}

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = downloadName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	async function moveNodes(nodes: ExplorerNode[], newParent: Folder) {
		const moveOperations = nodes.map((node) => ({
			filePath: getFullPath(node),
			path: getFullPath(newParent) + '/' + node.name
		}));

		const error = await fileFunctions?.move(moveOperations);
		if (error) {
			console.error(error);
			return error;
		}

		for (const node of nodes) {
			if (node.parent) {
				node.parent.children = node.parent.children.filter((f) => f.name !== node.name);
			}
			node.parent = newParent;
		}
		newParent.children = [...newParent.children, ...nodes];
		return null;
	}

	async function copyNodes(nodes: ExplorerNode[], newParent: Folder) {
		const copyOperations: { filePath: string; path: string }[] = [];
		const newNodes: ExplorerNode[] = [];

		for (const node of nodes) {
			const originalName = node.name;

			let baseName = originalName;
			let extension = '';
			const dotIndex = originalName.lastIndexOf('.');
			if (dotIndex !== -1) {
				baseName = originalName.substring(0, dotIndex);
				extension = originalName.substring(dotIndex); // includes the "."
			}

			let name = originalName;
			let i = 1;
			while (
				newParent.children.find((f) => f.name === name) ||
				newNodes.find((n) => n.name === name)
			) {
				name = `${baseName}_copy_${i}${extension}`;
				i++;
			}

			copyOperations.push({
				filePath: getFullPath(node),
				path: getFullPath(newParent) + '/' + name
			});

			const newNode = deepCopyExplorerNode(node, newParent);
			newNode.name = name;
			newNodes.push(newNode);
		}

		const error = await fileFunctions?.copy(copyOperations);
		if (error) {
			console.error(error);
			return error;
		}

		newParent.children = [...newParent.children, ...newNodes];
		return null;
	}

	async function deleteNode(node: ExplorerNode) {
		return await deleteNodes([node]);
	}

	async function downloadNode(node: ExplorerNode) {
		return await downloadNodes([node]);
	}

	const fileFunctionsNode = {
		deleteNodes: deleteNodes,
		downloadNodes: downloadNodes,
		moveNodes: setActionMove,
		copyNodes: setActionCopy
	};

	let currentAction: 'copy' | 'move' = $state('copy');
	let openMoveCopy = $state(false);
	let selectedNodes = $state<ExplorerNode[]>([]);

	function setActionCopy(nodes: ExplorerNode[]) {
		currentAction = 'copy';
		openMoveCopyDialog(nodes);
	}

	function setActionMove(nodes: ExplorerNode[]) {
		currentAction = 'move';
		openMoveCopyDialog(nodes);
	}

	function openMoveCopyDialog(nodes: ExplorerNode[]) {
		selectedNodes = nodes;
		openMoveCopy = true;
	}

	async function handleCurrentAction(nodes: ExplorerNode[], currentFolder: Folder) {
		let error = null;
		if (currentAction === 'copy') {
			error = await copyNodes(nodes, currentFolder);
		} else if (currentAction === 'move') {
			error = await moveNodes(nodes, currentFolder);
		}
		if (error) {
			console.error(error);
		} else {
			openMoveCopy = false;
		}
	}
</script>

<div class={cn('flex flex-col', className)}>
	<div
		class="border-border bg-background mx-4 mb-4 flex flex-0 items-center justify-between rounded border p-4"
	>
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<BreadcrumbRecursive
					folder={currentFolder}
					isLast={true}
					onBreadCrumbClick={(folder) => setCurrentFolder(folder)}
				/>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="flex gap-2">
			<FileUpload
				uploadToAdapter={onUpload}
				filesInFolder={currentFolder.children.map((f) => f.name)}
			/>
			<Popover.Root bind:open={showCreateInput}>
				<Popover.Trigger>
					<Button variant="outline"><Plus />Folder</Button>
				</Popover.Trigger>
				<Popover.Content>
					<div class="flex flex-col gap-2">
						<Input placeholder="Folder name" bind:ref={createFolderInput}></Input>
						<Button onclick={() => createFolder()}>Create</Button>
					</div>
				</Popover.Content>
			</Popover.Root>
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
		class="mx-4 min-h-0 flex-1"
		{showActions}
		fileFunctions={fileFunctionsNode}
	>
		{#snippet actionList(node: ExplorerNode)}
			<FileBrowserActions
				{node}
				onDelete={deleteNode}
				onMove={(node) => setActionMove([node])}
				onCopy={(node) => setActionCopy([node])}
				onDownload={downloadNode}
			/>
		{/snippet}
	</DataTable>
</div>

<MoveCopyDialog
	bind:open={openMoveCopy}
	{handleCurrentAction}
	{currentAction}
	nodes={selectedNodes}
/>
