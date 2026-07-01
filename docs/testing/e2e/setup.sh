#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# E2E Setup — Installs Playwright browsers and system dependencies.
#
# Runs non-interactively (no prompts). Safe to re-run — skips if already done.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPA_DIR="$(dirname "$SCRIPT_DIR")"

cd "$SPA_DIR"

echo "▸ Installing Playwright Chromium browser..."
npx --yes playwright install chromium

echo "▸ Installing system dependencies for Chromium..."
npx --yes playwright install-deps chromium

echo "✓ E2E setup complete."
