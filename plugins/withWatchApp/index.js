const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom Expo Config Plugin to preserve Watch App files during prebuild.
 * Since prebuild wiping the `ios` directory deletes the Watch App source code,
 * this plugin copies the Swift files from a safe `watch_backup` folder
 * back into the `ios/HealingBeatWatch Watch App/` directory after prebuild completes.
 */
module.exports = function withWatchAppBackup(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const backupDir = path.join(projectRoot, 'watch_backup', 'HealingBeatWatch Watch App');
      const targetIosDir = path.join(projectRoot, 'ios', 'HealingBeatWatch Watch App');

      // Check if the backup directory exists
      if (!fs.existsSync(backupDir)) {
        console.warn('⚠️ [withWatchAppBackup] No watch_backup directory found. Skipping watch app restoration.');
        return config;
      }

      // Ensure the target directory exists in ios/
      if (!fs.existsSync(targetIosDir)) {
        fs.mkdirSync(targetIosDir, { recursive: true });
      }

      // Copy all Swift files from the backup directory to the ios directory
      const files = fs.readdirSync(backupDir);
      for (const file of files) {
        if (file.endsWith('.swift')) {
          const srcPath = path.join(backupDir, file);
          const destPath = path.join(targetIosDir, file);
          fs.copyFileSync(srcPath, destPath);
        }
      }
      console.log('✅ [withWatchAppBackup] Successfully restored Watch App Swift files to ios/');

      return config;
    },
  ]);
};
