<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { FocusEventHandler } from 'svelte/elements';
	import { FolderIcon, FileIcon, Plus } from '@lucide/svelte';
	import {
		displaySize,
		FileDropZone,
		MEGABYTE,
		type FileDropZoneProps
	} from '$lib/components/ui/file-drop-zone';
	import { Progress } from '$lib/components/ui/progress';
	import { XIcon } from '@lucide/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';
	import type { FileObject } from '@supabase/storage-js';
	import * as TreeView from '$lib/components/ui/tree-view';
	import {
		type FileLeaf,
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';
	import { getAllFilesAndConvertToTree } from '$lib/components/supabase/file-viewer/getFileTree.svelte';

	import TreeViewRoot from '$lib/components/supabase/file-viewer/tree-view-root.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import BreadcrumbRecursive from '$lib/components/supabase/file-viewer/breadcrumb-recursive.svelte';
	import { Input } from '$lib/components/ui/input';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	const user = $derived(data.user as User);
	let showCreateFolder = $state(false);
	let createFolderInput: HTMLInputElement | null = $state(null);
	let tree = $state<Folder>(new Folder('home', null, []));
	let currentFolder = $state<Folder>(tree);

	function setCurrentFolder(folder: Folder) {
		currentFolder = folder;
	}

	function getFullPath(node: ExplorerNode): string[] {
		let path = [node.name];
		let parent = node.parent;
		while (parent !== null) {
			path.push(parent.name);
			parent = parent.parent;
		}
		console.log(path);
		return path;
	}

	const onUpload: FileDropZoneProps['onUpload'] = async (files) => {
		await Promise.allSettled(files.map((file) => uploadFile(file)));
	};
	const onFileRejected: FileDropZoneProps['onFileRejected'] = async ({ reason, file }) => {
		console.error(reason, file);
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};
	const uploadFile = async (file: File) => {
		if (files.find((f) => f.name === file.name)) return;
		const path = getFullPath(currentFolder).reverse().slice(1).join('/');
		const urlPromise = uploadToSupabase(file, path);
		files.push({
			name: file.name,
			type: file.type,
			size: file.size,
			uploadedAt: Date.now(),
			url: urlPromise
		});
		// we await since we don't want the onUpload to be complete until the files are actually uploaded
		await urlPromise;
	};
	type UploadedFile = {
		name: string;
		type: string;
		size: number;
		uploadedAt: number;
		url: Promise<string>;
	};
	let files = $state<UploadedFile[]>([]);
	let date = new SvelteDate();
	onDestroy(async () => {
		for (const file of files) {
			URL.revokeObjectURL(await file.url);
		}
	});
	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 10);
		return () => {
			clearInterval(interval);
		};
	});

	onMount(async () => {
		const { data, error } = await getAllFilesAndConvertToTree(supabase);
		if (error) {
			console.error(error);
		} else {
			tree = data;
			currentFolder = tree;
		}
	});

	async function downloadFile(path: string) {
		const { data, error } = await supabase.storage.from('folders').download(`${path}`);
		if (error) {
			console.error(error);
			return '';
		}
		return URL.createObjectURL(data);
	}

	async function uploadToSupabase(file: File, fullFolderPath: string) {
		const filepath = `${user.id}/${fullFolderPath}/${file.name}`;
		const { data, error } = await supabase.storage.from('folders').upload(filepath, file);
		if (error) {
			console.error(error);
		}
		return URL.createObjectURL(file);
	}

	function doubleClickedItem(item: ExplorerNode) {
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

	$effect(() => {
		for (let child of currentFolder.children) {
			if (
				!isFolder(child) &&
				child?.fileData &&
				child.fileData.mimetype.startsWith('image/') &&
				child.fileData.url == undefined
			) {
				child.fileData.url = downloadFile(
					user.id + '/' + getFullPath(child).reverse().slice(1).join('/')
				);
			}
		}
	});

	$effect(() => {
		if (showCreateFolder) {
			createFolderInput?.focus();
		}
	});
</script>

<Toaster />

<div class="flex w-full flex-col gap-2 p-6">
	<FileDropZone
		{onUpload}
		{onFileRejected}
		maxFileSize={2 * MEGABYTE}
		accept="image/*"
		fileCount={files.length}
	/>
	<div class="flex flex-col gap-2">
		{#each files as file, i (file.name)}
			<div class="flex place-items-center justify-between gap-2">
				<div class="flex place-items-center gap-2">
					{#await file.url then src}
						<div class="relative size-9 overflow-clip">
							<img
								{src}
								alt={file.name}
								class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"
							/>
						</div>
					{/await}
					<div class="flex flex-col">
						<span>{file.name}</span>
						<span class="text-muted-foreground text-xs">{displaySize(file.size)}</span>
					</div>
				</div>
				{#await file.url}
					<Progress
						class="h-2 w-full grow"
						value={((date.getTime() - file.uploadedAt) / 1000) * 100}
						max={100}
					/>
				{:then url}
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							URL.revokeObjectURL(url);
							files = [...files.slice(0, i), ...files.slice(i + 1)];
						}}
					>
						<XIcon />
					</Button>
				{/await}
			</div>
		{/each}
	</div>
</div>

<!-- <div>
	<TreeViewRoot node={tree} />
</div> -->

<div class="flex justify-between bg-gray-100 p-4 mb-4 border border-gray-300 mx-4 rounded items-center">
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
		<Button variant="outline">Upload</Button>
		<Button onclick={() => (showCreateFolder = true)} variant="outline"><Plus class="mr-2" />Create folder</Button>
	</div>
</div>
<div class="grid grid-cols-8">
	{#each currentFolder.children as child}
		<Button class="w-full h-full" ondblclick={() => doubleClickedItem(child)} variant="ghost">
			<div class="flex h-full w-full flex-col items-center justify-center gap-4 aspect-square">
				{#if isFolder(child)}
					<FolderIcon class="size-8" />
				{:else if child?.fileData?.url != undefined}
					{#await child.fileData.url}
						<FileIcon class="size-8" />
					{:then url}
						<img src={url} class="object-cover w-1/2" />
					{/await}
				{:else}
					<FileIcon class="size-8" />
				{/if}
				<p>{child.name}</p>
				{#if isFolder(child)}
					<p class="text-muted-foreground text-xs">{child.children.length} items</p>
				{:else}
					<p class="text-muted-foreground text-xs">{displaySize(child?.fileData.size)}</p>
				{/if}
			</div>
		</Button>
	{/each}
	{#if showCreateFolder}
		<Button class="h-full w-full" variant="ghost">
			<div class="flex h-full w-full flex-col items-center justify-center gap-4">
				<FolderIcon class="size-8" />
				<Input onfocusout={createFolder} bind:ref={createFolderInput as HTMLElement} />
			</div>
		</Button>
	{/if}
</div>
