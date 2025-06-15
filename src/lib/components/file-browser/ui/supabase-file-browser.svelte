<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { User } from '@supabase/supabase-js';
	import {
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/file-browser/utils/types.svelte';
	import FileBrowser from '$lib/components/file-browser/ui/file-browser.svelte';
	import type SupabaseClient from '@supabase/supabase-js/dist/module/SupabaseClient';
	import { SupabaseAdapter } from '../adapters/supabase/supabase-adapter';

	let { supabase, user}: {supabase: SupabaseClient, user: User } = $props();

    const supabaseAdapter = new SupabaseAdapter(supabase, user.id);

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
		const { result, error } = await supabaseAdapter.getFolder();
		if (error) {
			console.error(error);
		} else {
			tree = result!;
			currentFolder = tree;
		}
	});

	async function downloadFile(path: string) {
        const res = await supabaseAdapter.download([path]);

		const { result, error } = res[0];
		if (error) {
			console.error(error);
			return '';
		}
		return URL.createObjectURL(result.data);
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

</script>

<FileBrowser bind:currentFolder homeFolderPath={user.id + '/'} fileFunctions={supabaseAdapter} class="" />
