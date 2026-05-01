<script lang="ts">
	import { onMount } from 'svelte';
	import type { ExplorerNode } from '$lib/components/file-browser/browser-utils/types.svelte';
	import { Folder, isFolder } from '$lib/components/file-browser/browser-utils/types.svelte';
	import FileBrowser from '$lib/components/file-browser/browser-ui/file-browser.svelte';
	import type { Adapter } from '$lib/components/file-browser/adapters/adapter';
	import { buildFileTree, type InputPath } from '../browser-utils/file-tree.svelte';
	import { joinFsPath } from '../adapters/adapter';

	let {
		adapter,
		pathPrefix = '',
		class: className = ''
	}: {
		adapter: Adapter;
		pathPrefix?: string;
		class?: string;
	} = $props();

	let tree = $state<Folder>(new Folder('home', null, []));
	let currentFolder = $derived(tree);

	function getPathArray(node: ExplorerNode): string[] {
		const parts = [node.name];
		let parent = node.parent;
		while (parent) {
			parts.push(parent.name);
			parent = parent.parent;
		}
		return parts.reverse();
	}

	onMount(async () => {
		const root = await loadRootFolder();
		if (root) {
			tree = root;
		}
	});

	async function loadRootFolder(): Promise<Folder | null> {
		const filePathList: InputPath[] = [];

		async function walk(path?: string): Promise<boolean> {
			const entries = await adapter.list(path);
			if (entries.error) {
				console.error(entries.error);
				return false;
			}

			for (const entry of entries.data) {
				const nextPath = joinFsPath(path ?? '', entry.name);

				if (entry.kind === 'directory') {
					const ok = await walk(nextPath);
					if (!ok) return false;
				} else {
					const file = await adapter.read(nextPath);
					if (file.error) {
						console.error(file.error);
						return false;
					}

					filePathList.push({
						pathTokens: ['home', ...nextPath.split('/')],
						fileData: {
							size: file.data.size,
							mimetype: file.data.type || 'application/octet-stream',
							updatedAt: new Date(file.data.lastModified),
							blob: file.data,
							url: file.data.type.startsWith('image/')
								? Promise.resolve(URL.createObjectURL(file.data))
								: undefined
						}
					});
				}
			}

			return true;
		}

		const ok = await walk();
		if (!ok) {
			return null;
		}

		return buildFileTree(filePathList);
	}

	async function downloadFile(path: string) {
		const file = await adapter.read(path);
		if (file.error) {
			console.error(file.error);
			return '';
		}

		return URL.createObjectURL(file.data);
	}

	$effect(() => {
		for (const child of currentFolder.children) {
			if (
				!isFolder(child) &&
				child?.fileData &&
				child.fileData.mimetype.startsWith('image/') &&
				!child.fileData.url
			) {
				const fullPath = getPathArray(child).slice(1).join('/');
				child.fileData.url = downloadFile(fullPath);
			}
		}
	});
</script>

<FileBrowser
	bind:currentFolder
	homeFolderPath={pathPrefix}
	fileFunctions={adapter}
	class={className}
/>
