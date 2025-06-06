import { expect, test } from '@playwright/test';
import { supabase_full_access } from './supabase';
import { generateRandomUserMail, loginAndCreateUser } from './helper';
import type { Page } from '@playwright/test';

async function uploadFileToSupabase(bucketName: string, filePath: string, fileContent: Blob = new Blob()) {
    const { data, error } = await supabase_full_access.storage.from(bucketName).upload(filePath, fileContent);
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

async function createFolderStructure(userId: string) {
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
    
    await Promise.all(testFiles.map(filePath => uploadFileToSupabase('folders', filePath)));
}

async function pressMenuItem(page: Page, fileName: string, itemName: string) {
    await page.getByTestId(fileName).locator('button').click();
    await page.getByRole('menuitem', { name: itemName }).click();
}

test('test delete folder and files', async ({ page }) => {
    const user = await loginAndCreateUser(page);
    await createFolderStructure(user.id);
    
    await page.goto('/file-viewer');

    await pressMenuItem(page, 'README.md', 'Delete');
    await pressMenuItem(page, 'config', 'Delete');


    await expect(page.getByTestId('README.md')).not.toBeVisible();
    await expect(page.getByTestId('config')).not.toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('config')).not.toBeVisible();
    await expect(page.getByTestId('README.md')).not.toBeVisible();
});

test('test move files', async ({ page }) => {
    const user = await loginAndCreateUser(page);
    await createFolderStructure(user.id);
    
    await page.goto('/file-viewer');
    await pressMenuItem(page, 'README.md', 'Move');
    await page.locator('#bits-9').getByTestId('downloads').click();
    await page.getByRole('button', { name: 'move README.md to downloads' }).click();
    await page.getByTestId('downloads').nth(0).click();
    await expect(page.getByTestId('README.md')).toBeVisible();
});

test('test copy files', async ({ page }) => {
    const user = await loginAndCreateUser(page);
    await createFolderStructure(user.id);
    
    await page.goto('/file-viewer');
    await pressMenuItem(page, 'README.md', 'Copy');
    await page.locator('#bits-9').getByTestId('downloads').click();
    await page.getByRole('button', { name: 'copy README.md to downloads' }).click();
    await page.getByTestId('downloads').nth(0).click();
    await expect(page.getByTestId('README.md')).toBeVisible();
});