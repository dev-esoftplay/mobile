const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidPermissionsFix(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults.manifest;

    // 1. Ensure the 'tools' namespace exists in the <manifest> tag
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // 2. Find or create the READ_MEDIA_IMAGES permission entry
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissionName = 'android.permission.READ_MEDIA_IMAGES';
    const existingPermission = manifest['uses-permission'].find(
      (p) => p.$['android:name'] === permissionName
    );

    if (existingPermission) {
      // Update existing entry to include the replace rule
      existingPermission.$['android:maxSdkVersion'] = '34';
      existingPermission.$['tools:replace'] = 'android:maxSdkVersion';
    } else {
      // Add new entry if it doesn't exist
      manifest['uses-permission'].push({
        $: {
          'android:name': permissionName,
          'android:maxSdkVersion': '34',
          'tools:replace': 'android:maxSdkVersion',
        },
      });
    }

    return config;
  });
};