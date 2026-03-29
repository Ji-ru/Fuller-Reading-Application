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
    elevation: 5,
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    alignSelf: 'flex-start',
    marginVertical: 5
  },
  image: {
    width: 150,
    height: 150,
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
  
  // FOR CATEGORIES THAT ARE DISPLAYED AS LIST (WORD AND PASSAGE)
  item: {
    padding: 5,
    width: 'auto',
    height: 'auto',
    backgroundColor: '#ffff',
    borderRadius: 10,
    elevation: 4,
  },
  itemWrapper: {
    margin: 5,
  },
  
  // WORD LIST
  word: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'Satoshi-MediumItalic',
  },
  wordSectionContainer: {
    backgroundColor: '#ECFBFF', 
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 1, 
  },

  wordSection: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  // PASSAGE LIST
  title: {
    fontSize: 25,
    fontWeight: '600',
    fontFamily: 'Satoshi-MediumItalic',
  },
  author: {
    color: '#666',
    fontSize: 10,
  },
  passageListContainer: {
    flex: 1,
    justifyContent: 'center',
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
    alignContent: 'center',
    padding: 5
  },

   // Tab Styles
   tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#c0e8f2',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2CA96A',
    shadowColor: '#4F46E5',
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  activeTabText: {
    color: 'white',
  },
  
  // Content Container
  contentContainer: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
  
  // Alphabet Styles
  alphabetListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  alphabetRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alphabetItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alphabetContainer: {
    alignItems: 'center',
    padding: 8,
  },
  alphabetLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2CA96A',
  },
  alphabetWord: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default selection;
