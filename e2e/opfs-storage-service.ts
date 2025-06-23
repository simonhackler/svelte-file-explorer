// opfs-storage-service.ts
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { StorageService } from './storage-service';

export class OPFSStorageService implements StorageService {
    private readonly homePath: string;

    constructor(homePath: string = '/home') {
        this.homePath = homePath;
    }

    /**
     * Clears OPFS completely before each test run.
     */
    async beforeEach(page: Page): Promise<string> {
        await page.goto('/opfs');    // change if your route differs

        await page.evaluate(async () => {
            const root = await navigator.storage.getDirectory();

            // Modern browsers now support recursive removal ✔
            for await (const [name] of root.entries()) {
                await root.removeEntry(name, { recursive: true });
            }
        });

        return this.homePath;
    }

    async uploadFile(
        page: Page,
        _bucketName: string,
        filePath: string,
        fileContent?: Blob | File | FormData | ArrayBuffer | ReadableStream | Buffer | string
    ): Promise<{ path: string } | null> {
        const data: string = typeof fileContent === 'string'
            ? fileContent
            : 'test-file-content';

        await page.evaluate(
            async ([fullPath, text]) => {
                const parts = fullPath.split('/').filter(Boolean);
                const fileName = parts.pop()!;
                let dir: FileSystemDirectoryHandle = await navigator.storage.getDirectory();
                for (const part of parts) {
                    dir = await dir.getDirectoryHandle(part, { create: true });
                }
                const fileHandle = await dir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(text);
                await writable.close();
            },
            [filePath, data]
        );

        return { path: filePath };
    }

    async checkFileExistence(
        page: Page,
        folderPath: string,
        fileName: string,
        expected: boolean
    ): Promise<void> {
        const fullPath = `${folderPath}/${fileName}`;

        const fileExists: boolean = await page.evaluate(async (path: string) => {
            const parts = path.split('/').filter(Boolean);
            const target = parts.pop()!;
            try {
                let dir: FileSystemDirectoryHandle = await navigator.storage.getDirectory();
                for (const part of parts) {
                    dir = await dir.getDirectoryHandle(part);
                }
                await dir.getFileHandle(target);
                return true;
            } catch {
                return false;
            }
        }, fullPath);

        if (expected) {
            expect(fileExists, `File "${fullPath}" should exist in OPFS`).toBe(true);
        } else {
            expect(fileExists, `File "${fullPath}" should NOT exist in OPFS`).toBe(false);
        }
    }
}

