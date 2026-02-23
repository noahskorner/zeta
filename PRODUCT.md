## Goal

Create a simple, extensible agentic task management platform that enables rapid planning, execution, and switching between tool-driven tasks. The system should prioritize speed, clarity, and minimal friction.

---

## Vision

While the MVP focuses on **developer workflows**, the architecture is designed to be role-agnostic. The abstraction layer for tools, adapters, and workflows should support any discipline:

- **Developers**: Codex, Claude Code, GitHub Copilot, terminal commands
- **Designers**: Figma, Sketch, Adobe Creative Suite
- **Business/Product**: PowerPoint, Google Slides, documentation tools
- **QA/Testing**: Test runners, automation frameworks
- **Operations**: Deployment pipelines, monitoring tools

The core concepts (tasks, swimlanes, workflows, tools, adapters) remain consistent across all roles. This enables cross-functional teams to collaborate within a single platform, each using their domain-specific tools while sharing the same task management structure.

**MVP scope**: Developer-focused workflows with coding tools and agents.

---

## Core Principles

- Minimal UI and workflow overhead
- Markdown-first for all specs and tasks
- Git-native (worktrees, branches, commits)
- Tool-agnostic (supports multiple coding tools and agents)
- Extensible architecture for future automation and integrations

---

## Requirements

### 1. Markdown-First Authoring

- First-class markdown editor with:
  - Syntax highlighting
  - Live preview
  - File-based persistence in the repo

- Global product spec:
  - `PRODUCT.md` defines overall product vision, architecture, and constraints
  - Stored in the repository
  - Editable and refinable via AI

- Task specs:
  - Each task is a standalone markdown file
  - Stored in a predictable directory (e.g., `/tasks/`)
  - Editable manually or refined via AI

---

### 2. Task Management

- Task lifecycle support:
  - Backlog
  - Ready
  - In Progress
  - Review
  - Complete

- Core task capabilities:
  - Create, edit, refine, and delete tasks
  - Refine tasks via AI ("improve this spec")
  - Organize tasks via swimlanes with configurable tool/adapter/human assignees
  - Link tasks to branches and worktrees

---

### 3. Task Execution

- Starting a task:
  - Creates a Git worktree
  - Creates or associates a branch
  - Associates the task with the worktree
- Tool dispatch:
  - Sends the task spec to the tool assigned in the current swimlane
  - Tool executes in PTY/interactive terminal visible to the user
  - Adapter provides notifications and integration hooks
- Task workspace management:
  - Open worktree in editor
  - Switch between active tasks instantly
  - Track task status (idle, running, awaiting input, ready for review)

---

### 4. Task Review and Completion

- Review workflow:
  - Switch to task worktree
  - Review changes manually or with agent assistance
  - Iterate via agent feedback
- Completion workflow:
  - Merge branch into main
  - Mark task complete
  - Optionally delete worktree

---

### 5. Automations

- Scheduled or triggered automations:
  - Periodically prompt agent to:
    - Review repository changes
    - Update documentation (`PRODUCT.md`, `AGENTS.md`, `SKILL.md`, etc.)
    - Improve specs or task structure
- Automation system must support:
  - Scheduled triggers (cron-like)
  - Manual triggers
  - Pluggable agent execution

---

## Architecture Requirements

### Tools

Tools are the execution layer for tasks. The abstraction supports any executable tool, not just coding agents.

- First-party tools:
  - Built-in tools provided by the platform
  - Pre-configured for common use cases
  - MVP: Coding-focused (Codex, Claude Code, etc.)
  - Future: Design tools, presentation tools, etc.

- User-configurable tools:
  - Any command the user wants to run
  - Fully customizable arguments and behavior
  - Displayed in PTY/interactive terminal for visibility
  - Could invoke CLI tools, scripts, or GUI applications

---

### Adapters

Adapters hook into tools to provide enhanced integration and user experience. The adapter interface is generic to support tools across any domain.

- First-party adapters (MVP - developer tools):
  - Codex
  - Claude Code
  - GitHub Copilot
  - VSCode
  - Other local or remote agents

- Future adapters (post-MVP):
  - Figma (design sync, export notifications)
  - Google Slides / PowerPoint (presentation generation)
  - Notion / Confluence (documentation)
  - Custom enterprise tools

- Adapter capabilities:
  - Notifications when user input is requested
  - Notifications when task is complete
  - Status tracking and progress reporting
  - Parsing tool output for structured data

Must be extensible for future tools and adapters across all disciplines.

---

### Swimlanes

Swimlanes represent stages in a workflow where tasks can be assigned to tools, adapters, or humans.

- Each swimlane can have:
  - One or more tools/adapters assigned
  - Human assignees for human-in-the-loop review
  - Custom rules for task transitions

- Swimlane types:
  - Automated (tool/adapter executes tasks)
  - Manual (human review and action)
  - Hybrid (tool executes, human approves)

---

### Workflows

Workflows define how tasks move through swimlanes in a project.

- Each project can have multiple workflows
- A workflow is a combination of swimlanes, each with its own:
  - Tool/adapter assignee(s)
  - Human assignee(s)
  - Transition rules

- Example workflows:
  - Simple: Backlog → In Progress (Claude Code) → Review (Human) → Complete
  - Parallel: Backlog → [Codex | Claude Code] → Human Review → QA (Human) → Complete
  - Full automation: Backlog → Draft (Claude Code) → Refine (Codex) → Auto-merge
  - Cross-functional (future): Design (Figma) → Implement (Claude Code) → Review (Human) → Ship

---

### Git Integration Layer

Must support:

- Creating and managing worktrees
- Creating and switching branches
- Linking tasks to worktrees
- Detecting task readiness via git state

---

### Storage Model

All primary data must be file-based and live in the repository:

- `PRODUCT.md`
- `/tasks/*.md`
- `/agents/AGENTS.md`
- `/agents/SKILL.md`
- Optional metadata files

Avoid complex external databases.

---

## Non-Goals

- Complex project management features
- Heavy workflow enforcement
- Non-git-based task tracking
- Excessive UI complexity

---

## MVP Scope

The initial release focuses on developer workflows:

- Coding tools and agents (Codex, Claude Code, etc.)
- Git-based task management with worktrees
- Terminal/PTY-based tool execution
- Developer-centric swimlanes and workflows

The architecture remains abstract to support future expansion to other roles and tools.

---

## Success Criteria

- Can create and refine a task in under 30 seconds
- Can start a task and open its workspace in under 5 seconds
- Can switch between tasks instantly
- Tool and adapter integration is seamless and requires minimal configuration
- System remains simple, transparent, and file-based
