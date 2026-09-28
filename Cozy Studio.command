#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

echo "Cozy Studio portable launcher"
echo "This launcher does not bundle ChatGPT login."

if ! command -v bun >/dev/null 2>&1; then
  echo "Cozy Studio needs Bun. Install it from https://bun.sh/docs/installation then run this launcher again."
  echo "This launcher does not bundle ChatGPT login."
  if [ -z "${STUDIO_PORTABLE_NONINTERACTIVE:-}" ]; then
    read -r -p "Press Enter to close."
  fi
  exit 1
fi

export STUDIO_PORTABLE=1
if [ -z "${STUDIO_LIBRARY_DIR:-}" ]; then
  export STUDIO_LIBRARY_DIR="$(pwd)/Codex Studio Library"
fi

if ! bun run scripts/portable-start.ts; then
  echo "Cozy Studio failed to start."
  if [ -z "${STUDIO_PORTABLE_NONINTERACTIVE:-}" ]; then
    read -r -p "Press Enter to close."
  fi
  exit 1
fi
