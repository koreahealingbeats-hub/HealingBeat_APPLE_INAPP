import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 26,
    paddingVertical: 17,
    borderRadius: 16,
    marginBottom: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 150,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
  },
  refreshText: {
    fontSize: 12,
    color: '#007AFF',
  },
  heartRate: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  subtext: {
    color: '#fff',
    marginTop: 5,
  },
});
