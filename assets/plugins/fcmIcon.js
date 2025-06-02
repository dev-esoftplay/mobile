const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

function addCustomMetaData(androidManifest) {
  const mainApplication = getMainApplicationOrThrow(androidManifest);

  // Function to add or replace a meta-data item with tools:replace attribute
  function addOrReplaceMetaDataItem(mainApplication, name, value) {
    const existingMetaData = mainApplication['meta-data'] || [];
    
    // Check if the meta-data item already exists
    const existingItemIndex = existingMetaData.findIndex(
      (item) => item['$']['android:name'] === name
    );

    const newMetaDataItem = {
      $: {
        'android:name': name,
        'android:value': value,
        // 'tools:replace': 'android:resource',
      },
    };

    if (existingItemIndex !== -1) {
      // Replace the existing item
      existingMetaData[existingItemIndex] = newMetaDataItem;
    } else {
      // Add the new item if it doesn't exist
      existingMetaData.push(newMetaDataItem);
    }

    mainApplication['meta-data'] = existingMetaData;
  }

  addOrReplaceMetaDataItem(
    mainApplication,
    "com.google.firebase.messaging.default_notification_icon",
    "@drawable/notification_icon"
  );
  addOrReplaceMetaDataItem(
    mainApplication,
    "com.google.firebase.messaging.default_notification_color",
    "@color/notification_icon_color"
  );

  return androidManifest;
}

module.exports = function withIntentActivity(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addCustomMetaData(config.modResults);
    return config;
  });
};
