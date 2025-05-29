import { expect, test } from '@playwright/test';
import { supabase_full_access } from './supabase';
import { generateRandomUserMail } from './helper';
import type { Page } from '@playwright/test';

async function createUser(email: string, password: string = 'password') {
    const { data, error } = await supabase_full_access.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

async function fillLoginForm(page: Page, email: string, password: string) {
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
}

async function getEmailLinkFromSupabaseAdmin(page: Page, linkText: string) {
    await page.goto('http://127.0.0.1:54324/');
    await page.getByText('Admin').nth(0).click();
    const url = await page.locator('#preview-html').contentFrame().getByRole('link', { name: linkText }).getAttribute('href');
    return url!;
}

async function performLogin(page: Page, email: string, password: string) {
    await page.goto('/01/login');
    await fillLoginForm(page, email, password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL('/protected');
}

async function setupUserWithEmail() {
    const email = generateRandomUserMail();
    await createUser(email);
    return email;
}

test('login', async ({ page }) => {
    const email = await setupUserWithEmail();
    await performLogin(page, email, 'password');
});

test('signup', async ({ page }) => {
    await page.goto('/01/signup');

    const email = generateRandomUserMail();
    await fillLoginForm(page, email, 'password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    
    const url = await getEmailLinkFromSupabaseAdmin(page, 'Confirm your email');
    await page.goto(url, { waitUntil: 'networkidle' });

    expect(page.url()).toContain('protected');
});

test('reset password', async ({ page }) => {
    const email = await setupUserWithEmail();
    
    await page.goto('/01/login');
    await page.getByRole('link', { name: 'Forgot your password?' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Reset password' }).click();
    
    const url = await getEmailLinkFromSupabaseAdmin(page, 'Reset Password');
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.getByRole('textbox', { name: 'Password' }).fill('password_new');
    await page.getByRole('button', { name: 'update password' }).click();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('/');
    
    await performLogin(page, email, 'password_new');
});

test('is protected', async ({ page }) => {
    await page.goto('/protected');
    await page.waitForURL('/');
});
