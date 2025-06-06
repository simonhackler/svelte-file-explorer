<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { FolderIcon, FileIcon, Plus, Ellipsis, Trash2, Folders, FolderOutput } from '@lucide/svelte';
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
	import {
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';
	import { getAllFilesAndConvertToTree } from '$lib/components/supabase/file-viewer/getFileTree.svelte';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import BreadcrumbRecursive from '$lib/components/supabase/file-viewer/breadcrumb-recursive.svelte';
	import { Input } from '$lib/components/ui/input';
	import FileBrowser from '$lib/components/supabase/file-browser/file-browser.svelte';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	const user = $derived(data.user as User);
	let showCreateFolder = $state(false);
	let createFolderInput: HTMLInputElement | null = $state(null);
	let tree = $state<Folder>(new Folder('home', null, []));
	let currentFolder = $state<Folder>(tree);

	function getPath(node: ExplorerNode): string[] {
		let path = [node.name];
		let parent = node.parent;
		while (parent !== null) {
			path.push(parent.name);
			parent = parent.parent;
		}
		return path.reverse();
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
		const path = getPath(currentFolder).slice(1).join('/');
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

    async function downloadFiles(paths: string[]) {
        const files = await Promise.all(paths.map(async (path) => {
		    const { data, error } = await supabase.storage.from('folders').download(`${path}`);
            return {data, error};
        }));
        for (const file of files) {
            if (file.error) {
                console.error(file.error);
                return file.error;
            }
        }
        return files.map(file => file.data!);
    }

	async function uploadToSupabase(file: File, fullFolderPath: string) {
		const filepath = `${user.id}/${fullFolderPath}/${file.name}`;
		const { data, error } = await supabase.storage.from('folders').upload(filepath, file);
		if (error) {
			console.error(error);
		}
		return URL.createObjectURL(file);
	}


    async function deleteFiles(paths: string[]) {
		const { data, error } = await supabase.storage.from('folders').remove(paths);
        return error;
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

    async function deleteNode(node: ExplorerNode) {
        const path = getPath(node).slice(1).join('/');
        const fullPath = `${user.id}/${path}`
        const toDelete = getAllFiles(node, fullPath);
        const { data, error } = await supabase.storage.from('folders').remove(toDelete);
        if (error) {
            console.error(error);
        } else {
            console.log(data);
            currentFolder.children = currentFolder.children.filter((f) => f.name !== node.name);
        }
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
					user.id + '/' + getPath(child).slice(1).join('/')
				);
			}
		}
	});

	$effect(() => {
		if (showCreateFolder) {
			createFolderInput?.focus();
		}
	});

    const fileFunctions = {
        onDelete: deleteFiles,
        download: downloadFiles
    }

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

<FileBrowser bind:currentFolder homeFolderPath={user.id + '/'} {fileFunctions} class="min-h-96 max-h-96"/>
