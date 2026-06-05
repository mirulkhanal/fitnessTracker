# Releasing FitTrack Progress (Android)

**GitHub Releases** use the `release` profile (installable **APK**). **Production** uses **AAB** for Google Play via `eas submit`. **Preview** also builds APKs for sideloading.

Set `EXPO_PUBLIC_PRIVACY_POLICY_URL` to your hosted `PRIVACY.md` (or equivalent) before Play submission. Account deletion is available in **Settings → Delete account**.

## One-time setup

### 1. Expo / EAS account

1. Create an [Expo](https://expo.dev) account and install EAS CLI:

```bash
pnpm add -g eas-cli
eas login
```

2. Link the project (already configured if `app.json` contains `extra.eas.projectId`):

```bash
eas whoami
```

### 2. EAS project secrets

Production builds **require** wrAuth env vars at build time (they are baked into the app):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_WRAUTH_API_URL --value "https://your-api.example.com"
eas secret:create --scope project --name EXPO_PUBLIC_WRAUTH_APP_KEY --value "app_your_key"
```

Or set the same values as [EAS environment variables](https://docs.expo.dev/eas/environment-variables/) in the Expo dashboard.

### 3. Android signing (first build only)

On the first `production` build, EAS prompts to generate or upload a keystore. Choose **Let EAS handle it** unless you already have a release keystore.

### 4. GitHub repository secrets

For automated releases, add these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `EXPO_TOKEN` | Expo access token ([create](https://expo.dev/accounts/[account]/settings/access-tokens)) |
| `EXPO_PUBLIC_WRAUTH_API_URL` | Public wrAuth API URL for release builds |
| `EXPO_PUBLIC_WRAUTH_APP_KEY` | wrAuth app API key |

## Build locally on your machine (no EAS credits)

Use this to produce a real installable APK on your PC, then copy it to your phone or `adb install`.

### One-time setup (no Android Studio)

Only the JDK and Google's **command-line SDK tools** — no IDE, no emulator images.

```bash
sudo apt install openjdk-17-jdk unzip curl ca-certificates

cd fitnessTracker
pnpm install
pnpm setup:android-sdk    # downloads SDK into .android-sdk/ (~2–4 GB once)
source .android-sdk.env   # sets ANDROID_HOME for this shell

cp .env.example .env
# Edit .env with your wrAuth URL and app key
```

Add to `~/.bashrc` if you want `ANDROID_HOME` in every terminal:

```bash
source /path/to/fitnessTracker/.android-sdk.env
```

### Build APK

```bash
source .android-sdk.env   # if not already loaded
pnpm build:android:local          # release APK (matches EAS minify/R8)
# or
pnpm build:android:local:debug    # faster debug APK
# or, with USB debugging:
pnpm build:android:local:install  # build release + adb install
```

Output: `dist/fittrack-release-YYYYMMDD-HHMMSS.apk`

Verify before installing:

```bash
file dist/fittrack-release-*.apk    # should say "Android package"
unzip -t dist/fittrack-release-*.apk
```

### Why GitHub / bundletool may both fail

If the workflow uploaded an **AAB renamed as `.apk`**, Android cannot install it and **bundletool** may also fail if the file is corrupt, truncated, or not a valid bundle. Always run `file` and `unzip -t` on downloads.

## Build on EAS (cloud, uses credits)

```bash
pnpm build:android:release
```

When the build finishes, download from the Expo dashboard or:

```bash
pnpm dlx eas-cli@16.32.0 build:download --platform android --profile release --latest --output FitTrack.apk
```

For Google Play submission (AAB, not directly installable):

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

Preview builds (same APK format, internal distribution):

```bash
eas build --platform android --profile preview
```

## Publish APK to GitHub Releases

### From your machine (after local build)

```bash
# upload the APK you already built
pnpm release:github -- dist/fittrack-debug-20260605-133331.apk

# or upload the newest APK in dist/
pnpm release:github

# build debug APK + publish in one step
pnpm release:local
```

Requires `gh` CLI: `sudo apt install gh && gh auth login`

This creates (or updates) a GitHub Release with an auto semver tag (`vX.Y.Z`) and attaches `FitTrack-Progress-vX.Y.Z.apk`.

### Automatic on push to master (GitHub Actions, no EAS credits)

The [Android Release](.github/workflows/android-release.yml) workflow:

1. Builds APK locally on GitHub Actions (Gradle, not EAS)
2. Resolves next semver tag from commits since last `v*` tag
3. Creates/updates GitHub Release and uploads `FitTrack-Progress-vX.Y.Z.apk`

Manual run: **Actions → Android Release → Run workflow** (choose `debug` or `release` variant).

### Manual runs

**Actions -> Android Release -> Run workflow**

- `production`: creates/updates a tagged GitHub release.
- `preview`: uploads the APK as an Actions artifact only.

## OTA updates (no reinstall for JS/assets-only changes)

Use [EAS OTA Update](.github/workflows/eas-update.yml) via:

**Actions -> EAS OTA Update -> Run workflow**

Inputs:

- `branch` (default `production`)
- `message` (release note visible in EAS update history)

This ships JavaScript and asset updates to installed binaries without redistributing an APK.
Native changes (new native dependency/plugin/config) still require a fresh APK build.

## User install steps

1. Open the release on GitHub from a phone or download the APK to the device.
2. Open the APK and confirm install.
3. If blocked, allow installs from that source in Android settings.
4. Sign in with a wrAuth account backed by your server.

## Notes

- **Package name** for store/sideload installs: `com.fittrack.progress`
- **HTTP APIs**: cleartext is allowed when `EXPO_PUBLIC_WRAUTH_API_URL` uses `http://`. Prefer HTTPS for production.
- **Secrets**: never commit `.env` or API keys; only use GitHub / EAS secrets for release builds.
- **Dev client** vs **release**: `production` builds are standalone apps; `development` profile builds require Expo Dev Client.
