import { StyleSheet } from 'react-native';

const selection = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    position: 'relative',
  },
  insideContainer: {
    flex: 1,
    position: 'relative', 
    paddingTop:10,
    padding: 5,
    zIndex: 1, 
  },
  label: {
    fontSize: 35,
    fontFamily: 'Satoshi-Bold',
    textShadowColor: '#0000004D',
    textShadowOffset: { width: 4, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    alignSelf: 'flex-start'
  },
  image: {
    width: 200,
    height: 195,
    maxHeight: 195,
    maxWidth: 200,
  },
  text: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 20,
  },
  beginText: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#2CA96A',
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 5,
  },
  image_text_container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    marginTop: 20
  },

  // PASSAGE LIST
  item: {
    padding: 10,
    width: 370,
    height: 55,
    backgroundColor: '#ffff',
    borderRadius: 10,
    elevation: 4,
  },
  itemWrapper: {
    margin: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Satoshi-MediumItalic',
  },
  author: {
    color: '#666',
    fontSize: 10,
  },
  passageListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowContainer: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: '#D4F1E8',
    textAlign: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    fontSize: 15,
    color: '#69C1AE',
    fontFamily: 'Satoshi-Medium',
  },
  insidePassageListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  
});

export default selection;
