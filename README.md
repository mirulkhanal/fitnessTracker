# FitTrack Progress

React Native / Expo app using **wrAuth** for authentication, profiles, and synced metadata.

## Android releases

To ship an installable APK via GitHub Releases, see **[RELEASE.md](./RELEASE.md)** (EAS build, secrets, tagging, and user install steps).

## Local setup

1. Install dependencies

```bash
pnpm install
```

2. Configure wrAuth environment

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_WRAUTH_API_URL` (e.g. `http://localhost:4000`)
- `EXPO_PUBLIC_WRAUTH_APP_KEY` (app key from wrAuth)

3. Start app

```bash
pnpm start
```

## wrAuth-side bootstrap for this app

If you have not created a tenant app in wrAuth yet:

```bash
curl -X POST http://localhost:4000/apps \
  -H "Content-Type: application/json" \
  -d '{"name":"FitnessTracker"}'
```

Save the returned `api_key` as `EXPO_PUBLIC_WRAUTH_APP_KEY`.

**Important:** If email verification is enabled, display name and photo are saved on **first sign-in** (after you verify email), not at signup. Ensure the `profiles` table exists before testing.

Create the `profiles` table (required for profile display name and avatar):

```bash
curl -X POST http://localhost:4000/apps/{APP_ID}/data/tables \
  -H "Content-Type: application/json" \
  -d '{
    "table_key": "profiles",
    "description": "User profile metadata",
    "columns": [
      { "name": "owner_user_id", "type": "uuid", "nullable": false, "indexed": true },
      { "name": "display_name", "type": "text", "nullable": true, "indexed": false },
      { "name": "avatar_url", "type": "text", "nullable": true, "indexed": false },
      { "name": "bio", "type": "text", "nullable": true, "indexed": false }
    ]
  }'
```

## wrAuth data tables (categories, photos, streaks)

Categories and photo **metadata** are stored in wrAuth (`/data/categories`, `/data/photo_metadata`). Streak counts and totals are computed from `photo_metadata` rows (same as before, but sourced from wrAuth).

Encrypted image files stay on the device (`local_id` in `photo_metadata` points at the on-device path).

Create these tables in wrAuth admin (replace `{APP_ID}`):

```bash
curl -X POST http://localhost:4000/apps/{APP_ID}/data/tables \
  -H "Content-Type: application/json" \
  -d '{
    "table_key": "categories",
    "description": "Fitness progress categories",
    "columns": [
      { "name": "name", "type": "text", "nullable": false, "indexed": true },
      { "name": "color", "type": "text", "nullable": false, "indexed": false },
      { "name": "icon", "type": "text", "nullable": false, "indexed": false }
    ]
  }'

curl -X POST http://localhost:4000/apps/{APP_ID}/data/tables \
  -H "Content-Type: application/json" \
  -d '{
    "table_key": "photo_metadata",
    "description": "Progress photo records (files on device)",
    "columns": [
      { "name": "local_id", "type": "text", "nullable": false, "indexed": false },
      { "name": "width", "type": "integer", "nullable": false, "indexed": false },
      { "name": "height", "type": "integer", "nullable": false, "indexed": false },
      { "name": "captured_at", "type": "text", "nullable": false, "indexed": true },
      { "name": "categories", "type": "text", "nullable": false, "indexed": false }
    ]
  }'
```

On first sign-in after upgrading, any existing SQLite categories/photos are uploaded once, then local rows are cleared. Photo files are not re-uploaded (device-local encryption unchanged).
