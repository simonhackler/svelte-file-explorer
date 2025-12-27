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
- **Svelte 5**: Use new runes syntax (`$state`, `$derived`, `$props`, `$effect`)
- **Components**: Follow bits-ui patterns, use TypeScript interfaces for props
- **CSS**: Tailwind classes, use `cn()` utility for conditional classes

## Testing

- E2E tests in `/e2e` directory using Playwright
- Test files follow pattern: `*.test.ts` or `*.spec.ts`

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
