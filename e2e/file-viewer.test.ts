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

test('test delete folder and files', async ({ page }) => {
    const user = await loginAndCreateUser(page);
    
    const testFiles = [
        `${user.id}/README.md`,
        `${user.id}/package.json`,
        `${user.id}/.gitignore`,
        
        `${user.id}/src/index.ts`,
        `${user.id}/src/types/user.types.ts`,
        `${user.id}/src/types/api.types.ts`,
        `${user.id}/src/components/Header.svelte`,
        `${user.id}/src/components/forms/LoginForm.svelte`,
        `${user.id}/src/components/forms/SignupForm.svelte`,
        `${user.id}/src/utils/helpers.ts`,
        `${user.id}/src/utils/validators/email.validator.ts`,
        `${user.id}/src/utils/validators/password.validator.ts`,
        
        `${user.id}/assets/images/logo.png`,
        `${user.id}/assets/images/icons/user-icon.svg`,
        `${user.id}/assets/images/backgrounds/hero-bg.jpg`,
        `${user.id}/assets/styles/main.css`,
        `${user.id}/assets/fonts/Inter-Regular.woff2`,
        
        `${user.id}/docs/installation.md`,
        `${user.id}/docs/api/authentication.md`,
        `${user.id}/docs/api/endpoints/users.md`,
        `${user.id}/docs/api/endpoints/files.md`,
        `${user.id}/docs/guides/getting-started.md`,
        
        `${user.id}/config/database.config.js`,
        `${user.id}/config/environments/development.env`,
        `${user.id}/config/environments/production.env`,
        `${user.id}/config/environments/staging.env`,
        
        `${user.id}/tests/unit/components/Header.test.ts`,
        `${user.id}/tests/unit/utils/validators.test.ts`,
        `${user.id}/tests/integration/auth.test.ts`,
        `${user.id}/tests/e2e/user-journey.spec.ts`,
        `${user.id}/tests/fixtures/sample-data.json`,
        
        `${user.id}/build/dist/index.html`,
        `${user.id}/build/dist/assets/bundle.js`,
        `${user.id}/build/scripts/deploy.sh`,
        `${user.id}/build/docker/Dockerfile`,
        `${user.id}/build/docker/docker-compose.yml`,
        
        `${user.id}/projects/2024/q1/january/week1/daily-reports/monday.txt`,
        `${user.id}/projects/2024/q1/january/week1/daily-reports/tuesday.txt`,
        `${user.id}/projects/2024/q2/april/presentations/client-meeting.pptx`,
        `${user.id}/projects/2025/planning/roadmap/features/authentication/specs.md`,
        `${user.id}/projects/2025/planning/roadmap/features/file-management/wireframes.fig`,
        
        `${user.id}/downloads/document.pdf`,
        `${user.id}/downloads/spreadsheet.xlsx`,
        `${user.id}/downloads/archive.zip`,
        `${user.id}/temp/cache/session-123.tmp`,
        `${user.id}/temp/uploads/avatar-upload.png`,
        
        `${user.id}/special chars/file with spaces.txt`,
        `${user.id}/special chars/file-with-dashes.md`,
        `${user.id}/special chars/file_with_underscores.js`,
        `${user.id}/special chars/file.with.dots.config.json`,
    ];
    
    
    await Promise.all(testFiles.map(filePath => uploadFileToSupabase('folders', filePath)));
    
    console.log('File structure created successfully!');
    await page.goto('/file-viewer');
    await page.getByTestId('config').locator('button').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    
    await page.getByTestId('README.md').locator('button').click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();


    await expect(page.getByTestId('README.md')).not.toBeVisible();
    await expect(page.getByTestId('config')).not.toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('config')).not.toBeVisible();
    await expect(page.getByTestId('README.md')).not.toBeVisible();
});
