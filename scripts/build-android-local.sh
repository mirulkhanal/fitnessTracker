#!/usr/bin/env bash
# Build an installable Android APK locally (no EAS credits, no Android Studio).
# Requires: JDK 17+, headless SDK from scripts/setup-android-sdk.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/android-sdk-env.sh"

VARIANT="release"
INSTALL=0

usage() {
  cat <<'EOF'
Usage: ./scripts/build-android-local.sh [--debug] [--install]

  --debug     Faster debug APK (skips R8 minify). Good for quick device smoke tests.
  --install   adb install -r the APK when a device is connected.

One-time headless SDK setup (no Android Studio):
  sudo apt install openjdk-17-jdk unzip curl ca-certificates
  pnpm setup:android-sdk
  source .android-sdk.env
  cp .env.example .env
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --debug) VARIANT="debug" ;;
    --install) INSTALL=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
  shift
done

if ! command -v java >/dev/null 2>&1; then
  echo "error: java not found. Install JDK 17+:" >&2
  echo "  sudo apt install openjdk-17-jdk" >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" ]] || [[ ! -d "$ANDROID_HOME" ]]; then
  echo "error: ANDROID_HOME is not set." >&2
  echo "Run: pnpm setup:android-sdk && source .android-sdk.env" >&2
  exit 1
fi

if [[ ! -x "$ANDROID_HOME/platform-tools/adb" ]]; then
  echo "error: adb not found. Re-run: pnpm setup:android-sdk" >&2
  exit 1
fi

if [[ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]]; then
  echo "error: sdkmanager not found. Re-run: pnpm setup:android-sdk" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "warning: .env missing — copy .env.example and set wrAuth values for a working app." >&2
fi

echo "==> Using ANDROID_HOME=$ANDROID_HOME"

echo "==> Ensuring node dependencies"
pnpm install --frozen-lockfile

echo "==> Generating native Android project (expo prebuild)"
CI=1 pnpm exec expo prebuild --platform android --no-install

GRADLE_TASK="assembleRelease"
APK_SUBDIR="release"
if [[ "$VARIANT" == "debug" ]]; then
  GRADLE_TASK="assembleDebug"
  APK_SUBDIR="debug"
fi

echo "==> Building APK ($GRADLE_TASK)"
cd android
chmod +x gradlew
./gradlew "$GRADLE_TASK" --no-daemon

APK_SRC="app/build/outputs/apk/${APK_SUBDIR}/app-${APK_SUBDIR}.apk"
if [[ ! -f "$APK_SRC" ]]; then
  echo "error: expected APK at android/$APK_SRC" >&2
  exit 1
fi

mkdir -p "$ROOT/dist"
STAMP="$(date +%Y%m%d-%H%M%S)"
APK_OUT="$ROOT/dist/fittrack-${VARIANT}-${STAMP}.apk"
cp "$APK_SRC" "$APK_OUT"

echo ""
echo "Built installable APK:"
echo "  $APK_OUT"
file "$APK_OUT"
unzip -t "$APK_OUT" >/dev/null && echo "  zip structure: OK"

if [[ "$INSTALL" -eq 1 ]]; then
  echo "==> Installing on connected device"
  "$ANDROID_HOME/platform-tools/adb" install -r "$APK_OUT"
fi

echo ""
echo "Manual install: copy the APK to your phone, or run:"
echo "  adb install -r \"$APK_OUT\""
