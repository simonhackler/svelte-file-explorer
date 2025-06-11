import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { StorageService } from './storage-service';

export class LocalStorageService implements StorageService {
    private homePath: string;

    constructor(homePath: string = '/home') {
        this.homePath = homePath;
    }

    private keyFor(path: string): string {
        return `${this.homePath}/${path}`;
    }

    async beforeEach(page: Page): Promise<string> {
        await page.goto('/local-storage-file-viewer');
        return '/home'; 
    }

    async uploadFile(
        page: Page,
        bucketName: string, // Ignored for localStorage as it doesn't use buckets
        filePath: string, 
        fileContent?: Blob | File | FormData | ArrayBuffer | ReadableStream | Buffer | string
    ): Promise<{ path: string } | null | undefined> {
        
        const storageKey = filePath;
        
        let dataURL = 'data:text/plain;base64,';
        if (typeof fileContent === 'string') {
            dataURL = `data:text/plain;base64,${btoa(fileContent)}`;
        } else if (fileContent instanceof Blob || fileContent instanceof File) {
            dataURL = `data:${(fileContent as File).type || 'application/octet-stream'};base64,${btoa('test-content')}`;
        } else {
            dataURL = 'data:text/plain;base64,' + btoa('test-file-content');
        }

        await page.evaluate(([key, value]) => {
            localStorage.setItem(key, value);
        }, [storageKey, dataURL]);
        
        return { path: filePath };
    }


    async checkFileExistence(
        page: Page,
        folderPath: string, 
        fileName: string,   
        expected: boolean
    ): Promise<void> {
        const constructedFilePath = `${folderPath}/${fileName}`; 
        const storageKey = (constructedFilePath);

        const fileExists = await page.evaluate((key: string) => {
            return localStorage.getItem(key) !== null;
        }, storageKey);

        if (expected) {
            expect(fileExists, `File '${constructedFilePath}' was expected to exist in localStorage but was not found. Key: ${storageKey}`).toBe(true);
        } else {
            expect(fileExists, `File '${constructedFilePath}' was expected not to exist in localStorage but was found. Key: ${storageKey}`).toBe(false);
        }
    }
}
