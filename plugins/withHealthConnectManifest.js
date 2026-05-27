const { withAndroidManifest } = require('@expo/config-plugins');

const withHealthConnectManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }

    // Check if the package query already exists
    const hasHealthConnectQuery = androidManifest.queries.some(query => 
      query.package && query.package.some(pkg => pkg.$['android:name'] === 'com.google.android.apps.healthdata')
    );

    if (!hasHealthConnectQuery) {
      androidManifest.queries.push({
        package: [
          {
            $: {
              'android:name': 'com.google.android.apps.healthdata',
            },
          },
        ],
      });
    }
    
    // Also add the intent for ACTION_VIEW_PERMISSION_USAGE which is needed for app visibility in Health Connect settings
    const mainActivity = androidManifest.application[0].activity.find(
      (a) => a['$']['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }

      const hasViewPermissionUsage = mainActivity['intent-filter'].some((filter) =>
        filter.action && filter.action.some((action) => action['$']['android:name'] === 'android.intent.action.VIEW_PERMISSION_USAGE')
      );

      if (!hasViewPermissionUsage) {
        mainActivity['intent-filter'].push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
          category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
        });
      }
    }

    return config;
  });
};

module.exports = withHealthConnectManifest;
