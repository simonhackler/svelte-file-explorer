<script lang="ts">
	import { onMount } from 'svelte';
	import { buildTreeFromLocalStorage } from '$lib/components/supabase/file-viewer/getFileTree.svelte';
	import type { ExplorerNode } from '$lib/components/supabase/file-viewer/types.svelte';
	import { Folder, isFolder } from '$lib/components/supabase/file-viewer/types.svelte';
	import FileBrowser from '$lib/components/supabase/file-browser/file-browser.svelte';

	let { homePath = '/home' }: { homePath?: string } = $props();

	// ------- reactive state -------
	let tree = $state<Folder>(new Folder('home', null, []));
	let currentFolder = $state<Folder>(tree);

	const keyFor = (path: string) => `${path}`;

	function pathArray(node: ExplorerNode) {
		const parts = [node.name];
		let p = node.parent;
		while (p) {
			parts.push(p.name);
			p = p.parent;
		}
		return parts.reverse();
	}

	function fileToDataURL(file: File) {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	onMount(() => {
		tree = buildTreeFromLocalStorage(homePath);
		currentFolder = tree;
	});

	async function downloadFile(path: string) {
		const dataURL = localStorage.getItem(keyFor(path));
		if (!dataURL) return '';
		const blob = await fetch(dataURL).then((r) => r.blob());
		return URL.createObjectURL(blob);
	}

	async function downloadFiles(paths: string[]) {
		const out: { path: string; data: Blob }[] = [];
		for (const p of paths) {
			const dataURL = localStorage.getItem(keyFor(p));
			if (!dataURL) continue;
			const blob = await fetch(dataURL).then((r) => r.blob());
			out.push({ path: p, data: blob });
		}
		return out;
	}

	async function upload(file: File, folderPath: string, overwrite = false) {
		const key = keyFor(`${homePath}/${folderPath}${file.name}`);
		console.log('uploading to ' + key);
		if (!overwrite && localStorage.getItem(key)) return new Error(`File exists: ${key}`);

		const dataURL = await fileToDataURL(file);
		localStorage.setItem(key, dataURL);

		currentFolder = tree;
		return null;
	}

	async function remove(paths: string[]) {
		paths.forEach((p) => localStorage.removeItem(keyFor(p)));
		return null;
	}

	async function move(files: { filePath: string; path: string }[]) {
		for (const file of files) {
			// Get the source file data
			const sourceKey = keyFor(file.filePath);
			const dataURL = localStorage.getItem(sourceKey);
			if (!dataURL) continue;

			// Save to destination
			const destKey = keyFor(file.path);
			localStorage.setItem(destKey, dataURL);

			// Remove from source
			localStorage.removeItem(sourceKey);
		}

		return null;
	}

	async function copy(files: { filePath: string; path: string }[]) {
		for (const file of files) {
			// Get the source file data
			const sourceKey = keyFor(file.filePath);
			const dataURL = localStorage.getItem(sourceKey);
			if (!dataURL) continue;

			// Save to destination
			const destKey = keyFor(file.path);
			localStorage.setItem(destKey, dataURL);
		}

		return null;
	}

	// optional helpers (no‑ops for simple demo)
	const noop = async () => null;

	// ------- previews for images -------
	$effect(() => {
		for (const c of currentFolder.children) {
			if (!isFolder(c) && c.fileData?.mimetype.startsWith('image/') && !c.fileData.url) {
				c.fileData.url = downloadFile(pathArray(c).slice(1).join('/'));
			}
		}
	});

	// ------- contract handed to <FileBrowser> -------
	const fileFunctions = {
		onDelete: remove,
		download: downloadFiles,
		upload,
		move,
		copy
	};
</script>

<FileBrowser bind:currentFolder homeFolderPath={homePath + '/'} {fileFunctions} class="" />
