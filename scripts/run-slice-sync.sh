#!/usr/bin/env bash
set -euo pipefail

BRANCH=""
APPROVED=""
DISPATCH_SYNC="prompt"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/run-slice-sync.sh [--branch <name>] [--approved APPROVED] [--sync yes|no]

Behavior:
  - requires a clean working tree
  - pushes the active branch
  - dispatches the "Sync Split Repos" workflow only when:
    * approval token is exactly APPROVED
    * branch is main
    * --sync yes is supplied, or you confirm interactively

Examples:
  ./scripts/run-slice-sync.sh
  ./scripts/run-slice-sync.sh --branch agent-user-app --approved APPROVED --sync no
  ./scripts/run-slice-sync.sh --branch main --approved APPROVED --sync yes
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --approved)
      APPROVED="${2:-}"
      shift 2
      ;;
    --sync)
      DISPATCH_SYNC="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" == "HEAD" ]]; then
  echo "Detached HEAD is not supported. Check out a branch before pushing." >&2
  exit 1
fi

if [[ -z "$BRANCH" ]]; then
  read -r -p "Branch to push [$CURRENT_BRANCH]: " BRANCH
  BRANCH="${BRANCH:-$CURRENT_BRANCH}"
fi

if [[ "$BRANCH" != "$CURRENT_BRANCH" ]]; then
  echo "Current branch is '$CURRENT_BRANCH' but requested branch is '$BRANCH'." >&2
  echo "Switch to the target branch first, then rerun this script." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash changes before pushing." >&2
  exit 1
fi

if [[ -z "$APPROVED" ]]; then
  read -r -p "Type APPROVED to confirm this slice is reviewed and ready: " APPROVED
fi

if [[ "$APPROVED" != "APPROVED" ]]; then
  echo "Approval token mismatch. Push/sync cancelled." >&2
  exit 1
fi

case "$DISPATCH_SYNC" in
  yes|no)
    ;;
  prompt)
    read -r -p "Dispatch split-repo sync after push? [y/N]: " sync_reply
    if [[ "$sync_reply" =~ ^[Yy]$ ]]; then
      DISPATCH_SYNC="yes"
    else
      DISPATCH_SYNC="no"
    fi
    ;;
  *)
    echo "Invalid --sync value: $DISPATCH_SYNC (expected yes|no)" >&2
    exit 1
    ;;
esac

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push origin "$BRANCH"
else
  git push -u origin "$BRANCH"
fi

echo "Push completed for branch: $BRANCH"

if [[ "$DISPATCH_SYNC" != "yes" ]]; then
  echo "Split-repo sync not dispatched."
  exit 0
fi

if [[ "$BRANCH" != "main" ]]; then
  echo "Split-repo sync only runs from main. Current branch '$BRANCH' was pushed, but sync was not dispatched." >&2
  echo "Merge the approved slice into main, then rerun:" >&2
  echo "  ./scripts/run-slice-sync.sh --branch main --approved APPROVED --sync yes" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required to dispatch the sync workflow." >&2
  exit 1
fi

gh workflow run sync-split-repos.yml --ref main
echo "Split-repo sync workflow dispatched for main."
