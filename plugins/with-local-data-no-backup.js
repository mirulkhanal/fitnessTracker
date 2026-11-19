const { withAppDelegate, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

const backupRules = `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
  <exclude domain="root" path="." />
  <exclude domain="file" path="." />
  <exclude domain="database" path="." />
  <exclude domain="sharedpref" path="." />
  <exclude domain="external" path="." />
  <exclude domain="device_root" path="." />
  <exclude domain="device_file" path="." />
  <exclude domain="device_database" path="." />
  <exclude domain="device_sharedpref" path="." />
</full-backup-content>
`;

const dataExtractionRules = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
  <cloud-backup>
    <exclude domain="root" path="." />
    <exclude domain="file" path="." />
    <exclude domain="database" path="." />
    <exclude domain="sharedpref" path="." />
    <exclude domain="external" path="." />
    <exclude domain="device_root" path="." />
    <exclude domain="device_file" path="." />
    <exclude domain="device_database" path="." />
    <exclude domain="device_sharedpref" path="." />
  </cloud-backup>
  <device-transfer>
    <exclude domain="root" path="." />
    <exclude domain="file" path="." />
    <exclude domain="database" path="." />
    <exclude domain="sharedpref" path="." />
    <exclude domain="external" path="." />
    <exclude domain="device_root" path="." />
    <exclude domain="device_file" path="." />
    <exclude domain="device_database" path="." />
    <exclude domain="device_sharedpref" path="." />
  </device-transfer>
</data-extraction-rules>
`;

const HELPER = `

private enum FitTrackLocalDataBackupExclusion {
  static func apply() {
    let fileManager = FileManager.default
    let localDirectories = [
      fileManager.urls(for: .documentDirectory, in: .userDomainMask).first,
      fileManager.urls(for: .libraryDirectory, in: .userDomainMask).first,
    ].compactMap { $0 }
    for directory in localDirectories {
      var localURL = directory
      var values = URLResourceValues()
      values.isExcludedFromBackup = true
      try? localURL.setResourceValues(values)
    }
  }
}
`;

module.exports = function withLocalDataNoBackup(config) {
  config = withAppDelegate(config, config => {
    const source = config.modResults.contents;
    if (source.includes('FitTrackLocalDataBackupExclusion.apply()')) return config;

    const launchCall = 'return super.application(application, didFinishLaunchingWithOptions: launchOptions)';
    if (!source.includes(launchCall)) {
      throw new Error('Could not add local data backup exclusion to the iOS AppDelegate.');
    }
    const appDelegateSource = source.includes('import Foundation')
      ? source
      : source.replace(/^import Expo\n/m, 'import Expo\nimport Foundation\n');
    config.modResults.contents = appDelegateSource.replace(
      launchCall,
      `FitTrackLocalDataBackupExclusion.apply()\n    ${launchCall}`
    ) + HELPER;
    return config;
  });

  config = withAndroidManifest(config, config => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) throw new Error('Could not add local data backup rules to the Android manifest.');
    app.$ = app.$ || {};
    app.$['android:fullBackupContent'] = '@xml/fittrack_backup_rules';
    app.$['android:dataExtractionRules'] = '@xml/fittrack_data_extraction_rules';
    return config;
  });

  return withDangerousMod(config, ['android', async config => {
    const xmlDirectory = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
    fs.mkdirSync(xmlDirectory, { recursive: true });
    fs.writeFileSync(path.join(xmlDirectory, 'fittrack_backup_rules.xml'), backupRules);
    fs.writeFileSync(path.join(xmlDirectory, 'fittrack_data_extraction_rules.xml'), dataExtractionRules);
    return config;
  }]);
};
