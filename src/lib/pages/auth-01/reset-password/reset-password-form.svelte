<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { resetPasswordSchema, type ResetPasswordSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';

	let { data }: { data: { loginForm: SuperValidated<Infer<ResetPasswordSchema>> } } = $props();

	const form = superForm(data.loginForm, {
		validators: zodClient(resetPasswordSchema)
	});

	const { form: formData, enhance, message } = form;
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Reset your password</Card.Title>
		<Card.Description
			>Enter your email address or username and we’ll send you a link to reset your password</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance action="?/resetPassword">
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
				{#if $message}
					<p class:success={$page.status == 200} class:error={$page.status >= 400}>{$message}</p>
				{/if}
				<Button type="submit" class="w-full">Reset password</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>

<style>
	@reference '/src/app.css';

	.error {
		@apply text-red-600;
	}
</style>
