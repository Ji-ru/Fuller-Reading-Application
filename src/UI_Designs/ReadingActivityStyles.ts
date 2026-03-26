import { StyleSheet } from 'react-native';

const readingStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: '#ECFBFF',
    position: 'relative',
  },
  screenScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  insideContainer: {
    justifyContent: 'flex-start',
    position: 'relative',
    padding: 10,
    zIndex: 1,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },

  // FEEDBACK
  passageContainer: {
    backgroundColor: '#E8F4FF',
    borderColor: '#38B6FF',
    borderWidth: 4,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 30,
    elevation: 5,
    marginBottom: 10,
    alignSelf: 'center',
    flexShrink: 1,
  },
  passageContainerFeedback: {
    backgroundColor: '#E8F4FF',
    borderColor: '#38B6FF',
    borderWidth: 4,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 30,
    elevation: 5,
    alignSelf: 'center',
    flexShrink: 1,
    marginBottom: 15,
  },
  passageTitle: {
    fontSize: 25,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  passageAuthor: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },

  textLine: {
    fontSize: 23,
    lineHeight: 30,
    textAlign: 'center',
    fontFamily: 'Comfortaa-Regular',
  },
  readingImage: {
    width: 230,
    height: 230,
    maxHeight: 250,
    maxWidth: 250,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 10,
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
    borderRadius: 5,
    padding: 5,
    marginBottom: 5,
  },

  // MICROPHONE
  microphoneContainer: {
    alignItems: 'center',
  },
  microphone: {
    backgroundColor: '#84D6F2',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    elevation: 5,
  },
  microphoneRecording: {
    backgroundColor: '#FF9E9C',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    elevation: 5,
  },
  microphoneIcon: {
    width: 150,
    height: 150,
    maxWidth: 150,
    maxHeight: 150,
    elevation: 5,
  },

  // TESTING
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 16,
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  miscueContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  miscueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  miscueList: {
    maxHeight: 100,
  },
  miscueText: {
    fontSize: 12,
    marginBottom: 4,
  },
  word: {
    fontSize: 18,
    lineHeight: 24,
  },
  currentWord: {
    backgroundColor: '#FFEB3B',
    borderRadius: 4,
  },
  miscueWord: {
    backgroundColor: '#FFCDD2',
    textDecorationLine: 'underline',
  },

  // LOADING INDICATOR STYLES
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },

  // FEEDBACK DESIGN

  // Calculation Accuracy Design
  calculationContainer: {
    backgroundColor: '#D6D6D6',
    height: 40,
    width: '100%',
    paddingTop: 5,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  calculationText: {
    textAlign: 'center',
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#ffff',
  },
  correctContainer: {
    backgroundColor: '#4CAF50',
  },
  incorrectContainer: {
    backgroundColor: '#FF5252',
  },

  // FEEDBACK REPORT
  feedbackContainer: {
    backgroundColor: '#ffff',
    borderColor: '#38B6FF',
    borderWidth: 4,
    borderRadius: 30,
    elevation: 5,
    position: 'relative',
    overflow: 'visible',
  },
  feedbackTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B7FC9',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 5,
  },
  feedbackLabel: {
    fontSize: 15,
    padding: 5,
    fontFamily: 'DynaPuff-Bold',
    color: '#3B7FC9',
  },
  feedbackBookicon: {
    position: 'absolute',
    top: -45,
    left: -30,
    width: 130,
    height: 130,
    zIndex: 2,
  },
  miscueRowsWrapper: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },

  feedbackLabelText: {
    fontSize: 18,
    fontFamily: 'Comforta-VariableFont_wght',
    fontWeight: 'bold',
  },
  feedbackValueText: {
    fontSize: 18,
    fontFamily: 'Comfortaa-Medium',
  },
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'Satoshi-Bold',
  },
  successText: {
    color: '#4CAF50',
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
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  tryAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tryAgainIcon: {
    width: 40,
    height: 40,
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
    marginTop: 50,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  letterContainer: {
    backgroundColor: '#4F46E5',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 10,
  },
  bigLetter: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },
  alphabetExamples: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleSection: {
    marginBottom: 20,
  },
  exampleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 24,
    color: '#333',
    lineHeight: 32,
  },
  highlightedLetter: {
    color: '#EF4444',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 26,
  },

  // WORD DISPLAY STYLE (original — kept for reference)
  wordCardContainer: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 120,
  },
  wordCardText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
  },
  wordCardInstruction: {
    fontSize: 20,
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
  },
  // ── Word scene wrapper ──────────────────────────────────────────────────────
  wordSceneWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
    // Extra vertical space so the timer badge has breathing room below
    paddingBottom: 8,
  },

  // ── Decorative floating bubbles ─────────────────────────────────────────────
  bubbleTopLeft: {
    position: 'absolute',
    top: -8,
    left: 22,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(132, 214, 242, 0.30)',
    borderWidth: 2,
    borderColor: 'rgba(56, 182, 255, 0.35)',
  },
  bubbleTopRight: {
    position: 'absolute',
    top: 6,
    right: 18,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(94, 197, 229, 0.28)',
    borderWidth: 2,
    borderColor: 'rgba(56, 182, 255, 0.30)',
  },
  bubbleBottomRight: {
    position: 'absolute',
    bottom: 30,
    right: 26,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(59, 127, 201, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 182, 255, 0.25)',
  },

  // ── Main word card ──────────────────────────────────────────────────────────
  wordCard: {
    width: '100%',
    backgroundColor: '#E8F4FF',
    borderRadius: 32,
    // Layered border: a thick white inner ring sits on a sky-blue outer stroke
    borderWidth: 4,
    borderColor: '#38B6FF',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 125,
    elevation: 8,
    // Soft inner glow via shadow
    shadowColor: '#38B6FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  // ── Card header (label pill) ────────────────────────────────────────────────
  wordContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    marginTop: 40,
    marginBottom: 30,
  },
  wordCardHeader: {
    marginBottom: 10,
  },
  wordLabelPill: {
    backgroundColor: '#3B7FC9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    elevation: 3,
  },
  wordLabelPillText: {
    fontSize: 13,
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
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  letterTile: {
    // Each tile is a rounded square with a gradient-like stacked look
    width: 58,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#84D6F2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    // Bottom shadow gives a chunky 3-D toy-block feel
    shadowColor: '#2C6975',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  letterTileShine: {
    // A top-left highlight mimicking a shiny surface
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  letterTileText: {
    fontSize: 38,
    fontFamily: 'DynaPuff-Bold',
    color: '#FFFFFF',
    // Text shadow to add depth
    textShadowColor: 'rgba(44,105,117,0.45)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 2,
    includeFontPadding: false,
    lineHeight: 48,
  },

  // ── Wave divider ────────────────────────────────────────────────────────────
  wordCardWave: {
    marginBottom: 12,
    opacity: 0.7,
  },

  // ── Footer hint ─────────────────────────────────────────────────────────────
  wordCardFooter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'rgba(56,182,255,0.35)',
  },
  wordCardFooterText: {
    fontSize: 13,
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
    textAlign: 'center',
  },

  // ── Recording timer badge ───────────────────────────────────────────────────
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: 'rgba(255, 100, 100, 0.12)',
    borderRadius: 24,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FF6464',
    gap: 8,
    marginBottom: 10,
    elevation: 3,
  },
  timerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#CC3333',
    letterSpacing: 1,
  },

  // WORD & ALPHABET FEEDBACK CARD STYLES (original)
  waFeedbackContainer: {
    alignSelf: 'center',
    marginTop: 24,
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 6,
  },
  waFeedbackAnimation: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  waFeedbackTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  waFeedbackMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 8,
    fontFamily: 'Satoshi-Medium',
  },
  waFeedbackWordBox: {
    backgroundColor: '#F4F8FF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  waFeedbackExpectedText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: 2,
    fontFamily: 'Satoshi-Bold',
  },
  waFeedbackSpokenText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D32F2F',
    marginTop: 6,
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
    opacity: 0.8,
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
    marginHorizontal: -14,
  },
  starIcon: {
    width: 155,
    height: 155,
  },
  starSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  starConfetti: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 0,
  },
  passageGreetingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  passageGreetingTitle: {
    fontSize: 30,
    textAlign: 'center',
    fontFamily: 'DynaPuff-Bold',
    color: '#7A5A2B',
  },
  passageScrollView: {
    maxHeight: 170,
    width: '100%',
  },
  passageScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  passageTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },

  // Scroll View Hint
  scrollHintOverlay: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 127, 201, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 6,
  },
  scrollHintText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Comfortaa-Bold',
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────
  // ALPHABET DISPLAY — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Outer card — matches the passage container palette */
  alphaDisplayCard: {
    backgroundColor: '#E8F4FF',
    borderColor: '#38B6FF',
    borderWidth: 4,
    borderRadius: 30,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
    elevation: 5,
  },

  /** Row holding both letter bubbles side-by-side */
  alphaLetterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },

  /** Large circle for the uppercase letter */
  alphaUpperBubble: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#84D6F2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },

  /** Smaller circle for the lowercase letter */
  alphaLowerBubble: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#B8E8F8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  /** Uppercase letter text inside the big bubble */
  alphaUpperLetter: {
    fontSize: 62,
    fontFamily: 'DynaPuff-Bold',
    color: '#FFFFFF',
  },

  /** Lowercase letter text inside the small bubble */
  alphaLowerLetter: {
    fontSize: 42,
    fontFamily: 'DynaPuff-Bold',
    color: '#3B7FC9',
  },

  /** Row of "Uppercase" / "Lowercase" hint labels */
  alphaCaseLabelRow: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 14,
  },
  alphaCaseLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#84D6F2',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    width: 84,
  },

  /** Thin separator before the instruction */
  alphaDivider: {
    height: 1.5,
    backgroundColor: '#B8E8F8',
    width: '75%',
    marginBottom: 12,
  },

  /** "Say this letter!" instruction text */
  alphaInstruction: {
    fontSize: 16,
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────
  // ALPHABET FEEDBACK — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Wrapper card for the alphabet result */
  alphaResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 100,
    marginBottom: 10,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#38B6FF',
  },

  /** Coloured header band */
  alphaResultHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  alphaResultHeaderCorrect: {
    backgroundColor: '#4CAF50',
  },
  alphaResultHeaderIncorrect: {
    backgroundColor: '#FF7043',
  },
  alphaResultHeaderIcon: {
    fontSize: 24,
  },
  alphaResultHeaderText: {
    fontSize: 22,
    fontFamily: 'DynaPuff-Bold',
    color: '#FFFFFF',
  },

  /** Body area below the header */
  alphaResultBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },

  /** Individual info row (Expected / You said) */
  alphaResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F9FF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  alphaResultLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#84D6F2',
    width: 108,
  },
  alphaResultValue: {
    fontSize: 22,
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
    flex: 1,
  },
  alphaResultValueMuted: {
    fontSize: 18,
    fontFamily: 'Comfortaa-Medium',
    color: '#9CA3AF',
    flex: 1,
  },

  // ─────────────────────────────────────────────────────────
  // WORD DISPLAY — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Outer card for word display */
  wordDisplayCard: {
    backgroundColor: '#E8F4FF',
    borderColor: '#38B6FF',
    borderWidth: 4,
    borderRadius: 30,
    paddingTop: 22,
    paddingBottom: 28,
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
    elevation: 5,
  },

  /** "READ THIS WORD" label above the word */
  wordDisplayLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#84D6F2',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 18,
  },

  /** The word itself */
  wordDisplayText: {
    fontSize: 54,
    fontFamily: 'Comfortaa-Bold',
    color: '#3B7FC9',
    textAlign: 'center',
  },

  /** Decorative underline accent below the word */
  wordAccentLine: {
    height: 5,
    backgroundColor: '#84D6F2',
    borderRadius: 3,
    width: '55%',
    marginTop: 14,
  },

  // ─────────────────────────────────────────────────────────
  // WORD FEEDBACK — REDESIGNED
  // ─────────────────────────────────────────────────────────

  /** Wrapper card for the word result */
  wordResultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 5,
  },
  wordResultContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  wordResultCorrect: {
    backgroundColor: '#4CAF50',
  },
  wordResultIncorrect: {
    backgroundColor: '#FF7043',
  },
  wordResultIcon: {
    fontSize: 28,
  },
  wordResultText: {
    fontSize: 20,
    fontFamily: 'Comfortaa-Bold',
    color: '#FFFFFF',
    flex: 1,
  },

  // ALPHABET DESIGN
  scene: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    backgroundColor: '#E8F4FF',
    borderColor: '#38B6FF',
    borderWidth: 2.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 50,
  },
  promptEmoji: { fontSize: 20 },
  promptText: {
    fontSize: 17,
    color: '#3B7FC9',
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
    paddingVertical: 28,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    width: '80%',
    maxWidth: 320,
  },
  loadingModalTitle: {
    fontFamily: 'DynaPuff-Bold',
    fontSize: 18,
    color: '#1E1E1E',
    marginTop: 20,
    marginBottom: 6,
    textAlign: 'center',
  },
  loadingModalSubtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  // ── PREMIUM ALPHABET FEEDBACK CARD ───────────────────────────────────────────
  newAlphaCard: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    marginVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 3,
  },
  newAlphaCardCorrect: {
    borderColor: '#4CAF50',
  },
  newAlphaCardIncorrect: {
    borderColor: '#FF7043',
  },
  newAlphaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  newAlphaHeaderEmoji: {
    fontSize: 28,
  },
  newAlphaHeaderText: {
    fontSize: 22,
    fontFamily: 'DynaPuff-Bold',
  },
  newAlphaTextCorrect: {
    color: '#2E7D32',
  },
  newAlphaTextIncorrect: {
    color: '#D84315',
  },
  newAlphaComparisonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  newAlphaTargetBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  newAlphaLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  newAlphaTargetLetter: {
    fontSize: 56,
    fontFamily: 'DynaPuff-Bold',
    color: '#0F172A',
    includeFontPadding: false,
    lineHeight: 64,
  },
  newAlphaDivider: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 2,
    alignSelf: 'center',
    marginHorizontal: -10, // overlap
  },
  newAlphaDividerIcon: {
    fontSize: 18,
    fontFamily: 'Comfortaa-Bold',
    color: '#94A3B8',
  },
  newAlphaSpokenBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 20,
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
    fontSize: 56,
    fontFamily: 'DynaPuff-Bold',
    includeFontPadding: false,
    lineHeight: 64,
  },
  newAlphaSpokenLetterCorrect: {
    color: '#16A34A',
  },
  newAlphaSpokenLetterIncorrect: {
    color: '#DC2626',
  },
  newAlphaFeedbackBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
  },
  newAlphaFeedbackText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default readingStyles;
