# FitTrack Progress — Privacy Policy

**Last updated:** October 2026

FitTrack Progress does not provide accounts or send fitness tracking data to a FitTrack server. The profile, categories, progress photos, and preferences are stored by the app on the device where they were added.

## Data stored on your device

- Your optional profile name, profile image, and bio.
- Category names, colors, icons, photo dates, dimensions, and category assignments.
- Progress photos selected or captured in the app.
- Theme, workout reminder schedule, and the optional biometric app-lock setting.

Categories and photo details are stored in a local SQLite database. Profile and preference fields use local app storage. The SQLite and profile fields do not use separate SQLCipher encryption; they rely on the operating system's app-private storage and device protections. Photo files have additional app-level encryption, and their key is held in the device's secure storage. The app requests media-library or camera access only when you choose an image or take a photo.

## Network and backups

The app does not use a user account, authentication provider, cloud database, cloud photo storage, or Expo app-update services. Android cloud and device-to-device backup rules exclude app data. The iOS app excludes its Documents and Library folders from system backup.

## Export and sharing

Export creates a ZIP from the data already on the device. Nothing is transferred until you choose a destination in the device share sheet. A recipient or destination you choose may store or transmit that exported copy under its own privacy policy.

## Data removal

There is no FitTrack account to delete. Removing the app or clearing its app storage removes its local data. Export important data before uninstalling or replacing the device.

## Contact

For questions, open an issue in the project repository.
