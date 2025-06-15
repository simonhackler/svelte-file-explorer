import type { FileFunctions, Folder } from "../browser-utils/types.svelte";

export interface Adapter extends FileFunctions {
    getFolder: () => Promise<{result: Folder | null; error: Error | null}>;
}

