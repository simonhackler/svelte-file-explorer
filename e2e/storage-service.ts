import { loginAndCreateUser } from './helper';
import { getBucketFiles, supabase_full_access } from './supabase';
import { expect, Page } from '@playwright/test';

export interface StorageService {
    beforeEach: (page: Page) => Promise<string>;
    uploadFile(page: Page, bucketName: string, filePath: string, fileContent?: Blob | File | FormData | ArrayBuffer | ReadableStream | Buffer | string): Promise<{ path: string } | null | undefined>;
    checkFileExistence(page: Page, folderPath: string, fileName: string, expected: boolean): Promise<void>;
}

export class SupabaseStorageService implements StorageService {

    async beforeEach(page: Page): Promise<string> {
        const user = await loginAndCreateUser(page);
        await page.goto('/file-viewer');
        return user.id;
    }

    async uploadFile(page: Page, bucketName: string, filePath: string, fileContent: Blob | File | FormData | ArrayBuffer | ReadableStream | Buffer | string = new Blob()) {
        const { data, error } = await supabase_full_access.storage.from(bucketName).upload(filePath, fileContent);
        if (error) {
            throw new Error(`Supabase uploadFile error: ${error.message}`);
        }
        return data;
    }

    async checkFileExistence(page: Page, folderPath: string, fileName: string, expected: boolean): Promise<void> {
        //const { data, error } = await supabase_full_access.storage.from('folders').list(folderPath);
        const files = await getBucketFiles('folders', folderPath);
        const fileExists = files?.some(file => file === fileName);
        if (expected) {
            expect(fileExists, `Expected file '${fileName}' to exist in folder '${folderPath}', but it was not found. Available files: ${files}`).toBe(true);
        } else {
            expect(fileExists, `Expected file '${fileName}' to NOT exist in folder '${folderPath}', but it was found. Available files: ${files}`).toBe(false);
        }
    }
}
