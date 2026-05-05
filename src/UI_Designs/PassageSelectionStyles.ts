import { StyleSheet, Dimensions } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tile is 23% of screen width with 10px gaps — compute exact usable size
const TILE_SIZE = (SCREEN_WIDTH - sw(20) - sw(10) * 3) * 0.23;

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
    fontFamily: 'Nunito-ExtraBold',
    color: '#3B7FC9',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: sf(20),
    color: '#388E3C',
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
    fontFamily: 'Nunito-Regular',
    fontSize: sf(20),
    marginLeft: sw(10),
  },
  beginText: {
    fontFamily: 'Nunito-ExtraBold',
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
    backgroundColor: '#E8F5E9',
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
    backgroundColor: '#388E3C',
    shadowColor: '#1B5E20',
    elevation: 3,
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.22,
    shadowRadius: sw(2.22),
  },
  tabText: {
    fontSize: sf(18),
    color: '#388E3C',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    fontFamily: 'Nunito-ExtraBold',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: sf(18),
    fontFamily: 'Nunito-ExtraBold',
  },

  // ==========================================
  // ALPHABET TAB STYLES  ← FIXED
  // ==========================================
  alphabetListContainer: {
    paddingHorizontal: sw(10),
    paddingTop: sh(8),
    paddingBottom: sh(20),
  },
  alphabetRow: {
    justifyContent: 'flex-start',
    gap: sw(10),
    marginBottom: sw(10),
  },

  // Tile: fixed square based on computed TILE_SIZE so nothing overflows
  alphabetItem: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: sw(16),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.22,
    shadowRadius: sw(4),
    position: 'relative',
    overflow: 'hidden',
  },

  // Small gloss dot — top-left
  alphabetHighlightDot: {
    position: 'absolute',
    top: sw(7),
    left: sw(7),
    width: sw(9),
    height: sw(9),
    borderRadius: sw(5),
    backgroundColor: 'rgba(255,255,255,0.50)',
  },

  // Row so Aa sit side by side, baseline-aligned
  alphabetContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingHorizontal: sw(4),
  },

  // Uppercase — fits within ~half the tile
  alphabetLetter: {
    fontSize: TILE_SIZE * 0.38,
    fontFamily: 'Andika-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: sw(1) },
    textShadowRadius: sw(2),
  },

  // Lowercase — visibly smaller, slight left margin for spacing
  alphabetLetterSmall: {
    fontSize: TILE_SIZE * 0.28,
    fontFamily: 'Andika-Bold',
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: sw(1) },
    textShadowRadius: sw(2),
    marginLeft: sw(2),
  },

  // Completed badge
  completedBadge: {
    position: 'absolute',
    top: sw(4),
    right: sw(4),
    width: sw(18),
    height: sw(18),
    borderRadius: sw(9),
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckmark: {
    fontSize: sf(11),
    color: '#2CA96A',
    fontFamily: 'Nunito-Bold',
  },

  // ==========================================
  // WORD TAB STYLES
  // ==========================================
  wordSelectionContainer: {
    flex: 1,
  },
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
    backgroundColor: '#81C784',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(16),
  },
  letterIconText: {
    fontSize: sf(28),
    fontFamily: 'Nunito-Black',
    color: '#2CA96A',
  },
  letterInfo: {
    flex: 1,
  },
  letterTitle: {
    fontSize: sf(18),
    fontFamily: 'Nunito-Bold',
    color: '#1F2937',
    marginBottom: sh(4),
  },
  letterSubtitle: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
    marginBottom: sh(4),
  },
  letterProgress: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
    color: '#2CA96A',
  },
  letterArrowContainer: {
    width: sw(36),
    height: sw(36),
    borderRadius: sw(18),
    backgroundColor: '#2CA96A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sw(12),
  },
  letterArrow: {
    fontSize: sf(22),
    color: '#ffffff',
    fontFamily: 'Nunito-Bold',
    lineHeight: sf(26),
  },
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
    fontFamily: 'Nunito-Bold',
    lineHeight: sf(24),
  },
  combinedTitleCol: {
    flex: 1,
  },
  combinedTitle: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: '#1F2937',
    marginBottom: sh(4),
    lineHeight: sf(22),
  },
  combinedSubtitle: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
  },
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
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: sh(2),
  },
  phonemeIPA: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Medium',
    color: '#6B7280',
  },
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
    fontFamily: 'Nunito-Bold',
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
    fontFamily: 'Nunito-Bold',
  },

  // ==========================================
  // LEGACY WORD STYLES
  // ==========================================
  word: {
    fontSize: sf(30),
    fontWeight: '600',
    fontFamily: 'Nunito-MediumItalic',
  },
  wordSectionContainer: {
    marginVertical: sh(5),
  },
  wordSection: {
    fontSize: sf(25),
    fontFamily: 'Nunito-Black',
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
    paddingLeft: sw(14),
    width: 'auto',
    height: 'auto',
    backgroundColor: '#ffff',
    borderRadius: sw(20),
    borderColor: '#2CA96A',
    borderWidth: 4,
    borderBottomColor: '#2CA96A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.23,
    shadowRadius: sw(2.62),
    position: 'relative',
    overflow: 'hidden',
  },
  passageAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: sw(8),
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
    color: '#008443',
    fontFamily: 'Nunito-Black',
  },
  author: {
    color: '#2CA96A',
    fontFamily: 'Nunito-Regular',
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
    fontFamily: 'Nunito-Medium',
  },
});

export default selection;
