<script lang="ts">
	import { openLegitFsWithMemoryFs } from '@legit-sdk/core';
	import { Toaster } from 'svelte-sonner';
	import AdapterFileBrowser from '$lib/components/file-browser/browser-ui/adapter-file-browser.svelte';
	import { OPFSAdapter } from '$lib/components/file-browser/adapters/opfs/opdfs-adapter';

	const homePath = '';

	const opfsAdapter = OPFSAdapter.create();

	const legitFs = await openLegitFsWithMemoryFs();
    let branches = await legitFs.promises.readdir('.legit/branches');
    console.log(branches);
	await legitFs.setCurrentBranch('anonymous');
	await legitFs.promises.mkdir('/.legit/branches/main');
    branches = await legitFs.promises.readdir('.legit/branches');
    console.log(branches);
	await legitFs.promises.writeFile('.legit/branches/main/.hello.txt', 'Hello world');
	const data = await legitFs.promises.readFile('.legit/branches/main/.hello.txt', 'utf8');
    console.log("stat");
    console.log(await legitFs.promises.stat('.legit/branches/main/.hello.txt'));
	console.log("data", data); // → "Hello world"
	const res = await legitFs.promises.readdir('/');
	console.log("res", res); // → [".legit", "hello.txt"]

	// inspect commit history (stored in .legit)
	const history = await legitFs.promises.readFile('/.legit/branches/main/.legit/history', 'utf8');
	console.log("history", history);
    console.log(await legitFs.promises.readdir('/'));

    const statusContent = await legitFs.promises.readFile('.legit/status', 'utf8');
    const status = JSON.parse(statusContent);
    console.log(status.branch); // Current branch name
    console.log(status.files); // Array of modified files
</script>

{#await opfsAdapter then opfsAdapter}
	<AdapterFileBrowser adapter={opfsAdapter} pathPrefix={homePath + '/'} />
{/await}

<Toaster />
