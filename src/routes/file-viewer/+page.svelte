<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';
	import {
		type ExplorerNode,
		Folder,
		isFolder
	} from '$lib/components/supabase/file-viewer/types.svelte';
	import { getAllFilesAndConvertToTree } from '$lib/components/supabase/file-viewer/getFileTree.svelte';

	import SupabaseFileBrowser from '$lib/components/supabase/file-browser/supabase-file-browser.svelte';

	let { data }: { data: PageData } = $props();

	const supabase = $derived(data.supabase);
	const user = $derived(data.user as User);
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

<SupabaseFileBrowser {supabase} {user} />

<Toaster />
