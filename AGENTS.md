# Repository Guidelines

## Product Context
For information about features, the product, and what we are building, see `PRODUCT.md`.

## Project Structure & Module Organization
This repository is an npm workspace/Turborepo monorepo.

- `apps/cli`: Node CLI entrypoint (`src/index.ts`), compiled to `dist/`.
- `apps/desktop`: Electron + Vite desktop app (`src/main.ts`, `src/preload.ts`, `src/renderer.ts`, `src/app.tsx`).
- `packages/commands`: Shared TypeScript command library used by CLI and desktop.
- Root config: `turbo.json`, `tsconfig.base.json`, and workspace-level scripts in `package.json`.

Add new shared logic in `packages/commands` first, then consume it from app packages.

## Build, Test, and Development Commands
Run commands from repo root unless noted.

- `npm run dev`: Runs all package `dev` tasks through Turbo.
- `npm run build`: Builds all workspaces.
- `npm run lint`: Runs lint tasks (currently meaningful in `apps/desktop`).
- `npm run typecheck`: Type-checks all TypeScript packages.
- `npm run dev -- --filter=@zeta/cli`: Run only the CLI in watch mode.
- `npm run build -- --filter=desktop`: Build/package only desktop-related tasks.

Package-level examples:
- `npm --workspace apps/desktop run dev`
- `npm --workspace apps/cli run build`

## Coding Style & Naming Conventions
- Language: TypeScript across apps/packages.
- Indentation: 2 spaces; keep imports grouped and sorted logically.
- Naming: `PascalCase` for React components, `camelCase` for functions/variables, kebab-case for filenames unless framework conventions require otherwise.
- Use path alias `@/*` inside each workspace for local source imports.
- Linting: `apps/desktop` uses ESLint with `@typescript-eslint` and `eslint-plugin-import`.
- For UI components, always add them with `npx shadcn@latest add <component-name>`.
- Always add a simple, concise comment above logical groupings of code.

## Testing Guidelines
There is no committed automated test framework yet. For every change:

- Run `npm run typecheck` and `npm run lint` before opening a PR.
- Validate affected runtime paths manually (CLI command execution, desktop app startup).
- When adding tests, place them beside source as `*.test.ts` or `*.test.tsx` and wire the test task into Turbo.

## Commit & Pull Request Guidelines
Git history is currently minimal (`Initial commit`), so use clear Conventional Commit style going forward:

- `feat(cli): add hello subcommand`
- `fix(desktop): handle missing preload bridge`

PRs should include:
- concise summary and rationale,
- linked issue/ticket (if available),
- verification steps/commands run,
- screenshots or short recordings for desktop UI changes.
