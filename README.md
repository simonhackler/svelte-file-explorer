# svelte file explorer

> ⚠️ **Alpha**: This project is in alpha and may change unexpectedly.

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
  const adapter = new CustomAdapter(homePath);
</script>

<AdapterFileBrowser
  {adapter}
  pathPrefix={homePath + '/'}
/>
```