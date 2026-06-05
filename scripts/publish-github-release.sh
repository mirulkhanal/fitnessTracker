#!/usr/bin/env bash
# Upload a local APK to GitHub Releases (creates tag + release if needed).
# Requires: gh CLI authenticated (`gh auth login`)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APK_PATH="${1:-}"
VARIANT="${RELEASE_VARIANT:-local}"

usage() {
  cat <<'EOF'
Usage: ./scripts/publish-github-release.sh [path/to/app.apk]

Uploads an installable APK to GitHub Releases with auto semver tagging.

Examples:
  pnpm release:github
  pnpm release:github -- dist/fittrack-debug-20260605-133331.apk

Requires:
  gh auth login
  git fetch --tags (recommended)
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "error: GitHub CLI (gh) not found. Install: sudo apt install gh" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

if [[ -z "$APK_PATH" ]]; then
  APK_PATH="$(ls -t "$ROOT"/dist/fittrack-*.apk 2>/dev/null | head -1 || true)"
fi

if [[ -z "$APK_PATH" || ! -f "$APK_PATH" ]]; then
  echo "error: APK not found. Build first: pnpm build:android:local:debug" >&2
  exit 1
fi

echo "==> Validating APK: $APK_PATH"
file "$APK_PATH"
unzip -t "$APK_PATH" >/dev/null

echo "==> Resolving release version"
eval "$(python3 scripts/resolve-release-version.py)"
TAG="${TAG:?missing TAG}"
TITLE="${RELEASE_NAME:?missing RELEASE_NAME}"

RELEASE_APK="FitTrack-Progress-${TAG}.apk"
cp "$APK_PATH" "$RELEASE_APK"
ls -lh "$RELEASE_APK"

echo "==> Publishing $TAG"
if gh release view "$TAG" >/dev/null 2>&1; then
  gh release edit "$TAG" --title "$TITLE" --notes-file release-notes.md
  gh release upload "$TAG" "$RELEASE_APK" --clobber
else
  gh release create "$TAG" "$RELEASE_APK" \
    --title "$TITLE" \
    --notes-file release-notes.md
fi

RELEASE_URL="$(gh release view "$TAG" --json url -q .url)"
echo ""
echo "Published: $RELEASE_URL"
