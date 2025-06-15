# svelte file explorer

A shadcn-svelte file explorer. It handles common file operations and allows you to 
sync your changes to a storage adapter of your choice.

It is fully stylable with shadcn-svelte.

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
  const localStorageAdapter = new CustomAdapter(homePath);
</script>

<AdapterFileBrowser
  adapter={localStorageAdapter}
  pathPrefix={homePath + '/'}
/>
```