import type { Folder } from "../utils/types.svelte";

export interface FileFunctions {
    delete: (files: string[]) => Promise<Error | null>;
    download: (files: string[]) => Promise<{result: { path: string; data: Blob } | null; error: Error | null}[]>;
    upload: (file: File, fullFolderPath: string, overwrite?: boolean) => Promise<Error | null>;
    move: (files: { filePath: string; path: string }[]) => Promise<Error | null>;
    copy: (files: { filePath: string; path: string }[]) => Promise<Error | null>;
}

export interface Adapter extends FileFunctions {
    getFolder: () => Promise<{result: Folder | null; error: Error | null}>;
}

