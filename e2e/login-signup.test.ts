import { expect, test } from '@playwright/test';
import { fillLoginForm, generateRandomUserMail, getEmailLinkFromSupabaseAdmin, loginAndCreateUser, performLogin, setupUserWithEmail } from './helper';
import { createUser } from './supabase';


test('login', async ({ page }) => {
    await loginAndCreateUser(page);
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
    const {email} = await setupUserWithEmail();

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
