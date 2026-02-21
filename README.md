# Zeta

Zeta is an agentic coding task management platform focused on fast planning, execution, and switching between coding tasks with minimal workflow overhead.

For deeper context:
- Product vision and requirements: `PRODUCT.md`
- Repository architecture and contributor conventions: `AGENTS.md`

## Table of Contents
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Architecture Overview](#architecture-overview)
- [Development Commands](#development-commands)
- [Testing and Quality Checks](#testing-and-quality-checks)
- [Where to Learn More](#where-to-learn-more)

## Getting Started

### Prerequisites
- Node.js `24.12.0` (managed via `.node-version` for `fnm`)
- npm `11.6.2`

### Install
From the repository root:

```bash
npm install
```

### Run in Development
Run all workspace dev tasks through Turborepo:

```bash
npm run dev
```

Run only a specific workspace:

```bash
npm run dev -- --filter=@zeta/cli
npm run dev -- --filter=desktop
```

## Tech Stack
- Monorepo and task orchestration: Turborepo + npm workspaces
- Language: TypeScript
- Desktop app: Electron + React + Vite + Tailwind CSS + shadcn/ui
- CLI app: Node.js + Commander
- Shared business logic: `packages/commands` (CQRS-style command/query flows)

## Monorepo Structure

```txt
apps/
  cli/       # Node CLI adapter for shared commands
  desktop/   # Electron + React desktop UI
packages/
  commands/  # Shared domain/business commands and queries
```

### Package Responsibilities
- `packages/commands`
  - Shared feature logic used by both desktop and CLI.
  - Uses feature-first folders and CQRS-style separation (commands for writes, queries for reads).
  - Current project-focused flows include project creation and project listing.
- `apps/cli`
  - Thin command-line adapter.
  - Parses input with Commander and delegates execution to `@zeta/commands`.
  - Current command shape includes `zeta projects add [folderPath]`.
- `apps/desktop`
  - Electron shell with React renderer.
  - Presents feature UI (tasks, projects, agents, automations) and calls shared logic through IPC handlers backed by `@zeta/commands`.

## Architecture Overview
This repo follows vertical-slice/feature-first architecture:
- Keep feature code together; only move code to shared locations when truly shared.
- Separate write and read flows (CQRS mindset).
- Prefer composition over inheritance.
- Model operations as focused units with a single `execute` path.

In `packages/commands`, a typical slice includes:
- command/query contracts
- service for validation/business rules
- facade for orchestration
- repository for persistence
- model/response contracts

## Development Commands
Run from repo root unless noted.

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

Useful filtered runs:

```bash
npm run dev -- --filter=@zeta/cli
npm run dev -- --filter=desktop
npm run build -- --filter=@zeta/commands
```

Workspace-level examples:

```bash
npm --workspace apps/desktop run dev
npm --workspace apps/cli run build
npm --workspace apps/cli run start
```

## Testing and Quality Checks
- Automated tests: no committed test framework yet.
- Use these checks today:

```bash
npm run lint
npm run typecheck
npm run build
```

## Where to Learn More
- `PRODUCT.md`: goals, requirements, non-goals, and success criteria.
- `AGENTS.md`: architecture conventions, package responsibilities, coding style, and contribution guidance.
