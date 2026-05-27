import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  buttonBase: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#1E1E23', // 그림자 최적화를 위해 배경색 추가
    overflow: 'hidden',
  },
  // Secondary / Outline Style (다시하기 버튼 스타일)
  secondaryContainer: {
    // Styles handled by liquid glass layer
  },
  secondaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Primary Style (완료 버튼 스타일)
  primaryContainer: {
    // Styles handled by liquid glass layer
  },
  primaryGradient: {
    // ...StyleSheet.absoluteFillObject,
    // borderRadius: 14,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1, // Ensure text is above gradient
  },
  // Disabled state
  disabledContainer: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: '100%',
    height: '100%',
  },
  iconSpacing: {
    marginRight: 8,
  },
});
