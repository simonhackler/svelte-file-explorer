# Agent Guidelines for Svelte File Explorer

## Commands

- **Build**: `npm run build` or `vite build`
- **Lint**: `npm run lint` (prettier + eslint)
- **Format**: `npm run format`
- **Type Check**: `npm run check`
- **Test**: `npm run test:e2e` (Playwright E2E tests)
- **Single Test**: `npx playwright test <test-name>` (e.g., `npx playwright test file-viewer.test.ts`)
- **Dev Server**: `npm run dev`

## Code Style

- **Formatting**: Uses Prettier with tabs, single quotes, 100 char width
- **TypeScript**: Strict mode enabled, prefer explicit types
- **Imports**: Use `$lib/` alias for internal components, group by type
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Use try/catch blocks, log errors with `console.error()`
- **Svelte 5**: Use new runes syntax (`$state`, `$derived`, `$props`, `$effect`)
- **Components**: Follow bits-ui patterns, use TypeScript interfaces for props
- **CSS**: Tailwind classes, use `cn()` utility for conditional classes

## Testing

- E2E tests in `/e2e` directory using Playwright
- Test files follow pattern: `*.test.ts` or `*.spec.ts`
