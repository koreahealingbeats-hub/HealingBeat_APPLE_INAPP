const { withAndroidManifest } = require('@expo/config-plugins');

const withTrackPlayerManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    
    // Add tools namespace for tools:replace attribute
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const application = androidManifest.application[0];

    if (!application.service) {
      application.service = [];
    }

    const MUSIC_SERVICE_NAME = 'com.doublesymmetry.trackplayer.service.MusicService';
    
    let musicService = application.service.find(
      (s) => s['$']['android:name'] === MUSIC_SERVICE_NAME
    );

    if (!musicService) {
      // If the service doesn't exist, we add it with the correct attributes
      musicService = {
        $: {
          'android:name': MUSIC_SERVICE_NAME,
          'android:enabled': 'true',
          'android:exported': 'true', // Alignment with library default to avoid conflict
          'android:foregroundServiceType': 'mediaPlayback',
          'tools:replace': 'android:foregroundServiceType,android:exported',
        },
      };
      application.service.push(musicService);
    } else {
      // If it exists, ensure the attributes are set and marked for replacement
      musicService.$['android:foregroundServiceType'] = 'mediaPlayback';
      musicService.$['android:exported'] = 'true';
      musicService.$['tools:replace'] = 'android:foregroundServiceType,android:exported';
    }

    return config;
  });
};

module.exports = withTrackPlayerManifest;
