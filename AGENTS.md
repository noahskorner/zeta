# Repository Guidelines

## Product Context
For information about features, the product, and what we are building, see `PRODUCT.md`.

## Repository Architecture
This repository is an npm workspace/Turborepo monorepo organized around feature slices and shared business commands.

### Architectural Principles
- Vertical Slice / Feature Slice: Organize code by feature, not by technical layer. Move code to shared locations only when it is truly shared across features.
- CQRS: Keep write operations (commands) and read operations (queries) separate in modeling and handling.
- Composition over Inheritance: Prefer composing focused units unless inheritance provides clear value.
- Single Responsibility Execution Model: Most classes represent one operation and expose one `execute` method. Class names describe the operation.

### Package Responsibilities
- `packages/commands` (`packages/command` in some docs): Shared feature logic and business operations used by multiple apps. Core command/query workflows originate here.
- `apps/cli`: Thin `commander`-based interface that parses CLI input and invokes shared logic from `packages/commands`.
- `apps/desktop`: Electron + React application that delivers feature UI and calls shared commands/query flows from `packages/commands`.

### `packages/commands` Structure
Use feature-first folders. Keep each feature self-contained and move code upward only when truly shared.

```txt
src/
  task/
    create/
      create-task.command.ts
      create-task.model.ts
      create-task.response.ts
      create-task.facade.ts
      create-task.service.ts
      create-task.repository.ts
    find/
      find-task.query.ts
    task.entity.ts
    task.repository.ts
  repository.ts
```

Layer responsibilities:
- Command / Query: Input contracts for mutation vs read flows.
- Service: Validation and business rules.
- Facade: Feature orchestration across services, repositories, and integrations.
- Repository: Persistence concerns (DB/filesystem/API).
- Model / Response: Internal models and external response contracts.

### `apps/cli` Structure and Role
`apps/cli` is a thin adapter around shared commands.

```txt
src/
  task/
    index.ts
  index.ts
```

Responsibilities:
- Parse arguments/options and register commands (for example `addProjects(program)`).
- Map CLI inputs to shared command/query objects.
- Handle CLI-only output formatting and process concerns.

### `apps/desktop` Structure and Role
`apps/desktop` is an Electron app with a React renderer and shadcn/ui components.

```txt
src/
  components/
    ui/
    example-component.tsx
  hooks/
  lib/
  features/
```

Guidelines:
- `components/ui`: shadcn components only; install with `npx shadcn@latest add <component-name>` and do not manually edit generated primitives.
- `components/`: only truly shared app components.
- `hooks/` and `lib/`: only shared hooks/utilities.
- `features/`: default location for feature-specific UI, hooks, and logic (vertical slices).

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
- Linting: `apps/desktop` uses ESLint with `@typescript-eslint` and `eslint-plugin-import`.
- For UI components, always add them with `npx shadcn@latest add <component-name>`.
- Always add a simple, concise comment above logical groupings of code.

## Testing Guidelines
There is no committed automated test framework yet.

## Commit & Pull Request Guidelines
Use Conventional Commits for all commit messages and PR titles.

- Format: `<type>(<optional-scope>): <short imperative summary>`
- Common types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `build`, `ci`, `perf`, `style`, `revert`.
- Keep summaries concise and specific to the behavior or code change.

Examples:
- `feat(cli): add hello subcommand`
- `fix(desktop): handle missing preload bridge`
- `docs(root): clarify workspace build commands`
- `chore(commands): update tsconfig references`
