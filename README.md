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

Categories and photo **metadata** live in wrAuth (`/data/categories`, `/data/photo_metadata`). **Day streak**, **total photos**, and **last photo** are computed from metadata rows that have accessible media (local cache or wrAuth storage) — not stored as separate counters. After you save **Workout reminders**, streaks only count photos on your selected workout days (weekends/off days do not break the streak).

**Workout reminders** use `expo-notifications` for local weekly alarms. Grant notification permission on a physical device; tap the bell icon or open **Settings → Workout reminders** to set time and days.

**Progress video export** is temporarily disabled (the previous native encoder blocked Android store builds). Use the in-app slideshow or **before/after image** export on the Progress tab instead.

**Per-user privacy:** wrAuth automatically adds an `owner_user_id` system column to every data table (new and existing). List/create/update/delete APIs only return rows owned by the signed-in user when that column is present.

**Cross-device sync:** progress photos and avatars are uploaded to wrAuth object storage (`POST /storage/objects`). Metadata `local_id` stores a `wrauth-storage://{objectId}` reference. The photo encryption key is synced to storage under purpose `photo_vault_key` so another device can decrypt.

Create these tables in wrAuth admin (replace `{APP_ID}`). You do **not** need to declare `owner_user_id` — wrAuth adds it automatically:

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
    "description": "Progress photo metadata (blobs in wrAuth storage)",
    "columns": [
      { "name": "local_id", "type": "text", "nullable": false, "indexed": false },
      { "name": "width", "type": "integer", "nullable": false, "indexed": false },
      { "name": "height", "type": "integer", "nullable": false, "indexed": false },
      { "name": "captured_at", "type": "text", "nullable": false, "indexed": true },
      { "name": "categories", "type": "text", "nullable": false, "indexed": false }
    ]
  }'
```

On first sign-in after upgrading, legacy SQLite categories/photos are uploaded once, then local rows are cleared. Orphan metadata (no file and no storage blob) is removed automatically so dashboard counts match visible photos.

**Deploy wrAuth** with the storage volume (`STORAGE_ROOT`, default `./storage` or `/app/storage` in Docker) and rebuild the API after pulling these changes so `owner_user_id` migration and `/storage` routes are active.
