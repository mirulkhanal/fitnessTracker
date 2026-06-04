# FitTrack Progress — Privacy Policy

**Last updated:** June 2026

## Overview

FitTrack Progress helps you track fitness progress with photos and categories. This policy describes what data the app processes and how it is stored.

## Data we collect

- **Account information:** Email and profile fields (display name, bio, avatar) when you sign in via wrAuth.
- **Progress photos:** Images you capture or import, encrypted on your device before upload to your wrAuth storage.
- **Categories and metadata:** Names, colors, icons, capture dates, and category assignments for photos.
- **Preferences:** Theme, workout reminder schedule, and optional biometric unlock settings stored on your device.

## How we use data

- Sync categories and photo metadata to your wrAuth account so you can restore data on a new device.
- Send local workout reminder notifications at times you configure.
- Optional biometric unlock stores a refresh token in the device secure enclave (never sent to third parties).

## Data storage and security

- Photo files use AES-GCM encryption with a device-specific key; legacy photos may use an older format until re-saved.
- Session refresh tokens are stored in the platform secure store; access tokens and profile fields use app storage.
- We do not sell your personal data.

## Your choices

- Export category and photo metadata from Settings.
- Delete your account from Settings to remove remote data and sign out.
- Disable biometric unlock or workout reminders at any time.

## Third parties

- **wrAuth** — authentication, database, and file storage for your account.
- **Expo / EAS** — app updates and crash diagnostics in production builds when enabled.

## Contact

Set `EXPO_PUBLIC_SUPPORT_EMAIL` in your build environment for in-app support, or open an issue in the project repository.

## Changes

We may update this policy; the in-app link will point to the latest published version.
