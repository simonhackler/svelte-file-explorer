import type { FileFunctions, Folder } from "../browser-utils/types.svelte";

export interface Adapter extends FileFunctions {
    getRootFolder: () => Promise<{result: Folder | null; error: Error | null}>;
}

