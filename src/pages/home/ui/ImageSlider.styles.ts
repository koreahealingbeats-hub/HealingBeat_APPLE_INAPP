import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  sliderContainer: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowWrapper: {
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: 'rgba(255, 255, 255, 0.20)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  slideInner: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  slideImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  slideCommentContainer: {
    marginTop: 43,
  },
  slideTitle: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 9,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  slideComment: {
    color: '#646A79',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#fff', // Luminous high-end neon blue
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

