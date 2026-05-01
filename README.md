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

## Adapter API

Adapters expose one small directory-like API. Every fallible method returns a
`Promise<Result<T, FsError>>`, so check `result.error` before using `result.data`.

Paths are always relative to the adapter root. Use `notes/today.md`, not
`/notes/today.md`.

```ts
interface FsDir {
	list(path?: string): Promise<Result<FsEntry[], FsError>>;
	openDir(path: string): Promise<Result<FsDir, FsError>>;
	ensureDir(path: string): Promise<Result<FsDir, FsError>>;
	read(path: string): Promise<Result<File, FsError>>;
	readText(path: string): Promise<Result<string, FsError>>;
	write(path: string, data: FsWriteData): Promise<Result<void, FsError>>;
	remove(path: string, options?: { recursive?: boolean }): Promise<Result<void, FsError>>;
}
```

`FsEntry` is `{ name: string; kind: 'file' | 'directory' }`.

### Direct usage

```ts
const notes = await adapter.ensureDir('notes');
if (notes.error) return notes;

const saved = await adapter.write('notes/today.md', '# Today\n');
if (saved.error) return saved;

const text = await adapter.readText('notes/today.md');
if (text.error) return text;

console.log(text.data);
```

### Common operations

List files and folders:

```ts
const entries = await adapter.list('notes');
if (entries.error) return entries;

for (const entry of entries.data) {
	console.log(entry.kind, entry.name);
}
```

Get a browser `File` object:

```ts
const file = await adapter.read('notes/today.md');
if (file.error) return file;

console.log(file.data.name, file.data.size, file.data.type);
```

Read text:

```ts
const text = await adapter.readText('notes/today.md');
if (text.error) return text;

console.log(text.data);
```

Upload a file from an `<input type="file">`:

```ts
async function uploadInputFile(input: HTMLInputElement) {
	const file = input.files?.[0];
	if (!file) return;

	const result = await adapter.write(`uploads/${file.name}`, file);
	if (result.error) return result;
}
```

Write generated content:

```ts
const result = await adapter.write('notes/today.md', '# Today\n');
if (result.error) return result;
```

Create nested folders:

```ts
const dir = await adapter.ensureDir('projects/2026/may');
if (dir.error) return dir;
```

Open a subdirectory as its own capability:

```ts
const notes = await adapter.openDir('notes');
if (notes.error) return notes;

const entries = await notes.data.list();
```

Delete a file:

```ts
const removed = await adapter.remove('notes/today.md');
if (removed.error) return removed;
```

Delete a folder and everything inside it:

```ts
const removed = await adapter.remove('notes/archive', { recursive: true });
if (removed.error) return removed;
```

Common errors are:

- `NotFound`: the file or directory does not exist
- `WrongKind`: expected a file but found a directory, or the reverse
- `InvalidPath`: the path is absolute, empty, or contains invalid segments
- `Failed`: storage backend failure

### Creating adapters

```ts
import { LocalStorageAdapter } from '$lib/components/file-browser/adapters/local-storage/local-storage-adapter';

const adapter = new LocalStorageAdapter('/home');
```

```ts
import { OPFSAdapter } from '$lib/components/file-browser/adapters/opfs/opdfs-adapter';

const adapter = await OPFSAdapter.create();
```

```ts
import { SupabaseAdapter } from '$lib/components/file-browser/adapters/supabase/supabase-adapter';

const adapter = new SupabaseAdapter(supabase, user.id);
```

### File browser usage

```svelte
<script lang="ts">
	import AdapterFileBrowser from '$lib/components/file-browser/browser-ui/adapter-file-browser.svelte';
	import { LocalStorageAdapter } from '$lib/components/file-browser/adapters/local-storage/local-storage-adapter';

	const homePath = '/home';
	const adapter = new LocalStorageAdapter(homePath);
</script>

<AdapterFileBrowser {adapter} pathPrefix={homePath + '/'} />
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
