<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import AdapterFileBrowser from '$lib/components/file-browser/browser-ui/adapter-file-browser.svelte';
	import { OPFSAdapter } from '$lib/components/file-browser/adapters/opfs/opdfs-adapter';

	const homePath = '';

	let opfsAdapter: OPFSAdapter;
	async function pickFolder() {
		const folderHandle = await window.showDirectoryPicker();
		opfsAdapter = new OPFSAdapter(folderHandle);
	}
</script>

<button onclick={() => pickFolder()}>Pick folder</button>

{#if opfsAdapter}
	<AdapterFileBrowser adapter={opfsAdapter} pathPrefix={homePath + '/'} />
{/if}

<Toaster />
