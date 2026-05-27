import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    paddingBottom: 0,
  },
  container: {
    paddingHorizontal: 20,
  },
  stress: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  subtext: {
    color: '#fff',
    marginTop: 5,
  },
  sleepButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  sleepButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pollingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pollingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  pollingSubText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    marginBottom: 16,
  },
  cameraButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  cameraButtonText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  stopButton: {
    marginTop: 12,
    padding: 8,
  },
  stopButtonText: {
    color: '#999',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  offlineContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 30,
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  trackArtist: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  trackPath: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 4,
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    backgroundColor: '#F5F5F7', // 전체 화면 배경색
  },
  openButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'rgba(234, 236, 241, 0.08)',
    paddingVertical: 5,
    paddingLeft: 14,
    paddingRight: 4,
    borderRadius: 12,
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 500,
  },
  buttonText: {
    display: 'flex',
    color: '#fff',
    fontSize: 12,

    fontWeight: 500,
  },
  sheetBackground: {
    backgroundColor: '#FFFFFF', // 모달 내부 배경색
    borderTopLeftRadius: 24,   // 상단 왼쪽 둥글게
    borderTopRightRadius: 24,  // 상단 오른쪽 둥글게
  },
  handleBar: {
    backgroundColor: '#C7C7CC', // 상단 손잡이 드래그 바 색상
    width: 40,
    height: 5,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 35,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    color: '#19202A',
    fontWeight: 600,
    marginBottom: 20,
    lineHeight: 25,
  },
  description: {
    fontSize: 16,
    color: '#7D8087',
    textAlign: 'left',
    fontWeight: 500,
    lineHeight: 23,
  },
  closeButton: {
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: '#646A79',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 20,
    borderRadius: 14,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
