import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 10, // Ensure content is above background stack
  },
  // Top Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Top Side Icons
  sideIcons: {
    marginTop: 20,
    gap: 20,
  },
  heartIconActive: {
    color: '#FF6B6B',
  },
  // Bottom Content
  bottomSection: {
    width: '100%',
  },
  titleArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
  },
  artist: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  // Play Button (Glassmorphism)
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // 그림자 최적화를 위해 불투명 배경색 추가 (rgba(255,255,255,0.15) @ black)
      },
      android: {
        elevation: 8,
      },
    }),
  },
  // Progress Bar
  progressContainer: {
    width: '100%',
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 10,
  },
  sliderContainer: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
  },
  customSlider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    borderRadius: 1,
    overflow: 'visible',
    position: 'relative',
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  sliderThumb: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: '#fff',
    top: -8.5,
  },
  movingTimeContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    minWidth: 50,
  },
  movingTimeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles (Existing but updated)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
    paddingBottom: 60,
    width: '100%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  downloadButtonModal: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Progress Bar Wrapper in Modal
  progressWrapper: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  sizeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    marginTop: 8,
  },
  // Queue Modal Styles
  queueList: {
    width: '100%',
    maxHeight: 400,
    marginTop: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeQueueItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  queueArtwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  queueInfo: {
    flex: 1,
  },
  queueTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  activeQueueTitle: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  queueArtist: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  // Strip Animation Styles
  backgroundStrip: {
    flexDirection: 'row',
    width: width * 3,
    height: '100%',
  },
  backgroundSlot: {
    width: width,
    height: '100%',
    backgroundColor: '#000', // Baseline for missing tracks
  },
  stackBackground: {
    ...StyleSheet.absoluteFillObject,
  },
});
