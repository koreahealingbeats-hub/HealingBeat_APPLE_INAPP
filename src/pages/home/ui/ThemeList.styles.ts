import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  themeTitle: {
    color: "#fff", 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 121, 
    marginBottom: 20, 
    lineHeight: 25
  },
  container: {
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
  },
  themeItem: {
    width: 152,
    height: 152, 
    borderRadius: 20, 
    borderColor: 'rgba(255,255,255,0.5)', 
    borderWidth: 1, 
    paddingTop: 26, 
    paddingRight: 12, 
    paddingBottom: 15, 
    paddingLeft: 20,
    aspectRatio: 1 / 1, 
    overflow: 'hidden',
  },
  themeItemInner: {
    flex: 1,
    justifyContent: 'space-between'
  },
  themeItemInnerBottom: {
    flexDirection:"row",
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  themeItemTitle: {
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700'
  },
  themeItemTime: {
    color: 'rgba(255, 255, 255, 0.6)', 
    fontSize: 14, 
    fontWeight: '300'
  },
});
