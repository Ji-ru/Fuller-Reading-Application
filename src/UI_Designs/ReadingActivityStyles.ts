import { StyleSheet } from 'react-native';
import { sw, sh, sf, ms } from '../Utils/responsive';

const readingStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: '#F1FBF4', // updated background
    position: 'relative',
  },
  screenScrollContent: {
    flexGrow: 1,
    paddingBottom: sh(24),
  },
  insideContainer: {
    justifyContent: 'flex-start',
    position: 'relative',
    padding: sw(10),
    zIndex: 1,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: sw(16),
    marginVertical: sh(8),
    marginHorizontal: sw(16),
    borderRadius: sw(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  title: {
    fontSize: sf(18),
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: sf(14),
    color: '#666',
    marginTop: sh(4),
  },
  header: {
    fontSize: sf(24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: sh(16),
    color: '#333',
  },
  noData: {
    textAlign: 'center',
    fontSize: sf(16),
    color: '#666',
    marginTop: sh(50),
  },

  // FEEDBACK
  passageContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2ca96a',
    borderWidth: 4,
    paddingTop: sh(10),
    paddingBottom: sh(10),
    borderRadius: sw(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    marginBottom: sh(10),
    alignSelf: 'center',
    flexShrink: 1,
  },
  passageContainerFeedback: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2ca96a',
    borderWidth: 4,
    paddingTop: sh(10),
    paddingBottom: sh(10),
    borderRadius: sw(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    alignSelf: 'center',
    flexShrink: 1,
    marginBottom: sh(15),
  },
  passageTitle: {
    fontSize: sf(25),
    fontFamily: 'Andika-Bold',
    textAlign: 'center',
    marginBottom: sh(8),
  },
  passageAuthor: {
    fontSize: sf(12),
    color: '#666',
    textAlign: 'center',
    marginBottom: sh(4),
  },

  textLine: {
    fontSize: sf(25),
    lineHeight: sf(30),
    textAlign: 'center',
    fontFamily: 'Andika-Bold',
  },
  readingImage: {
    width: sw(230),
    height: sw(230),
    maxHeight: sw(250),
    maxWidth: sw(250),
    marginTop: sh(15),
    marginBottom: sh(15),
    borderRadius: sw(20),
    borderWidth: sw(10),
    borderColor: 'white',
    alignSelf: 'center',
  },
  substitutionBgColor: {
    color: '#FF2726',
    backgroundColor: '#FF9E9C4D',
  },
  omissionBgColor: {
    color: '#FF941A',
    backgroundColor: '#FEC97A4D',
  },
  insertionBgColor: {
    color: '#1A81FF',
    backgroundColor: '#38B6FF4D',
  },
  repetitionBgColor: {
    color: '#BF00DD',
    backgroundColor: '#7D44EE4D',
  },
  miscueRow: {
    borderRadius: sw(5),
    padding: sw(5),
    marginBottom: sh(5),
  },

  // MICROPHONE
  microphoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(14),
    paddingVertical: sh(7),
    marginBottom: sh(14),
    gap: sw(6),
  },
  recordingStatusDot: {
    width: sw(8),
    height: sw(8),
    borderRadius: sw(4),
    backgroundColor: '#C5D0DA',
  },
  recordingStatusDotActive: {
    backgroundColor: '#FF4D4D',
  },
  recordingStatusText: {
    fontFamily: 'Andika-Bold',
    fontSize: sf(13),
    color: '#8899A6',
    letterSpacing: 0.3,
  },
  recordingStatusTextActive: {
    color: '#FF4D4D',
  },
  micRippleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    width: sw(100),
    height: sw(100),
    borderRadius: sw(50),
    backgroundColor: '#FF9E9C',
    opacity: 0,
  },
  navArrowItem: {
    width: sw(56),
    height: sw(56),
    borderRadius: sw(18),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#008443',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 3,
    borderColor: '#008443',
  },
  navArrowText: {
    fontSize: sf(28),
    fontFamily: 'Nunito-Black',
    color: '#008443',
    marginTop: sh(-2),
  },
  navArrowEmpty: {
    width: sw(56),
  },
  microphone: {
    backgroundColor: '#008443',
    borderRadius: sw(50),
    justifyContent: 'center',
    alignItems: 'center',
    width: sw(100),
    height: sw(100),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  microphoneRecording: {
    backgroundColor: '#FF9E9C',
    borderRadius: sw(50),
    justifyContent: 'center',
    alignItems: 'center',
    width: sw(100),
    height: sw(100),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  // Icon removed, now handled by SVG inside component

  // TESTING
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: sw(16),
    backgroundColor: '#f5f5f5',
    borderRadius: sw(12),
    margin: sw(16),
  },
  controlButton: {
    padding: sw(12),
    borderRadius: sw(8),
    minWidth: sw(120),
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: sf(16),
  },
  statusContainer: {
    padding: sw(16),
    alignItems: 'center',
  },
  statusText: {
    fontSize: sf(16),
    fontWeight: 'bold',
    marginBottom: sh(4),
  },
  progressText: {
    fontSize: sf(14),
    color: '#666',
  },
  miscueContainer: {
    margin: sw(16),
    padding: sw(16),
    backgroundColor: '#f8f8f8',
    borderRadius: sw(8),
  },
  miscueTitle: {
    fontSize: sf(18),
    fontWeight: 'bold',
    marginBottom: sh(8),
  },
  miscueList: {
    maxHeight: sh(100),
  },
  miscueText: {
    fontSize: sf(12),
    marginBottom: sh(4),
  },
  word: {
    fontSize: sf(18),
    lineHeight: sf(24),
  },
  currentWord: {
    backgroundColor: '#FFEB3B',
    borderRadius: sw(4),
  },
  miscueWord: {
    backgroundColor: '#FFCDD2',
    textDecorationLine: 'underline',
  },

  // LOADING INDICATOR STYLES
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: sw(20),
    marginTop: sh(20),
  },
  loadingText: {
    fontSize: sf(16),
    color: '#666',
    fontFamily: 'Andika-Regular',
    textAlign: 'center',
  },

  // FEEDBACK DESIGN

  // Calculation Accuracy Design
  calculationContainer: {
    backgroundColor: '#D6D6D6',
    height: sh(40),
    width: '100%',
    paddingTop: sh(5),
    borderRadius: sw(10),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    marginBottom: sh(20),
  },
  calculationText: {
    textAlign: 'center',
    fontFamily: 'Andika-Bold',
    fontSize: sf(20),
    color: '#ffff',
  },
  correctContainer: {
    backgroundColor: '#2ca96a',
  },
  incorrectContainer: {
    backgroundColor: '#FF5252',
  },

  // FEEDBACK REPORT
  feedbackContainer: {
    backgroundColor: '#ffff',
    borderColor: '#2ca96a',
    borderWidth: 4,
    borderRadius: sw(30),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    position: 'relative',
    overflow: 'visible',
  },
  feedbackTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008443',
    borderTopLeftRadius: sw(25),
    borderTopRightRadius: sw(25),
    marginBottom: sh(5),
  },
  feedbackLabel: {
    fontSize: sf(15),
    padding: sw(5),
    fontFamily: 'Andika-Bold',
    color: '#008443',
  },
  feedbackBookicon: {
    position: 'absolute',
    top: sh(-45),
    left: sw(-30),
    width: sw(130),
    height: sw(130),
    zIndex: 2,
  },
  miscueRowsWrapper: {
    paddingHorizontal: sw(5),
    paddingVertical: sh(10),
  },

  feedbackLabelText: {
    fontSize: sf(18),
    fontFamily: 'Comforta-VariableFont_wght',
    fontWeight: 'bold',
  },
  feedbackValueText: {
    fontSize: sf(18),
    fontFamily: 'Comfortaa-Medium',
  },
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'Satoshi-Bold',
  },
  successText: {
    color: '#2ca96a',
    fontWeight: 'bold',
    fontFamily: 'Satoshi-Bold',
  },
  errorText: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontFamily: 'Satoshi-Bold',
  },

  // TRY AGAIN BUTTON
  tryAgainButton: {
    backgroundColor: '#FFDB58',
    paddingVertical: sh(10),
    paddingHorizontal: sw(24),
    borderRadius: sw(10),
    marginTop: sh(10),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  tryAgainText: {
    color: 'white',
    fontSize: sf(16),
    fontWeight: 'bold',
  },
  tryAgainIcon: {
    width: sw(40),
    height: sw(40),
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
    verticalAlign: 'middle',
  },
  tryAgainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ALPHABET DISPLAY STYLE (original — kept for reference)
  alphabetContainer: {
    marginTop: sh(50),
    marginBottom: sh(10),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(10),
    width: '100%',
  },
  letterContainer: {
    backgroundColor: '#4F46E5',
    width: sw(120),
    height: sw(120),
    borderRadius: sw(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sh(40),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(5) },
    shadowOpacity: 0.34,
    shadowRadius: sw(6.27),
  },
  bigLetter: {
    fontSize: sf(64),
    fontWeight: 'bold',
    color: 'white',
  },
  alphabetExamples: {
    backgroundColor: 'white',
    padding: sw(24),
    borderRadius: sw(20),
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleSection: {
    marginBottom: sh(20),
  },
  exampleLabel: {
    fontSize: sf(18),
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: sh(8),
  },
  exampleText: {
    fontSize: sf(24),
    color: '#333',
    lineHeight: sf(32),
  },
  highlightedLetter: {
    color: '#EF4444',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: sf(26),
  },

  // WORD DISPLAY STYLE (original — kept for reference)
  wordCardContainer: {
    marginTop: sh(50),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sw(24),
    marginBottom: sh(120),
  },
  wordCardText: {
    fontSize: sf(64),
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
  },
  wordCardInstruction: {
    fontSize: sf(20),
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
  },
  // ── Word scene wrapper ──────────────────────────────────────────────────────
  wordSceneWrapper: {
    alignItems: 'center',
    marginTop: sh(18),
    marginBottom: sh(10),
    paddingHorizontal: sw(16),
    // Extra vertical space so the timer badge has breathing room below
    paddingBottom: sh(8),
  },

  // ── Decorative floating bubbles ─────────────────────────────────────────────
  bubbleTopLeft: {
    position: 'absolute',
    top: sw(-8),
    left: sw(22),
    width: sw(34),
    height: sw(34),
    borderRadius: sw(17),
    backgroundColor: 'rgba(132, 214, 242, 0.30)',
    borderWidth: 2,
    borderColor: 'rgba(56, 182, 255, 0.35)',
  },
  bubbleTopRight: {
    position: 'absolute',
    top: sw(6),
    right: sw(18),
    width: sw(22),
    height: sw(22),
    borderRadius: sw(11),
    backgroundColor: 'rgba(94, 197, 229, 0.28)',
    borderWidth: 2,
    borderColor: 'rgba(56, 182, 255, 0.30)',
  },
  bubbleBottomRight: {
    position: 'absolute',
    bottom: sw(30),
    right: sw(26),
    width: sw(14),
    height: sw(14),
    borderRadius: sw(7),
    backgroundColor: 'rgba(59, 127, 201, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 182, 255, 0.25)',
  },

  // ── Main word card ──────────────────────────────────────────────────────────
  wordCard: {
    width: '100%',
    backgroundColor: '#E8F4FF',
    borderRadius: sw(32),
    // Layered border: a thick white inner ring sits on a sky-blue outer stroke
    borderWidth: 4,
    borderColor: '#2ca96a',
    paddingTop: sh(20),
    paddingBottom: sh(20),
    paddingHorizontal: sw(16),
    alignItems: 'center',
    marginTop: sh(50),
    marginBottom: sh(125),
    elevation: 8,
    // Soft inner glow via shadow
    shadowColor: '#2ca96a',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.25,
    shadowRadius: sw(12),
  },

  // ── Card header (label pill) ────────────────────────────────────────────────
  wordContainer: {
    backgroundColor: '#FFFFFF',
    padding: sw(10),
    borderRadius: sw(50),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    marginTop: sh(40),
    marginBottom: sh(30),
  },
  wordCardHeader: {
    marginBottom: sh(10),
  },
  wordLabelPill: {
    backgroundColor: '#008443',
    borderRadius: sw(20),
    paddingVertical: sh(6),
    paddingHorizontal: sw(18),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.22,
    shadowRadius: sw(2.22),
  },
  wordLabelPillText: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // ── Letter tiles ────────────────────────────────────────────────────────────
  letterTilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap', // handles long words gracefully
    gap: sw(8),
    marginBottom: sh(14),
    paddingHorizontal: sw(4),
  },
  letterTile: {
    // Each tile is a rounded square with a gradient-like stacked look
    width: sw(58),
    height: sw(68),
    borderRadius: sw(16),
    backgroundColor: '#84D6F2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    // Bottom shadow gives a chunky 3-D toy-block feel
    shadowColor: '#2C6975',
    shadowOffset: { width: 0, height: sw(5) },
    shadowOpacity: 0.28,
    shadowRadius: sw(4),
    position: 'relative',
    overflow: 'hidden',
  },
  letterTileShine: {
    // A top-left highlight mimicking a shiny surface
    position: 'absolute',
    top: sw(4),
    left: sw(4),
    width: sw(20),
    height: sw(10),
    borderRadius: sw(8),
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  letterTileText: {
    fontSize: sf(38),
    fontFamily: 'DynaPuff-Bold',
    color: '#FFFFFF',
    // Text shadow to add depth
    textShadowColor: 'rgba(44,105,117,0.45)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 2,
    includeFontPadding: false,
    lineHeight: sf(48),
  },

  // ── Wave divider ────────────────────────────────────────────────────────────
  wordCardWave: {
    marginBottom: sh(12),
    opacity: 0.7,
  },

  // ── Footer hint ─────────────────────────────────────────────────────────────
  wordCardFooter: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(16),
    paddingVertical: sh(8),
    paddingHorizontal: sw(16),
    borderWidth: 2,
    borderColor: 'rgba(44, 169, 106, 0.35)',
  },
  wordCardFooterText: {
    fontSize: sf(13),
    fontFamily: 'Comfortaa-Bold',
    color: '#008443',
    textAlign: 'center',
  },

  // ── Recording timer badge ───────────────────────────────────────────────────
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sh(14),
    backgroundColor: 'rgba(255, 100, 100, 0.12)',
    borderRadius: sw(24),
    paddingVertical: sh(7),
    paddingHorizontal: sw(16),
    borderWidth: 2,
    borderColor: '#FF6464',
    gap: sw(8),
    marginBottom: sh(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.22,
    shadowRadius: sw(2.22),
  },
  timerDot: {
    width: sw(10),
    height: sw(10),
    borderRadius: sw(5),
    backgroundColor: '#FF4444',
  },
  timerText: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Medium',
    color: '#CC3333',
    letterSpacing: 1,
  },

  // WORD & ALPHABET FEEDBACK CARD STYLES (original)
  waFeedbackContainer: {
    alignSelf: 'center',
    marginTop: sh(24),
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(24),
    paddingVertical: sh(28),
    paddingHorizontal: sw(20),
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.27,
    shadowRadius: sw(4.65),
  },
  waFeedbackAnimation: {
    width: sw(140),
    height: sw(140),
    marginBottom: sh(12),
  },
  waFeedbackTitle: {
    fontSize: sf(30),
    fontWeight: '800',
    color: '#2C2C2C',
    marginBottom: sh(8),
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  waFeedbackMessage: {
    fontSize: sf(18),
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: sw(8),
    fontFamily: 'Satoshi-Medium',
  },
  waFeedbackWordBox: {
    backgroundColor: '#F4F8FF',
    borderRadius: sw(18),
    paddingVertical: sh(14),
    paddingHorizontal: sw(20),
    alignItems: 'center',
    width: '100%',
    marginBottom: sh(20),
  },
  waFeedbackExpectedText: {
    fontSize: sf(36),
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: 2,
    fontFamily: 'Satoshi-Bold',
  },
  waFeedbackSpokenText: {
    fontSize: sf(16),
    fontWeight: '500',
    color: '#D32F2F',
    marginTop: sh(6),
    fontFamily: 'Satoshi-Medium',
  },

  // Background image
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.2,
    transform: [{ scale: 1.1 }],
  },
  backgroundResultImage: {
    width: '100%',
    height: '100%',
    opacity: 0.2,
    transform: [{ scale: 1.0001 }],
  },
  bgImage: {
    flex: 1,
  },
  starRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    zIndex: 1,
  },
  starWrapper: {
    marginHorizontal: sw(-10),
  },
  starIcon: {
    width: sw(130),
    height: sw(130),
  },
  starSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(6),
  },
  starConfetti: {
    position: 'absolute',
    top: sh(-40),
    left: 0,
    right: 0,
    height: sh(180),
    zIndex: 0,
  },
  passageGreetingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(5),
    marginBottom: sh(5),
  },
  passageGreetingTitle: {
    fontSize: sf(30),
    textAlign: 'center',
    fontFamily: 'DynaPuff-Bold',
    color: '#7A5A2B',
  },
  passageScrollView: {
    maxHeight: sh(170),
    width: '100%',
  },
  passageScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  passageTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sw(10),
    width: '100%',
  },

  // Scroll View Hint
  scrollHintOverlay: {
    position: 'absolute',
    bottom: sh(18),
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 132, 67, 0.9)',
    paddingVertical: sh(8),
    paddingHorizontal: sw(14),
    borderRadius: sw(20),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.27,
    shadowRadius: sw(4.65),
  },
  scrollHintText: {
    color: '#FFFFFF',
    fontSize: sf(14),
    fontFamily: 'Andika-Bold',
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────
  // ALPHABET DISPLAY — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Outer card — matches the passage container palette */
  alphaDisplayCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2ca96a',
    borderWidth: 4,
    borderRadius: sw(30),
    paddingVertical: sh(28),
    paddingHorizontal: sw(20),
    marginTop: sh(20),
    marginBottom: sh(16),
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },

  /** Row holding both letter bubbles side-by-side */
  alphaLetterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(20),
    marginBottom: sh(10),
  },

  /** Large circle for the uppercase letter */
  alphaUpperBubble: {
    width: sw(118),
    height: sw(118),
    borderRadius: sw(59),
    backgroundColor: '#57b8b3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.27,
    shadowRadius: sw(4.65),
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },

  /** Smaller circle for the lowercase letter */
  alphaLowerBubble: {
    width: sw(84),
    height: sw(84),
    borderRadius: sw(42),
    backgroundColor: '#c0e8f2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.23,
    shadowRadius: sw(2.62),
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  /** Uppercase letter text inside the big bubble */
  alphaUpperLetter: {
    fontSize: sf(62),
    fontFamily: 'Andika-Bold',
    color: '#FFFFFF',
  },

  /** Lowercase letter text inside the small bubble */
  alphaLowerLetter: {
    fontSize: sf(42),
    fontFamily: 'Andika-Bold',
    color: '#008443',
  },

  /** Row of "Uppercase" / "Lowercase" hint labels */
  alphaCaseLabelRow: {
    flexDirection: 'row',
    gap: sw(28),
    marginBottom: sh(14),
  },
  alphaCaseLabel: {
    fontSize: sf(11),
    fontFamily: 'Andika-Regular',
    color: '#57b8b3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    width: sw(84),
  },

  /** Thin separator before the instruction */
  alphaDivider: {
    height: 1.5,
    backgroundColor: '#c0e8f2',
    width: '75%',
    marginBottom: sh(12),
  },

  /** "Say this letter!" instruction text */
  alphaInstruction: {
    fontSize: sf(16),
    fontFamily: 'Comfortaa-Bold',
    color: '#008443',
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────
  // ALPHABET FEEDBACK — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Wrapper card for the alphabet result */
  alphaResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(24),
    overflow: 'hidden',
    marginTop: sh(100),
    marginBottom: sh(10),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    borderWidth: 3,
    borderColor: '#2ca96a',
  },

  /** Coloured header band */
  alphaResultHeader: {
    paddingVertical: sh(14),
    paddingHorizontal: sw(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(10),
  },
  alphaResultHeaderCorrect: {
    backgroundColor: '#2ca96a',
  },
  alphaResultHeaderIncorrect: {
    backgroundColor: '#FF7043',
  },
  alphaResultHeaderIcon: {
    fontSize: sf(24),
  },
  alphaResultHeaderText: {
    fontSize: sf(22),
    fontFamily: 'DynaPuff-Bold',
    color: '#FFFFFF',
  },

  /** Body area below the header */
  alphaResultBody: {
    paddingHorizontal: sw(16),
    paddingVertical: sh(14),
    gap: sh(10),
  },

  /** Individual info row (Expected / You said) */
  alphaResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F9FF',
    borderRadius: sw(14),
    paddingVertical: sh(12),
    paddingHorizontal: sw(14),
  },
  alphaResultLabel: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#57b8b3',
    width: sw(108),
  },
  alphaResultValue: {
    fontSize: sf(22),
    fontFamily: 'Comfortaa-Bold',
    color: '#008443',
    flex: 1,
  },
  alphaResultValueMuted: {
    fontSize: sf(18),
    fontFamily: 'Comfortaa-Medium',
    color: '#9CA3AF',
    flex: 1,
  },

  // ─────────────────────────────────────────────────────────
  // WORD DISPLAY — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Outer card for word display */
  wordDisplayCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2ca96a',
    borderWidth: 4,
    borderRadius: sw(30),
    paddingTop: sh(22),
    paddingBottom: sh(28),
    paddingHorizontal: sw(24),
    marginTop: sh(20),
    marginBottom: sh(16),
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },

  /** "READ THIS WORD" label above the word */
  wordDisplayLabel: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#57b8b3',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: sh(18),
  },

  /** The word itself */
  wordDisplayText: {
    fontSize: sf(54),
    fontFamily: 'Comfortaa-Bold',
    color: '#008443',
    textAlign: 'center',
  },

  /** Decorative underline accent below the word */
  wordAccentLine: {
    height: sw(5),
    backgroundColor: '#57b8b3',
    borderRadius: sw(3),
    width: '55%',
    marginTop: sh(14),
  },

  // ─────────────────────────────────────────────────────────
  // WORD FEEDBACK — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Wrapper card for the word result */
  wordResultCard: {
    borderRadius: sw(24),
    overflow: 'hidden',
    marginBottom: sh(10),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  wordResultContent: {
    paddingVertical: sh(20),
    paddingHorizontal: sw(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sw(10),
  },
  wordResultCorrect: {
    backgroundColor: '#2ca96a',
  },
  wordResultIncorrect: {
    backgroundColor: '#FF7043',
  },
  wordResultIcon: {
    fontSize: sf(28),
  },
  wordResultText: {
    fontSize: sf(20),
    fontFamily: 'Comfortaa-Bold',
    color: '#FFFFFF',
    flex: 1,
  },

  // ALPHABET DESIGN
  scene: {
    alignItems: 'center',
    marginTop: sh(50),
    marginBottom: sh(4),
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
    marginTop: sh(2),
    backgroundColor: '#FFFFFF',
    borderColor: '#2ca96a',
    borderWidth: 2.5,
    borderRadius: sw(20),
    paddingHorizontal: sw(20),
    paddingVertical: sh(8),
    marginBottom: sh(50),
  },
  promptEmoji: { fontSize: sf(20) },
  promptText: {
    fontSize: sf(17),
    color: '#008443',
  },

  // ── Transcribing Loading Modal ──────────────────────────────────────────────
  loadingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Custom dark transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModalContent: {
    backgroundColor: '#FFFFFF',
    paddingVertical: sh(28),
    paddingHorizontal: sw(32),
    borderRadius: sw(24),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.25,
    shadowRadius: sw(10),
    width: '80%',
    maxWidth: sw(320),
  },
  loadingModalTitle: {
    fontFamily: 'Andika-Bold',
    fontSize: sf(18),
    color: '#1E1E1E',
    marginTop: sh(20),
    marginBottom: sh(6),
    textAlign: 'center',
  },
  loadingModalSubtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(13),
    color: '#6B7280',
    textAlign: 'center',
  },

  // ── PREMIUM ALPHABET FEEDBACK CARD ───────────────────────────────────────────
  newAlphaCard: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(32),
    padding: sw(24),
    marginVertical: sh(16),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(8) },
    shadowOpacity: 0.15,
    shadowRadius: sw(16),
    borderWidth: 3,
  },
  newAlphaCardCorrect: {
    borderColor: '#2ca96a',
  },
  newAlphaCardIncorrect: {
    borderColor: '#FF7043',
  },
  newAlphaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sh(20),
    gap: sw(10),
  },
  newAlphaHeaderEmoji: {
    fontSize: sf(28),
  },
  newAlphaHeaderText: {
    fontSize: sf(22),
    fontFamily: 'DynaPuff-Bold',
  },
  newAlphaTextCorrect: {
    color: '#008443',
  },
  newAlphaTextIncorrect: {
    color: '#D84315',
  },
  newAlphaComparisonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: sw(24),
    padding: sw(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: sh(16),
  },
  newAlphaTargetBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(12),
  },
  newAlphaLabel: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: sh(8),
  },
  newAlphaTargetLetter: {
    fontSize: sf(56),
    fontFamily: 'DynaPuff-Bold',
    color: '#0F172A',
    includeFontPadding: false,
    lineHeight: sf(64),
  },
  newAlphaDivider: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(20),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.1,
    shadowRadius: sw(4),
    zIndex: 2,
    alignSelf: 'center',
    marginHorizontal: sw(-10), // overlap
  },
  newAlphaDividerIcon: {
    fontSize: sf(18),
    fontFamily: 'Comfortaa-Bold',
    color: '#94A3B8',
  },
  newAlphaSpokenBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sh(12),
    borderRadius: sw(20),
    borderWidth: 2,
  },
  newAlphaSpokenCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  newAlphaSpokenIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  newAlphaSpokenLetter: {
    fontSize: sf(56),
    fontFamily: 'DynaPuff-Bold',
    includeFontPadding: false,
    lineHeight: sf(64),
  },
  newAlphaSpokenLetterCorrect: {
    color: '#008443',
  },
  newAlphaSpokenLetterIncorrect: {
    color: '#DC2626',
  },
  newAlphaFeedbackBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: sw(16),
    padding: sw(16),
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
  },
  newAlphaFeedbackText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#92400E',
    textAlign: 'center',
    lineHeight: sf(22),
  },

  // ─────────────────────────────────────────────────────────
  // PLAIN-TEXT ALPHABET / WORD FEEDBACK — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Outer wrapper */
  plainFeedbackWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: sh(24),
    paddingHorizontal: sw(16),
  },

  /** "Good Job!" greeting text */
  plainGreetText: {
    fontSize: sf(28),
    fontFamily: 'sassoon-primary-std',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: sh(12),
  },

  /** Target letter / word displayed in large green (correct) */
  plainLetterCorrect: {
    fontSize: sf(72),
    fontFamily: 'sassoon-primary-std',
    color: '#008443',
    textAlign: 'center',
    marginBottom: sh(8),
  },

  /** Target letter / word displayed in large text (incorrect — neutral dark) */
  plainLetterIncorrect: {
    fontSize: sf(72),
    fontFamily: 'sassoon-primary-std',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: sh(8),
  },

  /** Word-specific size override (smaller than letter) */
  plainWordSize: {
    fontSize: sf(48),
    lineHeight: sf(56),
  },

  /** "Keep it up. You can do it." encouragement text */
  plainEncourageText: {
    fontSize: sf(22),
    fontFamily: 'sassoon-primary-std',
    color: '#555555',
    textAlign: 'center',
    marginBottom: sh(12),
  },

  /** "Correct" / "Incorrect Reading" result label (base) */
  plainResultLabel: {
    fontSize: sf(24),
    fontFamily: 'sassoon-primary-std',
    textAlign: 'center',
    marginTop: sh(4),
    marginBottom: sh(16),
  },

  /** Green colour for "Correct" label */
  plainResultCorrect: {
    color: '#008443',
  },

  /** Red colour for "Incorrect Reading" label */
  plainResultIncorrect: {
    color: '#D32F2F',
  },

  // ── Loading Modal Image ─────────────────────────────────────────────────────
  loadingModalImage: {
    width: sw(120),
    height: sw(120),
    resizeMode: 'contain',
    marginBottom: sh(12),
  },
});

export default readingStyles;
