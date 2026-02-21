## Goal

Create a simple, extensible agentic coding task management platform that enables rapid planning, execution, and switching between agent-driven coding tasks. The system should prioritize speed, clarity, and minimal friction.

---

## Core Principles

- Minimal UI and workflow overhead
- Markdown-first for all specs and tasks
- Git-native (worktrees, branches, commits)
- Agent-agnostic (supports multiple coding agents)
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
  - Organize tasks via simple swimlanes or status columns
  - Link tasks to branches and worktrees

---

### 3. Task Execution

- Starting a task:
  - Creates a Git worktree
  - Creates or associates a branch
  - Associates the task with the worktree
- Agent dispatch:
  - Sends the task spec to a configured agent
  - Agent interface must be abstract and pluggable:
    - Codex
    - Claude Code
    - GitHub Copilot
    - VSCode
    - Other local or remote agents
- Task workspace management:
  - Open worktree in editor
  - Switch between active tasks instantly
  - Track task status (idle, running, ready for review)

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

### Agent Abstraction Layer

Must support:

- Sending task spec to agent
- Receiving results
- Tracking execution state

Must be extensible for future agents.

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

## Success Criteria

- Can create and refine a task in under 30 seconds
- Can start a task and open its workspace in under 5 seconds
- Can switch between tasks instantly
- Agent integration is seamless and requires minimal configuration
- System remains simple, transparent, and file-based
