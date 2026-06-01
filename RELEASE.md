# Releasing FitTrack Progress (Android APK)

Users install the **APK** from GitHub Releases on their Android device (enable “Install unknown apps” for the browser or Files app you use to open the APK).

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

Production builds **require** wrAuth env vars at build time (they are baked into the app).

**GitHub Actions** (for automated releases): add repository secrets  
`EXPO_PUBLIC_WRAUTH_API_URL` and `EXPO_PUBLIC_WRAUTH_APP_KEY` (see table below).

**EAS cloud builds** (recommended — same values):

```bash
eas env:create production --name EXPO_PUBLIC_WRAUTH_API_URL --value "https://your-api.example.com" --visibility plaintext
eas env:create production --name EXPO_PUBLIC_WRAUTH_APP_KEY --value "app_your_key" --visibility secret
```

Or set the same values as [EAS environment variables](https://docs.expo.dev/eas/environment-variables/) in the Expo dashboard for the **production** environment.

**First Android build:** run once locally so EAS can create the Android keystore (only needed once):

```bash
pnpm exec eas build --platform android --profile production
```

Choose **Let EAS handle credentials** when prompted. After that, CI builds run non-interactively.

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

## Publish a GitHub Release

1. Bump version in `app.json` / `package.json` (and run `eas build:version:set` if you use remote app version).
2. Commit and push to `main`.
3. Create a new GitHub release with a tag (e.g. `v1.0.0`):

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then on GitHub: **Releases → Draft a new release** → choose the tag → **Publish release**.

The [Android Release](.github/workflows/android-release.yml) workflow will:

1. Run an EAS `production` Android build (`buildType: apk`)
2. Download the APK
3. Attach it to the release as `FitTrack-Progress-v1.0.0.apk`

### Test the workflow without a release

**Actions → Android Release → Run workflow** (manual). The APK is uploaded as a workflow artifact.

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
