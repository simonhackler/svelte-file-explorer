<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { updatePasswordSchema, type UpdatePasswordSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import PasswordInput from '$lib/components/ui/password-input/password-input.svelte';

	let {
		data,
		updated
	}: { data: { loginForm: SuperValidated<Infer<UpdatePasswordSchema>> }; updated: boolean } =
		$props();

	const form = superForm(data.loginForm, {
		validators: zodClient(updatePasswordSchema)
	});

	const { form: formData, enhance, message } = form;
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	{#if updated}
		<Card.Header>
			<Card.Title class="text-2xl">Password updated successfully</Card.Title>
		</Card.Header>
		<Card.Content>
			<Button href="/protected" class="w-full">Home</Button>
		</Card.Content>
	{:else}
		<Card.Header>
			<Card.Title class="text-2xl">Update your password</Card.Title>
			<Card.Description>Enter your new password below</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance action="?/updatePassword">
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Form.Field {form} name="password">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-sm">Password</Form.Label>
									<PasswordInput {...props} bind:value={$formData.password} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					{#if $message}
						<p class:success={$page.status == 200} class:error={$page.status >= 400}>{$message}</p>
					{/if}
					<Button type="submit" class="w-full">update password</Button>
				</div>
			</form>
		</Card.Content>
	{/if}
</Card.Root>

<style>
	@reference '/src/app.css';

	.error {
		@apply text-red-600;
	}
</style>
