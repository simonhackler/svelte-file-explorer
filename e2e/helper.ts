import { createUser } from "./supabase";
import type { Page } from '@playwright/test';

export function generateRandomUserMail() {
    return `${Math.floor(Math.random() * 1000000) + 1}@bromberry.xyz`;
}

export async function fillLoginForm(page: Page, email: string, password: string) {
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
}

export async function getEmailLinkFromSupabaseAdmin(page: Page, linkText: string) {
    await page.goto('http://127.0.0.1:54324/');
    await page.getByText('Admin').nth(0).click();
    const url = await page.locator('#preview-html').contentFrame().getByRole('link', { name: linkText }).getAttribute('href');
    return url!;
}

export async function performLogin(page: Page, email: string, password: string) {
    await page.goto('/01/login');
    await fillLoginForm(page, email, password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL('/protected');
}

export async function setupUserWithEmail() {
    const email = generateRandomUserMail();
    const user = await createUser(email);
    return {email, user};
}

export async function loginAndCreateUser(page: Page) {
    const {email, user} = await setupUserWithEmail();
    await performLogin(page, email, 'password');
    return user;
}
