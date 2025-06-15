<script lang="ts">
	import AdapterFileBrowser from '$lib/components/file-browser/ui/adapter-file-browser.svelte';
	import { LocalStorageAdapter } from '$lib/components/file-browser/adapters/local-storage/local-storage-adapter';

	let { homePath = '/home' }: { homePath?: string } = $props();

	const localStorageAdapter = new LocalStorageAdapter(homePath);
</script>

<AdapterFileBrowser 
	adapter={localStorageAdapter} 
	homeFolderPath={homePath + '/'} 
	class="" 
/>
