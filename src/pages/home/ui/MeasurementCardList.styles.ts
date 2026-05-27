import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 50,
    gap: 6,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: 82,
    height: 82,
  },
  cardTitle: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
  },
});
