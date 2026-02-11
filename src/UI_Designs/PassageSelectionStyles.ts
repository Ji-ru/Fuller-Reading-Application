import { StyleSheet } from 'react-native';

const selection = StyleSheet.create({
  // ==========================================
  // BASE CONTAINER & LAYOUT
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    position: 'relative',
  },
  insideContainer: {
    flex: 1,
    position: 'relative', 
    paddingTop: 10,
    padding: 5,
    zIndex: 1, 
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },

  // ==========================================
  // LABELS & TEXT
  // ==========================================
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
    marginVertical: 5,
  },

  // ==========================================
  // IMAGE SECTION
  // ==========================================
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
    marginTop: 20,
  },

  // ==========================================
  // TAB STYLES
  // ==========================================
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

  // ==========================================
  // ALPHABET TAB STYLES
  // ==========================================
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
    position: 'relative',
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
  // Completed badge for alphabet
  completedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2CA96A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },

  // ==========================================
  // WORD TAB - NEW REDESIGNED STYLES
  // ==========================================
  wordSelectionContainer: {
    flex: 1,
  },

  // LETTER CARDS (Step 1 - Letter Selection)
  letterListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  letterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  letterCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  letterIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  letterIconText: {
    fontSize: 28,
    fontFamily: 'Satoshi-Black',
    color: '#2CA96A',
  },
  letterInfo: {
    flex: 1,
  },
  letterTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  letterSubtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  letterProgress: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#2CA96A',
  },
  letterArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  letterArrow: {
    fontSize: 20,
    color: '#69C1AE',
    fontFamily: 'Satoshi-Bold',
  },

  // BACK TO LETTERS BUTTON
  backToLettersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4F1E8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 10,
    alignSelf: 'flex-start',
    elevation: 2,
  },
  backArrow: {
    fontSize: 20,
    color: '#2CA96A',
    marginRight: 8,
    fontFamily: 'Satoshi-Bold',
  },
  backToLettersText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#2CA96A',
  },

  // SELECTED LETTER HEADER
  selectedLetterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4F1E8',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 10,
    elevation: 2,
  },
  selectedLetterIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2CA96A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedLetterIconText: {
    fontSize: 32,
    fontFamily: 'Satoshi-Black',
    color: '#FFFFFF',
  },
  selectedLetterTitle: {
    fontSize: 22,
    fontFamily: 'Satoshi-Black',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedLetterSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // PHONEME CATEGORIES (Step 2 - Word Selection)
  phonemeListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  phonemeSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  phonemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  phonemeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phonemeIcon: {
    fontSize: 20,
  },
  phonemeInfo: {
    flex: 1,
  },
  phonemeTitle: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: 2,
  },
  phonemeIPA: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // WORD BUBBLES
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordBubble: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  wordBubbleCompleted: {
    backgroundColor: '#D4F1E8',
    borderColor: '#2CA96A',
  },
  wordBubbleText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
  },
  wordBubbleTextCompleted: {
    color: '#2CA96A',
  },
  wordCompletedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2CA96A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCompletedCheck: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },

  // ==========================================
  // LEGACY WORD STYLES (for backward compatibility)
  // ==========================================
  word: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'Satoshi-MediumItalic',
  },
  wordSectionContainer: {
    marginVertical: 5,
  },
  wordSection: {
    fontSize: 25,
    fontFamily: 'Satoshi-BlackItalic',
    left: 10,
  },

  // ==========================================
  // PASSAGE TAB STYLES
  // ==========================================
  passageListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
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
  title: {
    fontSize: 25,
    fontWeight: '600',
    fontFamily: 'Satoshi-MediumItalic',
  },
  author: {
    color: '#666',
    fontSize: 10,
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
    padding: 5,
  },
});

export default selection;