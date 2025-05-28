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

    await page.goto('/01/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL('/protected');
});

test('signup', async ({ page }) => {
    await page.goto('/01/signup');

    const email = generateRandomUserMail();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.goto('http://127.0.0.1:54324/');
    await page.getByText('Admin').nth(0).click();
    const url = await page.locator('#preview-html').contentFrame().getByRole('link', { name: 'Confirm your email' }).getAttribute('href');
    await page.goto(url);

    await expect(page.url()).toContain('protected');
});

test('reset password', async ({ page }) => {
    const email = generateRandomUserMail();
    const { data, error } = await supabase_full_access.auth.admin.createUser({
        email,
        password: 'password',
        email_confirm: true,
    })
    if (error) {
        throw new Error(error.message);
    }
    await page.goto('/01/login');
    await page.getByRole('link', { name: 'Forgot your password?' }).click();
});

test('is protected', async ({ page }) => {
    await page.goto('/protected');
    await page.waitForURL('/');
});
