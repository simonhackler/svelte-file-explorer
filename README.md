# svelte file explorer

> ⚠️ **Alpha**: This project is in alpha and may change unexpectedly.

A shadcn-svelte file explorer. It handles common file operations and allows you to
sync your changes to a storage adapter of your choice.

It is fully stylable with shadcn-svelte.
## Demo
The demo uses local storage only so no files will be sent anywhere.
- Site: https://file-browser-demo.vercel.app/
- Repo: https://github.com/simonhackler/file-browser-demo

## Adapters
- [x] supabase adapter
- [x] local storage adapter
- [ ] s3 adapter
- [ ] local file system
- [ ] ?

## Usage
```svelte
<script>
  import CustomAdapter from 'your-adapter-path';
  import AdapterFileBrowser from 'your-component-path';

  const homePath = '/home';
  const adapter = new CustomAdapter(homePath);
</script>

<AdapterFileBrowser
  {adapter}
  pathPrefix={homePath + '/'}
/>
```

## Install

1. Install shadcn-svelte https://shadcn-svelte.com/docs/installation
2. initialize jsrepo
```bash
jsrepo init https://github.com/simonhackler/svelte-file-explorer
```
3. Configure jsrepo.json
```json
    //...
	"paths": {
        "*": "$lib/blocks",
		"utils": "./src/lib/utils",
		"file-browser": "./src/lib/components/file-browser",
		"ui": "./src/lib/components/ui"
	}
```

4. Install components
```bash
jsrepo add
```

## Acknowledgements
This repo uses components from


https://github.com/ieedan/shadcn-svelte-extras

https://github.com/huntabyte/shadcn-svelte

## License

This project is licensed under the MIT License. See the LICENSE file for details.
