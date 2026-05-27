import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center', // 화면 중앙 정렬
  },
  container: {
    height: 64, // 탭 메뉴와 동일한 높이
    borderRadius: 32, // 완전한 타원형 캡슐
    // Android 그림자 추가
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#1E1E23', // 그림자 최적화를 위해 배경색 추가
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 32,
    padding: 1.5, // 그라데이션 두께 (1px 테두리)
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 35, 0.75)', // Glass 느낌 유지
    borderRadius: 31,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 22, // 앨범 아트도 둥글게 처리
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  artist: {
    color: '#aaa',
    fontSize: 12,
  },
  button: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
