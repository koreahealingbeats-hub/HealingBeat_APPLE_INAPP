import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

// import TrackPlayer from 'react-native-track-player';
const TrackPlayerModule = require('react-native-track-player');
const TrackPlayer = TrackPlayerModule.default || TrackPlayerModule;
import { PlaybackService } from './src/shared/lib/audio/TrackPlayerService';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
TrackPlayer.registerPlaybackService(() => PlaybackService);
registerRootComponent(App);
