import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { StorageService } from './storage-service';

export class LocalStorageService implements StorageService {
    private userId: string;

    constructor(userId: string = '/home') {
        this.userId = userId;
    }

    private keyFor(path: string): string {
        return `${this.userId}/${path}`;
    }

    async beforeEach(page: Page): Promise<string> {
        await page.goto('/local-storage-file-viewer');
        return '/home'; 
    }

    async uploadFile(
        page: Page,
        bucketName: string, // Ignored for localStorage as it doesn't use buckets
        filePath: string, // This is the full path like 'userId/file.txt' or 'userId/subdir/file.txt'
        fileContent?: Blob | File | FormData | ArrayBuffer | ReadableStream | Buffer | string
    ): Promise<{ path: string } | null | undefined> {
        // Remove userId prefix if it exists in filePath to avoid double prefixing
        const cleanPath = filePath.startsWith(this.userId + '/') ? 
            filePath.slice(this.userId.length + 1) : filePath;
        
        const storageKey = this.keyFor(cleanPath);
        
        // Convert file content to data URL format that matches the file browser
        let dataURL = 'data:text/plain;base64,';
        if (typeof fileContent === 'string') {
            dataURL = `data:text/plain;base64,${btoa(fileContent)}`;
        } else if (fileContent instanceof Blob || fileContent instanceof File) {
            // For test purposes, create a simple data URL
            dataURL = `data:${(fileContent as File).type || 'application/octet-stream'};base64,${btoa('test-content')}`;
        } else {
            // Default fallback
            dataURL = 'data:text/plain;base64,' + btoa('test-file-content');
        }

        await page.evaluate(([key, value]) => {
            localStorage.setItem(key, value);
        }, [storageKey, dataURL]);
        
        return { path: filePath };
    }

    async checkFileExistence(
        page: Page,
        folderPath: string, // This is the directory path like 'userId' or 'userId/subdir'
        fileName: string,   // This is the file name like 'file.txt'
        expected: boolean
    ): Promise<void> {
        // Remove userId prefix if it exists in folderPath to avoid double prefixing
        const cleanFolderPath = folderPath.startsWith(this.userId + '/') ? 
            folderPath.slice(this.userId.length + 1) : folderPath;
        
        // Construct the full file path
        const constructedFilePath = cleanFolderPath ? `${cleanFolderPath}/${fileName}` : fileName;
        const storageKey = this.keyFor(constructedFilePath);

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
