<script lang="ts">
	import { onMount } from 'svelte';
	import { buildTreeFromLocalStorage, parseStoredFileData } from '$lib/components/supabase/file-viewer/getFileTree.svelte';
	import type { ExplorerNode } from '$lib/components/supabase/file-viewer/types.svelte';
	import { Folder, isFolder } from '$lib/components/supabase/file-viewer/types.svelte';
	import FileBrowser from '$lib/components/supabase/file-browser/file-browser.svelte';

	let { homePath = '/home' }: { homePath?: string } = $props();

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

	onMount(async () => {
		tree = await buildTreeFromLocalStorage(homePath);
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
            const fileData = await parseStoredFileData(dataURL);
            const file = new File([fileData.blob!], p, { type: fileData.mimetype });
			out.push({ path: p, data: file });
		}
		return out;
	}

	async function upload(file: File, folderPath: string, overwrite = false): Promise<null | Error> {
		const key = keyFor(`${homePath}/${folderPath}${file.name}`);
		if (!overwrite && localStorage.getItem(key)) {
			return new Error(`File exists: ${key}`);
		}

		const dataURL = await fileToDataURL(file);

		const payload = {
			dataURL,
			size: file.size,
			mimetype: file.type || 'application/octet-stream',
			updatedAt: Date.now()
		};

		localStorage.setItem(key, JSON.stringify(payload));

		return null;
	}

	async function remove(paths: string[]) {
		paths.forEach((p) => localStorage.removeItem(keyFor(p)));
		return null;
	}

	async function move(files: { filePath: string; path: string }[]) {
		for (const file of files) {
			const sourceKey = keyFor(file.filePath);
			const dataURL = localStorage.getItem(sourceKey);
			if (!dataURL) continue;

			const destKey = keyFor(file.path);
			localStorage.setItem(destKey, dataURL);

			localStorage.removeItem(sourceKey);
		}

		return null;
	}

	async function copy(files: { filePath: string; path: string }[]) {
		for (const file of files) {
			const sourceKey = keyFor(file.filePath);
			const dataURL = localStorage.getItem(sourceKey);
			if (!dataURL) continue;

			const destKey = keyFor(file.path);
			localStorage.setItem(destKey, dataURL);
		}

		return null;
	}

	$effect(() => {
		for (const c of currentFolder.children) {
			if (!isFolder(c) && c.fileData?.mimetype.startsWith('image/') && !c.fileData.url) {
				c.fileData.url = downloadFile(pathArray(c).slice(1).join('/'));
			}
		}
	});

	const fileFunctions = {
		onDelete: remove,
		download: downloadFiles,
		upload,
		move,
		copy
	};
</script>

<FileBrowser bind:currentFolder homeFolderPath={homePath + '/'} {fileFunctions} class="" />
