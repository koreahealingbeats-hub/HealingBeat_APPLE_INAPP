import ReactNativeBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';

const { dirs } = ReactNativeBlobUtil.fs;

class DownloadManager {
  private static instance: DownloadManager;
  private baseDir!: string;

  private constructor() {}

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  /**
   * 최신 문서 디렉토리 경로를 반환합니다. (iOS 샌드박스 대응)
   */
  private getBaseDir(): string {
    return `${dirs.DocumentDir}/downloads`;
  }

  /**
   * 로컬 저장소 디렉토리 초기화
   */
  public async init() {
    try {
      const exists = await ReactNativeBlobUtil.fs.exists(this.getBaseDir());
      if (!exists) {
        await ReactNativeBlobUtil.fs.mkdir(this.getBaseDir());
        console.log('Download directory created:', this.getBaseDir());
      }
    } catch (error) {
      console.error('Error initializing DownloadManager:', error);
    }
  }

  /**
   * 음원 파일을 다운로드합니다.
   * @param url 다운로드할 음원 URL
   * @param fileName 저장할 파일명 (확장자 포함)
   * @param onProgress 다운로드 진행률 콜백 (received, total) => void
   * @returns 저장된 로컬 파일 경로
   */
  public async downloadFile(
    url: string, 
    fileName: string, 
    onProgress?: (received: number, total: number) => void
  ): Promise<string> {
    const filePath = `${this.getBaseDir()}/${fileName}`;
    
    try {
      // 이미 존재하는지 확인
      const exists = await ReactNativeBlobUtil.fs.exists(filePath);
      if (exists) {
        console.log('File already exists:', filePath);
        return filePath;
      }

      console.log('Starting download:', url);
      const fetchTask = ReactNativeBlobUtil.config({
        path: filePath,
        fileCache: true,
      }).fetch('GET', url);

      if (onProgress) {
        fetchTask.progress((received, total) => {
          onProgress(Number(received), Number(total));
        });
      }

      const res = await fetchTask;
      
      const localPath = res.path();
      console.log('Download complete:', localPath);
      return localPath;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * 로컬에 저장된 음원 파일을 삭제합니다.
   * @param fileName 삭제할 파일명
   */
  public async deleteFile(fileName: string): Promise<void> {
    const filePath = `${this.getBaseDir()}/${fileName}`;
    try {
      const exists = await ReactNativeBlobUtil.fs.exists(filePath);
      if (exists) {
        await ReactNativeBlobUtil.fs.unlink(filePath);
        console.log('File deleted:', filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * 파일이 로컬에 존재하는지 확인합니다.
   * @param fileName 확인할 파일명
   */
  public async isFileExists(fileName: string): Promise<boolean> {
    const filePath = `${this.getBaseDir()}/${fileName}`;
    return await ReactNativeBlobUtil.fs.exists(filePath);
  }

  /**
   * 로컬 파일 경로를 반환합니다.
   * @param fileName 파일명
   */
  public getLocalPath(fileName: string): string {
    return `${this.getBaseDir()}/${fileName}`;
  }

  /**
   * 트랙 플레이어에서 사용 가능한 형식으로 경로를 변환합니다.
   * @param fileName 파일명
   */
  public getPlayerPath(fileName: string): string {
    const path = this.getLocalPath(fileName);
    return Platform.OS === 'ios' ? `file://${path}` : path;
  }

  /**
   * 다운로드된 모든 파일 목록을 가져옵니다.
   */
  public async getDownloadedFileList(): Promise<string[]> {
    try {
      const files = await ReactNativeBlobUtil.fs.ls(this.getBaseDir());
      return files;
    } catch (error) {
      console.error('Error listing downloaded files:', error);
      return [];
    }
  }
}

export default DownloadManager.getInstance();
