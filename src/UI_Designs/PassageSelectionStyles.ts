import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

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
    paddingTop: sh(10),
    padding: sw(5),
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: sh(10),
    width: '100%',
  },

  // ==========================================
  // LABELS & TEXT
  // ==========================================
  label: {
    fontSize: sf(35),
    fontFamily: 'DynaPuff-Bold',
    color: '#3B7FC9',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: sf(20),
    color: '#3B7FC9',
    alignSelf: 'flex-start',
  },

  // ==========================================
  // IMAGE SECTION
  // ==========================================
  image: {
    width: sw(120),
    height: sw(120),
  },
  text: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: sf(20),
    marginLeft: sw(10),
  },
  beginText: {
    fontFamily: 'DynaPuff-Bold',
    fontSize: sf(20),
    color: '#3B7FC9',
    marginLeft: sw(10),
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: sw(5),
  },
  image_text_container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: sh(5),
  },
  readingImage: {
    width: sw(100),
    height: sw(100),
    maxHeight: sw(100),
    maxWidth: sw(100),
    borderRadius: sw(5),
    marginRight: sw(10),
  },

  // ==========================================
  // TAB STYLES
  // ==========================================
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: sw(20),
    marginTop: sh(10),
    backgroundColor: '#c0e8f2',
    borderRadius: sw(12),
    padding: sw(4),
  },
  tab: {
    flex: 1,
    paddingVertical: sh(12),
    alignItems: 'center',
    borderRadius: sw(8),
  },
  activeTab: {
    backgroundColor: '#3B7FC9',
    shadowColor: '#4F46E5',
    elevation: 3,
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.22,
    shadowRadius: sw(2.22),
  },
  tabText: {
    fontSize: sf(18),
    color: '#3B7FC9',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    fontFamily: 'DynaPuff-Bold',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: sf(18),
    fontFamily: 'DynaPuff-Bold',
  },

  // ==========================================
  // ALPHABET TAB STYLES
  // ==========================================
  alphabetListContainer: {
    paddingHorizontal: sw(10),
    paddingVertical: sh(10),
  },
  alphabetRow: {
    justifyContent: 'space-between',
    marginBottom: sh(12),
  },
  alphabetItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: sw(16),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(1.41),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alphabetContainer: {
    alignItems: 'center',
    padding: sw(8),
    position: 'relative',
  },
  alphabetLetter: {
    fontSize: sf(40),
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
  },
  // Completed badge for alphabet
  completedBadge: {
    position: 'absolute',
    top: sw(2),
    right: sw(2),
    width: sw(20),
    height: sw(20),
    borderRadius: sw(10),
    backgroundColor: '#2CA96A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckmark: {
    fontSize: sf(12),
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
    paddingHorizontal: sw(10),
    paddingBottom: sh(20),
  },
  letterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(16),
    marginBottom: sh(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.1,
    shadowRadius: sw(8),
    overflow: 'hidden',
  },
  letterCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
  },
  letterIconContainer: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(28),
    backgroundColor: '#bcdcff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(16),
  },
  letterIconText: {
    fontSize: sf(28),
    fontFamily: 'Satoshi-Black',
    color: '#2CA96A',
  },
  letterInfo: {
    flex: 1,
  },
  letterTitle: {
    fontSize: sf(18),
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
    marginBottom: sh(4),
  },
  letterSubtitle: {
    fontSize: sf(13),
    fontFamily: 'Comfortaa-Medium',
    color: '#6B7280',
    marginBottom: sh(4),
  },
  letterProgress: {
    fontSize: sf(12),
    fontFamily: 'Comfortaa-Bold',
    color: '#2CA96A',
  },
  letterArrowContainer: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: '#bcdcff',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',

    marginLeft: sw(12),
  },
  letterArrow: {
    fontSize: sf(20),
    paddingBottom: sh(10),
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
    paddingVertical: sh(12),
    paddingHorizontal: sw(14),
    borderRadius: sw(16),
    marginHorizontal: sw(10),
    marginBottom: sh(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.2,
    shadowRadius: sw(1.41),
  },
  combinedBackBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(22),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginRight: sw(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.1,
    shadowRadius: sw(2),
  },
  combinedBackArrow: {
    fontSize: sf(22),
    color: '#3B7FC9',
    fontFamily: 'Comfortaa-Bold',
    lineHeight: sf(24),
  },
  combinedTitleCol: {
    flex: 1,
  },
  combinedTitle: {
    fontSize: sf(16),
    fontFamily: 'Comfortaa-Bold',
    color: '#1F2937',
    marginBottom: sh(4),
    lineHeight: sf(22),
  },
  combinedSubtitle: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // PHONEME CATEGORIES (Step 2 - Word Selection)
  phonemeListContainer: {
    paddingHorizontal: sw(10),
    paddingBottom: sh(20),
  },
  phonemeSection: {
    marginBottom: sh(20),
    backgroundColor: '#FFFFFF',
    borderRadius: sw(16),
    padding: sw(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.06,
    shadowRadius: sw(8),
  },
  phonemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(16),
    paddingBottom: sh(12),
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  phonemeIconContainer: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(22),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },
  phonemeIcon: {
    fontSize: sf(20),
  },
  phonemeInfo: {
    flex: 1,
  },
  phonemeTitle: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Bold',
    color: '#374151',
    marginBottom: sh(2),
  },
  phonemeIPA: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#6B7280',
  },

  // WORD BUBBLES
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sw(8),
  },
  wordBubble: {
    backgroundColor: '#F3F4F6',
    paddingVertical: sh(12),
    paddingHorizontal: sw(18),
    borderRadius: sw(20),
    marginBottom: sh(8),
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  wordBubbleCompleted: {
    backgroundColor: '#D4F1E8',
    borderColor: '#2CA96A',
  },
  wordBubbleText: {
    fontSize: sf(20),
    fontFamily: 'Comfortaa-Bold',
    color: '#374151',
  },
  wordBubbleTextCompleted: {
    color: '#2CA96A',
  },
  wordCompletedBadge: {
    position: 'absolute',
    top: sw(-6),
    right: sw(-6),
    width: sw(20),
    height: sw(20),
    borderRadius: sw(10),
    backgroundColor: '#2CA96A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCompletedCheck: {
    fontSize: sf(12),
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },

  // ==========================================
  // LEGACY WORD STYLES (for backward compatibility)
  // ==========================================
  word: {
    fontSize: sf(30),
    fontWeight: '600',
    fontFamily: 'Satoshi-MediumItalic',
  },
  wordSectionContainer: {
    marginVertical: sh(5),
  },
  wordSection: {
    fontSize: sf(25),
    fontFamily: 'Satoshi-BlackItalic',
    left: sw(10),
  },

  // ==========================================
  // PASSAGE TAB STYLES
  // ==========================================
  passageListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    padding: sw(5),
    width: 'auto',
    height: 'auto',
    backgroundColor: '#ffff',
    borderRadius: sw(20),
    borderColor: '#38B6FF',
    borderWidth: 4,
    borderBottomColor: '#38B6FF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.23,
    shadowRadius: sw(2.62),
  },
  itemWrapper: {
    margin: sw(5),
    width: 'auto',
    maxWidth: sw(400),
    height: 'auto',
    maxHeight: sh(130),
  },
  insidePassageListContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    padding: sw(5),
  },
  titleAuthorWrapper: {
    width: sw(250),
    maxWidth: sw(400),
  },
  title: {
    fontSize: sf(20),
    color: '#163F6C',
    fontFamily: 'DynaPuff-Medium',
  },
  author: {
    color: '#537EAE',
    fontFamily: 'DynaPuff-Regular',
    fontSize: sf(15),
  },
  arrowContainer: {
    width: sw(25),
    height: sw(25),
    borderRadius: sw(16),
    backgroundColor: '#D4F1E8',
    textAlign: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    fontSize: sf(15),
    color: '#69C1AE',
    fontFamily: 'Satoshi-Medium',
  },
});

export default selection;
