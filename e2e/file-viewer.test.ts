import { expect, test } from '@playwright/test';
import { StorageService, SupabaseStorageService } from './storage-service'; // Import the new service
import { generateRandomUserMail, loginAndCreateUser } from './helper';
import type { Page } from '@playwright/test';
import { LocalStorageService } from './local-storage-service';

const supabaseStorageService = new SupabaseStorageService(); // Instantiate the service
const localStorageFileService = new LocalStorageService('/home'); // Instantiate the service

async function createFolderStructure(page: Page, storageService: StorageService, userId: string) {
    const testFiles = [
        `${userId}/README.md`,
        `${userId}/package.json`,
        `${userId}/.gitignore`,
        
        `${userId}/src/index.ts`,
        `${userId}/src/types/user.types.ts`,
        `${userId}/src/types/api.types.ts`,
        `${userId}/src/components/Header.svelte`,
        `${userId}/src/components/forms/LoginForm.svelte`,
        `${userId}/src/components/forms/SignupForm.svelte`,
        `${userId}/src/utils/helpers.ts`,
        `${userId}/src/utils/validators/email.validator.ts`,
        `${userId}/src/utils/validators/password.validator.ts`,
        
        `${userId}/assets/images/logo.png`,
        `${userId}/assets/images/icons/user-icon.svg`,
        `${userId}/assets/images/backgrounds/hero-bg.jpg`,
        `${userId}/assets/styles/main.css`,
        `${userId}/assets/fonts/Inter-Regular.woff2`,
        
        `${userId}/docs/installation.md`,
        `${userId}/docs/api/authentication.md`,
        `${userId}/docs/api/endpoints/users.md`,
        `${userId}/docs/api/endpoints/files.md`,
        `${userId}/docs/guides/getting-started.md`,
        
        `${userId}/config/database.config.js`,
        `${userId}/config/environments/development.env`,
        `${userId}/config/environments/production.env`,
        `${userId}/config/environments/staging.env`,
        
        `${userId}/tests/unit/components/Header.test.ts`,
        `${userId}/tests/unit/utils/validators.test.ts`,
        `${userId}/tests/integration/auth.test.ts`,
        `${userId}/tests/e2e/user-journey.spec.ts`,
        `${userId}/tests/fixtures/sample-data.json`,
        
        `${userId}/build/dist/index.html`,
        `${userId}/build/dist/assets/bundle.js`,
        `${userId}/build/scripts/deploy.sh`,
        `${userId}/build/docker/Dockerfile`,
        `${userId}/build/docker/docker-compose.yml`,
        
        `${userId}/projects/2024/q1/january/week1/daily-reports/monday.txt`,
        `${userId}/projects/2024/q1/january/week1/daily-reports/tuesday.txt`,
        `${userId}/projects/2024/q2/april/presentations/client-meeting.pptx`,
        `${userId}/projects/2025/planning/roadmap/features/authentication/specs.md`,
        `${userId}/projects/2025/planning/roadmap/features/file-management/wireframes.fig`,
        
        `${userId}/downloads/document.pdf`,
        `${userId}/downloads/spreadsheet.xlsx`,
        `${userId}/downloads/archive.zip`,
        `${userId}/temp/cache/session-123.tmp`,
        `${userId}/temp/uploads/avatar-upload.png`,
        
        `${userId}/special chars/file with spaces.txt`,
        `${userId}/special chars/file-with-dashes.md`,
        `${userId}/special chars/file_with_underscores.js`,
        `${userId}/special chars/file.with.dots.config.json`,
    ];
    
    await Promise.all(testFiles.map(filePath => storageService.uploadFile(page, 'folders', filePath)));
}

async function pressMenuItem(page: Page, fileName: string, itemName: string) {
    await page.getByTestId(fileName).locator('button').click();
    await page.getByRole('menuitem', { name: itemName }).click();
}

