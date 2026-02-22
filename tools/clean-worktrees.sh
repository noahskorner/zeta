#!/usr/bin/env bash

set -euo pipefail

echo "This will:"
echo "  • Remove ALL git worktrees"
echo "  • Delete ALL branches associated with those worktrees"
echo "  • Force delete any remaining worktree directories"
echo ""
echo "Repository: $(pwd)"
echo ""

read -r -p "Type 'y' to continue: " confirm

if [[ "$confirm" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Collecting worktrees..."

# Collect worktrees and branches (excluding main worktree)
mapfile -t WORKTREES < <(git worktree list --porcelain | awk '/^worktree /{print substr($0,10)}' | tail -n +2)
mapfile -t BRANCHES < <(git worktree list --porcelain | awk '/^branch /{print substr($0,8)}' | sed 's|refs/heads/||')

echo ""
echo "Removing worktrees..."

for wt in "${WORKTREES[@]}"; do
  echo "Removing worktree: $wt"

  # Unregister from git
  git worktree remove --force "$wt" 2>/dev/null || true

  # Force delete directory if still exists (Windows-safe)
  if [[ -d "$wt" ]]; then
    if command -v cygpath >/dev/null 2>&1; then
      cmd.exe /c "rmdir /s /q \"$(cygpath -w "$wt")\"" || true
    else
      rm -rf "$wt" || true
    fi
  fi
done

echo ""
echo "Pruning stale worktree metadata..."
git worktree prune

echo ""
echo "Removing associated branches..."

for branch in "${BRANCHES[@]}"; do
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Deleting branch: $branch"
    git branch -D "$branch" || true
  fi
done

echo ""
echo "Cleanup complete."