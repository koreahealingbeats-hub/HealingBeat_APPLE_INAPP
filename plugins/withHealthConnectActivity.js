const { withMainActivity } = require('@expo/config-plugins');

const withHealthConnectActivity = (config) => {
  return withMainActivity(config, (config) => {
    console.log('withHealthConnectActivity: executing...');
    console.log('Language:', config.modResults.language);
    
    if (config.modResults.language === 'kt' || config.modResults.language === 'kotlin') {
      let contents = config.modResults.contents;
      
      const importStatement = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
      const initStatement = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';

      if (!contents.includes(importStatement)) {
        console.log('Adding import statement...');
        contents = contents.replace(
          /import android\.os\.Bundle/,
          `import android.os.Bundle\n${importStatement}`
        );
      } else {
        console.log('Import statement already present.');
      }

      if (!contents.includes(initStatement)) {
        console.log('Adding initialization statement...');
        // Match super.onCreate(null) or super.onCreate(savedInstanceState)
        // But the file has super.onCreate(null)
        contents = contents.replace(
          /super\.onCreate\(null\)/,
          `${initStatement}\n    super.onCreate(null)`
        );
      } else {
        console.log('Initialization statement already present.');
      }
      
      config.modResults.contents = contents;
    } else {
      console.warn('withHealthConnectActivity: MainActivity is not Kotlin!');
    }
    return config;
  });
};

module.exports = withHealthConnectActivity;
