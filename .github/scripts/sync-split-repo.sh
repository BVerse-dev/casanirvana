#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <prefix> <target_repo>" >&2
  exit 1
fi

PREFIX="$1"
TARGET_REPO="$2"
TARGET_ORG="BVerse-dev"

if [ -z "${SPLIT_REPO_PUSH_TOKEN:-}" ]; then
  echo "SPLIT_REPO_PUSH_TOKEN is required" >&2
  exit 1
fi

BRANCH="split/${PREFIX}"
REMOTE_URL="https://x-access-token:${SPLIT_REPO_PUSH_TOKEN}@github.com/${TARGET_ORG}/${TARGET_REPO}.git"

git branch -D "$BRANCH" >/dev/null 2>&1 || true
git subtree split --prefix="$PREFIX" -b "$BRANCH"
git push "$REMOTE_URL" "$BRANCH:main" --force
git branch -D "$BRANCH"
