# FitTrack Progress — Releases

FitTrack has no backend, account flow, or EAS dependency. Releases are installable Android APKs built on GitHub Actions.

## Automatic release (push to `master`)

On every push to `master`:

1. **CI** runs first (Expo dependency check, lint, typecheck, expo-doctor)
2. **Android Release** starts only after CI succeeds
3. If the commit only changes CI/docs/tooling since the last `v*` tag (or the message contains `[skip release]`), the APK build is skipped
4. Otherwise it builds a release APK, bumps a semver tag (`vX.Y.Z`), and attaches `FitTrack-Progress-vX.Y.Z.apk` to a GitHub Release

No extra repository secrets are required beyond GitHub Actions' built-in `GITHUB_TOKEN`.

To fix CI/docs without rebuilding the APK, either change only those files (auto-skip) or add `[skip release]` to the commit message.

## Local Android build

```bash
pnpm install
pnpm setup:android-sdk
source .android-sdk.env
pnpm build:android:local
```

Faster debug APK: `pnpm build:android:local:debug`. Output goes to `dist/`.

## Installation

Install the APK from the [GitHub Releases](https://github.com/mirulkhanal/fitnessTracker/releases) page. First launch asks for a local profile name and optional image only.

Package name: `com.fittrack.progress`.
