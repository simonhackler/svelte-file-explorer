<script lang="ts">
	import { openLegitFsWithMemoryFs } from '@legit-sdk/core';
	import { Toaster } from 'svelte-sonner';
	import AdapterFileBrowser from '$lib/components/file-browser/browser-ui/adapter-file-browser.svelte';
	import { OPFSAdapter } from '$lib/components/file-browser/adapters/opfs/opdfs-adapter';

	const homePath = '';

	const opfsAdapter = OPFSAdapter.create();

	const legitFs = await openLegitFsWithMemoryFs();
	await legitFs.setCurrentBranch('anonymous');
	await legitFs.promises.mkdir('/.legit/branches/main');
	await legitFs.promises.writeFile('/hello.txt', 'Hello world');
	const data = await legitFs.promises.readFile('/hello.txt', 'utf8');
	console.log(data); // → "Hello world"
	const res = await legitFs.promises.readdir('/', { withFileTypes: true, recursive: false });
	console.log(res); // → [".legit", "hello.txt"]

	// inspect commit history (stored in .legit)
	const history = await legitFs.promises.readFile('/.legit/branches/main/.legit/history', 'utf8');
	console.log(history);
</script>

{#await opfsAdapter then opfsAdapter}
	<AdapterFileBrowser adapter={opfsAdapter} pathPrefix={homePath + '/'} />
{/await}

<Toaster />
