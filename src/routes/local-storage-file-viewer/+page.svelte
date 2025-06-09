<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import type { User } from '@supabase/supabase-js';
	import {
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';
	import { getAllFilesAndConvertToTree } from '$lib/components/supabase/file-viewer/getFileTree.svelte';
	import LocalStorageFileBrowser from '$lib/components/local-storage/file-browser/local-storage-file-browser.svelte';


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
		// const { data, error } = await getAllFilesAndConvertToTree();
		// if (error) {
		// 	console.error(error);
		// } else {
		// 	tree = data;
		// 	currentFolder = tree;
		// }
	});

</script>

<LocalStorageFileBrowser />

<Toaster />
