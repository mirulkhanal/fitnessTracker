# FitTrack Progress

FitTrack Progress is a React Native / Expo fitness tracker. It has no FitTrack account or cloud data backend. Profile details, categories, progress photos, reminder schedules, and preferences stay in the app's local storage on the installed device.

## Get started

1. Install Node.js and pnpm.
2. Install project dependencies with `pnpm install`.
3. Start the app with `pnpm start`, then open it in a development build (`pnpm android`).
4. On first launch, enter a name and optionally choose a profile photo. This creates a local profile only; no email or password is requested.

Consumer installs come from GitHub Releases APKs (see [RELEASE.md](./RELEASE.md)). There is no EAS, Supabase, wrAuth, `.env`, account registration, or sign-in requirement.

## Local data

- SQLite stores categories and photo details.
- Progress photos are compressed, encrypted on the device, and saved in the app's private document storage. The encryption key is stored in device secure storage.
- The profile, theme, reminder schedule, and small preferences use local app storage. Workout reminders are scheduled as device notifications.
- Settings can build a ZIP export from local data. The device share sheet only sends or saves that ZIP where you choose.
- Android cloud and device-to-device backup rules exclude app data. The iOS build excludes the app's Documents and Library folders from system backup.

Existing cloud-only records and photos are not downloaded by this local build. Existing SQLite rows are retained and their account identifiers are removed, but photos whose files only exist in the previous wrAuth/Supabase storage must be exported from the older app before switching; this build has no credentials or network path to fetch them.

A locally shared ZIP export is the only FitTrack data transfer initiated by the app.

See [PRIVACY.md](./PRIVACY.md) for storage and backup details, and [RELEASE.md](./RELEASE.md) for building and distributing the app.
