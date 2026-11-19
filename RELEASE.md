# FitTrack Progress — Releases

FitTrack has no backend, account flow, or EAS dependency. Releases are installable Android APKs built on GitHub Actions.

## Automatic release (push to `master`)

Every push to `master` runs **Android Release**:

1. Install dependencies and set up the Android SDK on the runner
2. Build a release APK with local Gradle (`pnpm build:android:local`)
3. Bump a semver tag from conventional commits (`vX.Y.Z`)
4. Create or update the matching GitHub Release and attach `FitTrack-Progress-vX.Y.Z.apk`

No extra repository secrets are required beyond GitHub Actions' built-in `GITHUB_TOKEN`.

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
