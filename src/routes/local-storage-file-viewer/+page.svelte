<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import AdapterFileBrowser from '$lib/components/file-browser/ui/adapter-file-browser.svelte';
	import { LocalStorageAdapter } from '$lib/components/file-browser/adapters/local-storage/local-storage-adapter';

    const homePath = '/home';
	const localStorageAdapter = new LocalStorageAdapter(homePath);
</script>

<AdapterFileBrowser
	adapter={localStorageAdapter}
	pathPrefix={homePath + '/'}
/>

<Toaster />
