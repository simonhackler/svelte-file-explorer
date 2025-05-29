<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { loginSchema, type LoginSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import PasswordInput from '$lib/components/ui/password-input/password-input.svelte';
	import { page } from '$app/stores';

	let {
		data,
		mode = 'login'
	}: { data: { loginForm: SuperValidated<Infer<LoginSchema>> }; mode: 'login' | 'signup' } = $props();

	const form = superForm(data.loginForm, {
		validators: zodClient(loginSchema)
	});

	const { form: formData, enhance, message } = form;
    const action = $derived(mode === 'login' ? '?/login' : '?/signup');
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		{#if mode === 'login'}
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
		{:else}
			<Card.Title class="text-2xl">Sign-up</Card.Title>
			<Card.Description>Enter your email below to login create a new account</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance {action}>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Input {...props} bind:value={$formData.email} placeholder="m@example.com" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="grid gap-2">
					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center">
									<Form.Label class="text-sm">Password</Form.Label>
									{#if mode === 'login'}
										<a href="/01/reset-password" class="ml-auto inline-block text-sm underline">
											Forgot your password?
										</a>
									{/if}
								</div>
								<PasswordInput {...props} bind:value={$formData.password} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				{#if $message}
					<p class:success={$page.status == 200} class:error={$page.status >= 400}>{$message}</p>
				{/if}
				<Button type="submit" class="w-full">Login</Button>
				<Button variant="outline" class="w-full">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path
							d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
							fill="currentColor"
						/>
					</svg>
					Login with Google
				</Button>
			</div>
			<div class="mt-4 text-center text-sm">
				{#if mode === 'login'}
					Don't have an account?
					<a href="/01/signup" class="underline"> Sign up </a>
				{:else}
					Already have an account?
					<a href="/01/login" class="underline"> Login </a>
				{/if}
			</div>
		</form>
	</Card.Content>
</Card.Root>

<style>
    @import '/src/app.css';

	.success {
		color: green;
	}
	.error {
		@apply text-red-600;
	}
</style>
