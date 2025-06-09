<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { User } from '@supabase/supabase-js';
	import {
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';
	import { getAllFilesAndConvertToTree } from '$lib/components/supabase/file-viewer/getFileTree.svelte';

	import FileBrowser from '$lib/components/supabase/file-browser/file-browser.svelte';
	import type SupabaseClient from '@supabase/supabase-js/dist/module/SupabaseClient';

	let { supabase, user}: {supabase: SupabaseClient, user: User } = $props();

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
		const files = await Promise.all(
			paths.map(async (path) => {
				const { data, error } = await supabase.storage.from('folders').download(`${path}`);
				return { path, data, error };
			})
		);
		for (const file of files) {
			if (file.error) {
				console.error(file.error);
				return file.error;
			}
		}
		return files.map((file) => {
			return { path: file.path, data: file.data! };
		});
	}

	async function uploadToSupabase(file: File, fullFolderPath: string, overwrite = false) {
		const filepath = `${user.id}/${fullFolderPath}/${file.name}`;
		if (!overwrite) {
			const { error } = await supabase.storage.from('folders').upload(filepath, file);
			if (error) {
				console.error(error);
				return error;
			}
		} else {
			const { error } = await supabase.storage.from('folders').update(filepath, file, {
				upsert: true
			});
			if (error) {
				console.error(error);
				return error;
			}
		}
		return null;
	}

	async function moveFilesInSupabase(files: { filePath: string; path: string }[]) {
        const results = await Promise.all(
            files.map(async (file) => {
                console.log("movinng file " + file.filePath + " to " + file.path);
               return supabase.storage.from('folders').move(file.filePath, file.path);
            })
        );
        for (let result of results) {
            if (result.error) {
                console.error(result.error);
            }
        }
        return null;
    }

    async function copyFilesInSupabase(files: { filePath: string; path: string }[]) {
        const results = await Promise.all(
            files.map(async (file) => {
                console.log("copying file " + file.filePath + " to " + file.path);
               return supabase.storage.from('folders').copy(file.filePath, file.path);
            })
        );
        for (let result of results) {
            if (result.error) {
                console.error(result.error);
            }
        }
        return null;
    }

	async function deleteFiles(paths: string[]) {
		const { error } = await supabase.storage.from('folders').remove(paths);
		return error;
	}

	$effect(() => {
		for (let child of currentFolder.children) {
			if (
				!isFolder(child) &&
				child?.fileData &&
				child.fileData.mimetype.startsWith('image/') &&
				child.fileData.url == undefined
			) {
				child.fileData.url = downloadFile(user.id + '/' + getPath(child).slice(1).join('/'));
			}
		}
	});

	const fileFunctions = {
		onDelete: deleteFiles,
		download: downloadFiles,
		upload: uploadToSupabase,
        move: moveFilesInSupabase,
        copy: copyFilesInSupabase
	};
</script>

<FileBrowser bind:currentFolder homeFolderPath={user.id + '/'} {fileFunctions} class="" />
