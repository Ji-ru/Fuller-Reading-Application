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
    fontFamily: 'DynaPuff-Bold',
    color: '#3B7FC9',
    elevation: 5,
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 20,
    color: '#3B7FC9',
    alignSelf: 'flex-start',
  },

  // ==========================================
  // IMAGE SECTION
  // ==========================================
  image: {
    width: 120,
    height: 120,
  },
  text: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 20,
    marginLeft: 10,
  },
  beginText: {
    fontFamily: 'DynaPuff-Bold',
    fontSize: 20,
    color: '#3B7FC9',
    marginLeft: 10,
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 5,
  },
  image_text_container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  readingImage: {
    width: 100,
    height: 100,
    maxHeight: 100,
    maxWidth: 100,
    borderRadius: 5,
    marginRight: 10,
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
    backgroundColor: '#3B7FC9',
    shadowColor: '#4F46E5',
    elevation: 3,
  },
  tabText: {
    fontSize: 18,
    color: '#3B7FC9',
    elevation: 5,
    fontFamily: 'DynaPuff-Bold',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'DynaPuff-Bold',
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
    fontSize: 40,
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
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
    backgroundColor: '#bcdcff',
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
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  letterSubtitle: {
    fontSize: 13,
    fontFamily: 'Comfortaa-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  letterProgress: {
    fontSize: 12,
    fontFamily: 'Comfortaa-Bold',
    color: '#2CA96A',
  },
  letterArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#bcdcff',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',

    marginLeft: 12,
  },
  letterArrow: {
    fontSize: 20,
    paddingBottom: 10,
    color: '#3B7FC9',
    fontFamily: 'Satoshi-Bold',
  },

  // BACK TO LETTERS BUTTON
  // ==========================================
  // CHAPTER HEADER (COMBINED ROW)
  // ==========================================
  combinedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c0e8f2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    elevation: 2,
  },
  combinedBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  combinedBackArrow: {
    fontSize: 22,
    color: '#3B7FC9',
    fontFamily: 'Comfortaa-Bold',
    lineHeight: 24,
  },
  combinedTitleCol: {
    flex: 1,
  },
  combinedTitle: {
    fontSize: 16,
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  combinedSubtitle: {
    fontSize: 13,
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
    padding: 10,
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
    fontSize: 20,
    fontFamily: 'Comfortaa-Bold',
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
    borderRadius: 20,
    borderColor: '#38B6FF',
    borderWidth: 4,
    borderBottomColor: '#38B6FF',
    elevation: 4,
  },
  itemWrapper: {
    margin: 5,
    width: 'auto',
    maxWidth: 400,
    height: 'auto',
    maxHeight: 130,
  },
  insidePassageListContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    padding: 5,
  },
  titleAuthorWrapper: {
    width: 250,
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    color: '#163F6C',
    fontFamily: 'DynaPuff-Medium',
  },
  author: {
    color: '#537EAE',
    fontFamily: 'DynaPuff-Regular',
    fontSize: 15,
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
});

export default selection;
