<script lang="ts">
	import { onMount } from 'svelte';
	import type { ExplorerNode } from '$lib/components/file-browser/utils/types.svelte';
	import { Folder, isFolder } from '$lib/components/file-browser/utils/types.svelte';
	import FileBrowser from '$lib/components/file-browser/ui/file-browser.svelte';
	import { LocalStorageAdapter } from '$lib/components/file-browser/adapters/local-storage/local-storage-adapter';

	let { homePath = '/home' }: { homePath?: string } = $props();

	const localStorageAdapter = new LocalStorageAdapter(homePath);

	let tree = $state<Folder>(new Folder('home', null, []));
	let currentFolder = $state<Folder>(tree);

	function pathArray(node: ExplorerNode) {
		const parts = [node.name];
		let p = node.parent;
		while (p) {
			parts.push(p.name);
			p = p.parent;
		}
		return parts.reverse();
	}

	onMount(async () => {
		const { result, error } = await localStorageAdapter.getFolder();
		if (error) {
			console.error(error);
		} else {
			tree = result!;
			currentFolder = tree;
		}
	});

	async function downloadFile(path: string) {
		const res = await localStorageAdapter.download([path]);
		const { result, error } = res[0];
		if (error) {
			console.error(error);
			return '';
		}
		return URL.createObjectURL(result.data);
	}

	$effect(() => {
		for (const c of currentFolder.children) {
			if (!isFolder(c) && c.fileData?.mimetype.startsWith('image/') && !c.fileData.url) {
				c.fileData.url = downloadFile(pathArray(c).slice(1).join('/'));
			}
		}
	});
</script>

<FileBrowser bind:currentFolder homeFolderPath={homePath + '/'} fileFunctions={localStorageAdapter} class="" />
