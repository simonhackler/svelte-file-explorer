import { expect, test } from '@playwright/test';
import { supabase_full_access } from './supabase';
import { generateRandomUserMail } from './helper';

test('login', async ({ page }) => {
    const email = generateRandomUserMail();

    const { data, error } = await supabase_full_access.auth.admin.createUser({
        email,
        password: 'password',
        email_confirm: true,
    })
    if (error) {
        throw new Error(error.message);
    }

    await page.goto('/login-01');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL('/protected');
});

test('is protected', async ({ page }) => {
    await page.goto('/protected');
    await page.waitForURL('/');
});
