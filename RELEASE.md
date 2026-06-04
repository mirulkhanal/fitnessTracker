# Releasing FitTrack Progress (Android)

**Production** EAS builds use **Android App Bundle (AAB)** for Google Play. **Preview** and **development** profiles may still produce APKs for sideloading.

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

## Build locally (manual)

```bash
cp .env.example .env
# Edit .env with your wrAuth URL and app key

pnpm install
eas build --platform android --profile production
```

When the build finishes, download the APK from the Expo dashboard or:

```bash
eas build:download --platform android --profile production --latest --output FitTrack.apk
```

Preview builds (same APK format, internal distribution):

```bash
eas build --platform android --profile preview
```

## Automatic GitHub Releases (recommended)

The [Android Release](.github/workflows/android-release.yml) workflow now runs automatically on every push to `master`.

For `production` profile runs, it will:

1. Build Android APK on EAS.
2. Resolve the next semver tag from commit messages since the last `v*` tag:
   - `BREAKING CHANGE` or `type!:` -> major bump
   - `feat:` -> minor bump
   - everything else -> patch bump
3. Generate release notes from commit subjects.
4. Create (or update on rerun) the GitHub release and upload `FitTrack-Progress-vX.Y.Z.apk`.

### Why reruns now work reliably

The pipeline stores the exact EAS build ID from the build step and downloads by that ID.
It does not rely on "latest build", so failed/retried workflows remain deterministic.

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
