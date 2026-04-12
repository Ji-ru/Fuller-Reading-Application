import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => Math.min(size, width * 0.05);

const readingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faf4',
    padding: 10,
  },

  insideContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  // ── Passage Card ────────────────────────────────────────────────────────
  passageContainer: {
    backgroundColor: '#fff',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginBottom: 6,
    alignSelf: 'center',
    width: '95%',
    maxWidth: 700,
    height: 380,
    minHeight: 380,
    maxHeight: 380,
    borderWidth: 2,
    borderColor: '#d4f5e2',
    position: 'relative',
    overflow: 'hidden',
  },

  passageContainerFeedback: {
    backgroundColor: '#fff',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginBottom: 6,
    alignSelf: 'center',
    width: '95%',
    maxWidth: 700,
    height: 380,
    minHeight: 380,
    maxHeight: 380,
    borderWidth: 2,
    borderColor: '#1a7a45',
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },

  passageCard: {
    backgroundColor: '#f0faf4',
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d4f5e2',
    width: '90%',
    maxHeight: 300,
  },

  passageHeader: {
    width: '95%',
    maxWidth: 700,
    marginBottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },

  passageScroll: {
    marginTop: 10,
    paddingBottom: 20,
  },

  passageTitle: {
    fontSize: scaleFont(24),
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1b2e23',
  },

  passageAuthor: {
    fontSize: scaleFont(12),
    color: '#8fafa0',
    textAlign: 'center',
    marginBottom: 4,
  },

  passageText: {
    fontSize: Math.min(20, width * 0.045),
    lineHeight: 30,
    color: '#1b2e23',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Satoshi-Medium',
  },

  textContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },

  textLine: {
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
    color: '#1b2e23',
    paddingHorizontal: 4,
  },

  // ── Image ───────────────────────────────────────────────────────────────
  readingImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxHeight: 250,
    maxWidth: 250,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  // ── Microphone / Recording Controls ─────────────────────────────────────
  microphoneContainer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },

  microphone: {
    backgroundColor: '#1a7a45',
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },

  microphoneRecording: {
    backgroundColor: '#e74c3c',
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 25,
    elevation: 10,
  },

  // ── Alphabet ────────────────────────────────────────────────────────────
  alphabetContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },

  letterContainer: {
    backgroundColor: '#1a7a45',
    minWidth: width * 0.25,
    height: 120,
    width: 120,
    padding: 20,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },

  bigLetter: {
    fontSize: Math.min(80, width * 0.18),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },

  alphabetExamples: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
  },

  exampleText: {
    fontSize: scaleFont(20),
    color: '#1b2e23',
    lineHeight: scaleFont(28),
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'Satoshi-Medium',
  },

  highlightedLetter: {
    color: '#1a7a45',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: scaleFont(22),
  },

  // ── Word Card ───────────────────────────────────────────────────────────
  wordCardContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },

  wordCard: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#d4f5e2',
    minWidth: '85%',
    maxWidth: '92%',
    height: 180,
    minHeight: 180,
    maxHeight: 180,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  wordCardText: {
    fontSize: Math.min(64, width * 0.14),
    fontWeight: 'bold',
    color: '#1a7a45',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'Satoshi-Bold',
  },

  wordCardInstruction: {
    fontSize: scaleFont(16),
    color: '#8fafa0',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
    marginTop: 8,
  },

  // ── Calculation / Accuracy Container ────────────────────────────────────
  calculationContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },

  calculationText: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    color: '#1a7a45',
  },

  correctContainer: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0faf4',
  },

  incorrectContainer: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },

  feedbackLabel: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#1b2e23',
    marginBottom: 12,
    marginLeft: 4,
  },

  boldText: {
    fontFamily: 'Satoshi-Bold',
    color: '#1a7a45',
  },

  // ── Miscue Specific Text Colors ─────────────────────────────────────────
  substitutionText: { color: '#e74c3c' },
  omissionText: { color: '#f39c12' },
  insertionText: { color: '#3498db' },
  repetitionText: { color: '#9b59b6' },

  // ── Try Again Button ────────────────────────────────────────────────────
  tryAgainButton: {
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  tryAgainText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi-Black',
    letterSpacing: 0.5,
  },

  // ── Word/Alphabet Feedback Specifics ────────────────────────────────────
  waFeedbackWordBox: {
    alignItems: 'center',
    padding: 12,
  },

  waFeedbackMessage: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#1b2e23',
    textAlign: 'center',
  },

  feedbackContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
  },

  feedbackText: {
    fontSize: scaleFont(14),
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    color: '#1b2e23',
  },

  successText: {
    color: '#1a7a45',
    fontWeight: 'bold',
  },

  errorText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },

  // ── Instructions / Conversational Header ──────────────────────────────
  instructionContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },

  instructionTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    color: '#1b2e23',
    textAlign: 'center',
  },

  instructionSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#8fafa0',
    marginTop: 4,
    textAlign: 'center',
  },

  instructionListening: {
    color: '#1a7a45',
  },

  // ── Navigation Arrows ──────────────────────────────────────────────────
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    zIndex: 10,
  },

  navArrow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f0faf4',
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  footerControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
  },

  activityContentWrapper: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },

  progressDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    height: 20,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a7a45',
    opacity: 0.15,
  },

  progressDotActive: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a7a45',
    opacity: 1,
  },

  navArrowHidden: {
    opacity: 0,
  },

  // ── Pulsing Ring ───────────────────────────────────────────────────────
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulseRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },

  // ── Loading ─────────────────────────────────────────────────────────────
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  // ── Completion Indicator ───────────────────────────────────────────
  completionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#1a7a45',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  completedCard: {
    borderColor: '#1a7a45',
  },

  loadingText: {
    fontSize: scaleFont(14),
    color: '#8fafa0',
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
  },

  // ── Decorative Circles ──
  circleDecor: {
    position: 'absolute',
    borderRadius: 999,
  },
  clipContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 32,
  },
});

export default readingStyles;