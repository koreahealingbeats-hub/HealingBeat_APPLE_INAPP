import { useState } from 'react';
import DownloadManager from '@/shared/lib/audio/DownloadManager';
import { usePlaylistStore, CustomTrack } from '@/entities/playlist/model/usePlaylistStore';
import { Track } from 'react-native-track-player';
import { useNetworkStore } from '@/entities/network/model/useNetworkStore';
import Toast from 'react-native-toast-message';

/**
 * [다운로드 훅]
 * 음원 다운로드 및 삭제 로직을 캡슐화한 훅입니다.
 * 
 * 주요 기능:
 * 1. 온라인 상태 확인 후 음원 다운로드
 * 2. 다운로드 완료 후 로컬 경로로 트랙 정보를 업데이트하여 스토어에 저장
 * 3. 로컬 파일 삭제 및 스토어 갱신
 */
export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSize, setTotalSize] = useState<string>('0 MB');
  const { addDownloadedTrack, removeDownloadedTrack, downloadedTracks } = usePlaylistStore();
  const { isConnected } = useNetworkStore();

  /**
   * [음원 다운로드 실행]
   */
  const downloadTrack = async (track: CustomTrack) => {
    if (isConnected === false) {
      Toast.show({ type: 'error', text1: '오프라인 상태에서는 다운로드할 수 없습니다.' });
      return;
    }

    // 원본 URL 확인 (이미 로컬 경로로 변경된 경우 originalUrl 사용)
    let downloadUrl = (track.url && typeof track.url === 'string' && track.url.startsWith('http')) 
      ? track.url 
      : (track as any).originalUrl;

    // 샘플 음원의 경우 URL 유실 시 대비한 폴백 처리
    if (!downloadUrl && track.id.toString() === 'offline-060') {
      downloadUrl = 'https://pub-6061fd948d7f4417b03526994342c310.r2.dev/Lullaby%20Waves/060.mp3';
    }

    if (!downloadUrl || typeof downloadUrl !== 'string' || !downloadUrl.startsWith('http')) {
      console.error('Invalid download URL:', downloadUrl);
      Toast.show({ 
        type: 'error', 
        text1: '다운로드할 수 없는 음원입니다.',
        text2: '원본 주소를 찾을 수 없습니다.'
      });
      return;
    }

    if (downloadedTracks.some((t: any) => t.id === track.id)) {
      Toast.show({ type: 'info', text1: '이미 다운로드된 음원입니다.' });
      return;
    }

    setIsDownloading(true);
    try {
      await DownloadManager.init();
      
      // 파일명 결정 (ID 기반)
      const fileName = `${track.id}.mp3`;
      setProgress(0);
      const localPath = await DownloadManager.downloadFile(
        downloadUrl, 
        fileName,
        (received: number, total: number) => {
          if (total > 0) {
            const percentage = Math.round((received / total) * 100);
            setProgress(percentage);
            const sizeInMb = (total / (1024 * 1024)).toFixed(2);
            setTotalSize(`${sizeInMb} MB`);
          }
        }
      );
      
      // 스토어에 저장할 트랙 정보 (URL을 로컬 경로로 변경, 원본 URL은 보존)
      const downloadedTrack = {
        ...track,
        url: DownloadManager.getPlayerPath(fileName), // 플레이어 호환 경로 (file:// 포함)
        originalUrl: downloadUrl, // 원본 리모트 URL 보존
      };
      
      addDownloadedTrack(downloadedTrack);
      Toast.show({ 
        type: 'success', 
        text1: '다운로드가 완료되었습니다.',
        text2: '오프라인에서도 감상하실 수 있습니다.'
      });
    } catch (error) {
      console.error('Download failed:', error);
      Toast.show({ type: 'error', text1: '다운로드 중 오류가 발생했습니다.' });
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * [다운로드된 음원 삭제]
   */
  const deleteTrack = async (trackId: string) => {
    try {
      const fileName = `${trackId}.mp3`;
      await DownloadManager.deleteFile(fileName);
      removeDownloadedTrack(trackId);
      // 삭제 토스트 제거 (사용자 요청)
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  /**
   * [다운로드 여부 확인]
   */
  const isTrackDownloaded = (trackId: string | number | undefined) => {
    if (!trackId) return false;
    return downloadedTracks.some((t: any) => t.id === trackId.toString());
  };

  return { downloadTrack, deleteTrack, isTrackDownloaded, isDownloading, progress, totalSize };
};
