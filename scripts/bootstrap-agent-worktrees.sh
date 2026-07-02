#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="${1:-/Users/andromeda/casanirvana-wt}"
USER_BRANCH="${2:-agent-user-app}"
GUARD_BRANCH="${3:-agent-guard-app}"
USER_DIR="$BASE_DIR/user-app"
GUARD_DIR="$BASE_DIR/guard-app"

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  Working tree has uncommitted changes. Commit/stash before creating worktrees." >&2
  exit 1
fi

git worktree prune

ensure_branch() {
  local branch="$1"

  if [ -z "$(git branch --list "$branch" --format='%(refname:short)')" ]; then
    echo "Creating branch: $branch from main"
    git branch "$branch" main
  else
    echo "Branch already exists: $branch"
  fi
}

ensure_worktree() {
  local dir="$1"
  local branch="$2"
  local branch_dir

  if [ -d "$dir" ]; then
    echo "Worktree path already exists: $dir"
    return 0
  fi

  mkdir -p "$BASE_DIR"
  echo "Creating worktree: $dir (branch: $branch)"
  git worktree add "$dir" "$branch"
}

ensure_branch "$USER_BRANCH"
ensure_branch "$GUARD_BRANCH"

ensure_worktree "$USER_DIR" "$USER_BRANCH"
ensure_worktree "$GUARD_DIR" "$GUARD_BRANCH"

echo "Worktree bootstrap complete."
echo "User app agent   -> $USER_DIR"
echo "Guard app agent  -> $GUARD_DIR"
echo "User branch      -> $USER_BRANCH"
echo "Guard branch     -> $GUARD_BRANCH"
echo
echo "Suggested slice discipline:"
echo "1) Work only on one agent path."
echo "2) Commit changes and push that branch."
echo "3) After approval, run ./scripts/run-slice-sync.sh from the active worktree."
echo "4) Split-repo sync should only be dispatched from main after the slice is reviewed/approved."