[
    {service: supabaseStorageService, name: 'Supabase Storage Service'},
    {service: localStorageFileService, name: 'Local Storage Service'}
].forEach(storageService => {
test(`${storageService.name} test delete folder and files`, async ({ page }) => {
    const path = await storageService.service.beforeEach(page);

    await createFolderStructure(page, storageService.service, path);
    await page.reload({ waitUntil: 'networkidle' });

    await storageService.service.checkFileExistence(page, path, 'README.md', true);
    await storageService.service.checkFileExistence(page, path, 'config/environments/development.env', true);
    await pressMenuItem(page, 'README.md', 'Delete');
    await pressMenuItem(page, 'config', 'Delete');


    await expect(page.getByTestId('README.md')).not.toBeVisible();
    await expect(page.getByTestId('config')).not.toBeVisible();

    await storageService.service.checkFileExistence(page, path, 'README.md', false);
    await storageService.service.checkFileExistence(page, path, 'config/environments/development.env', false);
});

test(`${storageService.name} test move files`, async ({ page }) => {
    const path = await storageService.service.beforeEach(page);
    await createFolderStructure(page, storageService.service, path);
    await page.reload({ waitUntil: 'networkidle' });
    
    await pressMenuItem(page, 'README.md', 'Move');
    await page.getByTestId('downloads').nth(1).click();
    await page.getByRole('button', { name: 'move README.md to downloads' }).click();
    
    await page.getByTestId('downloads').nth(0).click(); 
    await expect(page.getByTestId('README.md')).toBeVisible();
    await page.getByRole('button', { name: 'home' }).click(); 
    await expect(page.getByTestId('README.md')).not.toBeVisible();

    await storageService.service.checkFileExistence(page, path, 'README.md', false);
    await storageService.service.checkFileExistence(page, `${path}/downloads`, 'README.md', true);
});

test(`${storageService.name} test copy files`, async ({ page }) => {
    const path = await storageService.service.beforeEach(page);
    await createFolderStructure(page, storageService.service, path);
    await page.reload({ waitUntil: 'networkidle' });
    
    await pressMenuItem(page, 'README.md', 'Copy');
    await page.getByTestId('downloads').nth(1).click();
    await page.getByRole('button', { name: 'copy README.md to downloads' }).click();

    await page.getByTestId('downloads').nth(0).click(); 
    await expect(page.getByTestId('README.md')).toBeVisible();
    await page.getByRole('button', { name: 'home' }).click(); 
    await expect(page.getByTestId('README.md')).toBeVisible(); 

    await storageService.service.checkFileExistence(page, path, 'README.md', true);
    await storageService.service.checkFileExistence(page, `${path}/downloads`, 'README.md', true);
});

test(`${storageService.name} upload file, upload overwrite and upload rename`, async ({ page }) => {
    const path = await storageService.service.beforeEach(page);
    await createFolderStructure(page, storageService.service, path);
    await page.reload({ waitUntil: 'networkidle' });
    
    await page.getByText('Upload').click();

    const buffer = Buffer.from('hello, world!', 'utf-8');
    const name = 'greeting.txt';

    await page.setInputFiles('input[type="file"]', {
        name,
      mimeType: 'text/plain',
      buffer
    });
    await page.getByLabel('Upload files').getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByTestId(name)).toBeVisible();

    await storageService.service.checkFileExistence(page, path, name, true);

    await page.getByText('Upload').nth(0).click();
    await page.setInputFiles('input[type="file"]', {
        name,
      mimeType: 'text/plain',
      buffer
    });
    await page.getByRole('button', { name: 'Overwrite' }).click();
    await page.getByLabel('Upload files').getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByTestId(name)).toBeVisible();

    await storageService.service.checkFileExistence(page, path, name, true);

    await page.getByText('Upload').nth(0).click();
    await page.setInputFiles('input[type="file"]', {
        name,
      mimeType: 'text/plain',
      buffer
    });
    const renamedName = 'greeting-renamed.txt';
    await page.getByRole('button', { name: 'Rename' }).click();
    await page.locator('input[type="text"]').fill(renamedName);
    await page.getByRole('heading', { name: 'Upload files' }).click();
    await page.getByLabel('Upload files').getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByTestId(renamedName)).toBeVisible();

    await storageService.service.checkFileExistence(page, path, renamedName, true);
});
});
