<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import AdapterFileBrowser from '$lib/components/file-browser/browser-ui/adapter-file-browser.svelte';
	import { OPFSAdapter } from '$lib/components/file-browser/adapters/opfs/opdfs-adapter';
	import { onMount } from 'svelte';

	const homePath = '';

	const opfsAdapter = OPFSAdapter.create();
</script>

{#await opfsAdapter then opfsAdapter}
	<AdapterFileBrowser adapter={opfsAdapter} pathPrefix={homePath + '/'} />
{/await}

<Toaster />
