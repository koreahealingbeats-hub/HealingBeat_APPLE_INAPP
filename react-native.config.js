module.exports = {
  dependencies: {
    ...(process.env.EXCLUDE_CAMERA === '1' ? {
      'react-native-vision-camera-face-detector': {
        platforms: {
          ios: null,
        },
      },
    } : {}),
  },
};
