import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from 'react-native-track-player';

export interface CustomTrack extends Track {
  id: number;
  videoUrl: string;
  minBpm: number;
  maxBpm: number;
  createdAt: string;
  title: string;
  symbol: {
    imageUrl: string | null;
    type: string | null;
  };
  category: string;
  subCategory: string;
  subComment: string;
  url: string;
  artwork: string;
  artist: string;

}

export interface PlaylistState {
  playlist: CustomTrack[];
  downloadedTracks: CustomTrack[];
  isOfflineSimulated: boolean;
  addToPlaylist: (track: CustomTrack) => void;
  removeFromPlaylist: (trackId: number | string) => void;
  clearPlaylist: () => void;
  addDownloadedTrack: (track: CustomTrack) => void;
  removeDownloadedTrack: (trackId: number | string) => void;
  toggleOfflineSimulation: () => void;
}

const dummyMusicList: CustomTrack[] = [
  {
    id: 1,
    artwork: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album04.png",
    url: "https://pub-6061fd948d7f4417b03526994342c310.r2.dev/Lullaby%20Waves/080.mp3",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 80,
    createdAt: "2025-08-25T06:36:46.058Z",
    artist: "HealingBeats",
    title: "깊은 수면",
    symbol: {
      imageUrl: null,
      type: "Sleep"
    },
    category: "내 호흡과 닮은 맞춤형 리듬으로\n편안한 잠의 흐름 만들어보세요.",
    subCategory: "잠이 쉽게 오지 않을때",
    subComment: "당신의 Heart Rate에 맞춰, 몸과 마음을\n 천천히 이완시켜 깊은 잠으로\n 이끌어주는 힐링비트입니다.",
  },
  {
    id: 2,
    artwork: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album01.png",
    url: "https://pub-6061fd948d7f4417b03526994342c310.r2.dev/Lullaby%20Waves/080.mp3",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 100,
    createdAt: "2025-08-25T06:36:46.058Z",
    artist: "HealingBeats",
    title: "몰입준비",
    symbol: {
      imageUrl: null,
      type: null
    },
    category: "이 음악이 끝날 때쯤\n집중력은 더 단단해질 거에요",
    subCategory: "공부 시작 전",
    subComment: "당신의 Heart Rate에 맞춰,\n 집중하기 가장 좋은 컨디션을\n 만들어주는 힐링비트입니다.",
  },
  {
    id: 3,
    artwork: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album02.png",
    url: "https://pub-3301ef846e1f43ba80f2a64bc146ba97.r2.dev/B2B/popup/a%20mountain_heartbeat_13Hz_10min/80.mp3",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 100,
    createdAt: "2025-08-25T06:36:46.058Z",
    artist: "HealingBeats",
    title: "집중 회복",
    symbol: {
      imageUrl: null,
      type: null
    },
    category: "심장에 맞춘 사운드로\n한 문제 더 풀 힘을 얻으세요",
    subCategory: "집중 흐트러질 때",
    subComment: "당신의 Heart Rate에 맞춰,\n흐트러진 집중력을 다시\n정렬해주는 힐링비트입니다.",
  },
  {
    id: 4,
    artwork: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album03.png",
    url: "https://pub-6061fd948d7f4417b03526994342c310.r2.dev/Lullaby%20Waves/080.mp3",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 100,
    createdAt: "2025-08-25T06:36:46.058Z",
    artist: "HealingBeats",
    title: "짧은 휴식",
    symbol: {
      imageUrl: null,
      type: null
    },
    category: "내 몸이 들려주는\n리듬 속 평온 찾기",
    subCategory: "깊은 회복",
    subComment: "당신의 Heart Rate에 맞춰,\n지친 몸과 마음을 안정시키는\n힐링비트입니다.",
  },
  {
    id: 5,
    artwork: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album06.png",
    url: "https://pub-6061fd948d7f4417b03526994342c310.r2.dev/Lullaby%20Waves/080.mp3",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 80,
    createdAt: "2025-08-25T06:36:46.058Z",
    artist: "HealingBeats",
    title: "깊은 수면 자장가",
    symbol: {
      imageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/symbol_welcomeSpring.png",
      type: "SPECIAL"
    },
    category: "봄의 리듬으로 컨디션을 회복하세요",
    subCategory: "새로운 계절의 시작",
    subComment: "당신의 Heart Rate에 맞춰, 겨우내 웅크렸던\n몸과 마음에 따뜻한 봄의 생기를\n불어넣어 주는 힐링비트입니다.",
  }
];

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlist: dummyMusicList,
      downloadedTracks: [],
      isOfflineSimulated: false,

      addToPlaylist: (track: CustomTrack) => set((state: PlaylistState) => ({
        playlist: [...state.playlist, track]
      })),

      removeFromPlaylist: (trackId: number | string) => set((state: PlaylistState) => ({
        playlist: state.playlist.filter((t: CustomTrack) => t.id !== trackId)
      })),

      clearPlaylist: () => set({ playlist: [] }),

      addDownloadedTrack: (track: CustomTrack) => set((state: PlaylistState) => {
        const exists = state.downloadedTracks.some((t: CustomTrack) => t.id === track.id);
        if (exists) return state;
        return { downloadedTracks: [...state.downloadedTracks, track] };
      }),

      removeDownloadedTrack: (trackId: number | string) => set((state: PlaylistState) => ({
        downloadedTracks: state.downloadedTracks.filter((t: CustomTrack) => t.id !== trackId)
      })),

      toggleOfflineSimulation: () => set((state: PlaylistState) => ({
        isOfflineSimulated: !state.isOfflineSimulated
      })),
    }),
    {
      name: 'playlist-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: PlaylistState) => ({ downloadedTracks: state.downloadedTracks }), // 오직 다운로드된 목록만 유지. isOfflineSimulated는 유지되지 않음.
    }
  )
);

