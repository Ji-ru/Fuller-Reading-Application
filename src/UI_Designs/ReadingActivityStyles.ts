import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => Math.min(size, width * 0.05);

const readingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebf5fb',
  },

  insideContainer: {
    flex: 1,
  },

  insideScrollContent: {
    paddingBottom: 160,
  },

// ── Passage Card ────────────────────────────────────────────────────────
   passageContainer: {
     backgroundColor: '#fff',
     paddingTop: 28,
     paddingBottom: 28,
     paddingHorizontal: 24,
     borderRadius: 28,
     marginBottom: 6,
     alignSelf: 'center',
     width: '95%',
     maxWidth: 700,
     minHeight: 200,
     flex: 1,
     borderWidth: 2,
     borderColor: '#d6eaf8',
     position: 'relative',
     overflow: 'visible',
   },

  passageCard: {
    backgroundColor: '#ebf5fb',
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d6eaf8',
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
    paddingBottom: 30,
  },

  passageTitle: {
    fontSize: scaleFont(24),
    fontFamily: 'Andika-Bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1c2833',
  },

  passageAuthor: {
    fontSize: scaleFont(12),
    color: '#859dab',
    textAlign: 'center',
    marginBottom: 4,
  },

  passageText: {
    fontSize: Math.min(20, width * 0.045),
    lineHeight: 30,
    color: '#1c2833',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Andika-Regular',
  },

  textContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },

  textLine: {
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: 'Andika-Bold',
    fontWeight: 'bold',
    color: '#1c2833',
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
    marginTop: 20,
    alignItems: 'center',
    gap: 12,
    marginBottom:30,
  },

  microphone: {
    backgroundColor: '#154360',
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#154360',
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
     backgroundColor: '#154360',
     minWidth: width * 0.25,
     minHeight: 100,
     width: 120,
     padding: 20,
     borderRadius: 24,
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 20,
     shadowColor: '#154360',
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
    fontFamily: 'Andika-Bold',
  },

  alphabetExamples: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
  },

  exampleText: {
    fontSize: scaleFont(20),
    color: '#1c2833',
    lineHeight: scaleFont(28),
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'Andika-Regular',
  },

   highlightedLetter: {
     color: '#154360',
     fontWeight: 'bold',
     textDecorationLine: 'underline',
     fontSize: scaleFont(22),
     fontFamily: 'Andika-Bold',
   },

  // ── Word Card ───────────────────────────────────────────────────────────
  wordCardContainer: {
    alignItems: 'center',
    width: '100%',
  },

wordCard: {
     backgroundColor: '#fff',
     paddingVertical: 40,
     paddingHorizontal: 30,
     borderRadius: 32,
     borderWidth: 2,
     borderColor: '#d6eaf8',
     minWidth: '85%',
     maxWidth: '92%',
     minHeight: 140,
     flex: 1,
     shadowColor: '#154360',
     shadowOffset: { width: 0, height: 8 },
     shadowOpacity: 0.08,
     shadowRadius: 16,
     elevation: 4,
     position: 'relative',
     justifyContent: 'center',
     alignItems: 'center',
     overflow: 'visible',
   },

  wordCardText: {
    fontSize: Math.min(64, width * 0.14),
    fontWeight: 'bold',
    color: '#1c2833',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'Andika-Bold',
  },

  wordCardInstruction: {
    fontSize: scaleFont(16),
    color: '#859dab',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Andika-Regular',
    marginTop: 8,
  },

  // ── Calculation / Accuracy Container ────────────────────────────────────
  calculationContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },

  calculationText: {
    fontSize: 22,
    fontFamily: 'Andika-Bold',
    color: '#154360',
  },

  correctContainer: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },

  incorrectContainer: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },

  feedbackLabel: {
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    color: '#1c2833',
    marginBottom: 12,
    marginLeft: 4,
  },

  boldText: {
    fontFamily: 'Andika-Bold',
    color: '#154360',
  },

  // ── Miscue Specific Text Colors ─────────────────────────────────────────
  substitutionText: { color: '#e74c3c' },
  omissionText: { color: '#f39c12' },
  insertionText: { color: '#3498db' },
  repetitionText: { color: '#9b59b6' },

  // ── Try Again Button ────────────────────────────────────────────────────
  tryAgainButton: {
    backgroundColor: '#154360',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  tryAgainText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    letterSpacing: 0.5,
  },

  // ── Word/Alphabet Feedback Specifics ────────────────────────────────────
  waFeedbackWordBox: {
    alignItems: 'center',
    padding: 12,
  },

  waFeedbackMessage: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: '#1c2833',
    textAlign: 'center',
  },

  feedbackContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
  },

  feedbackText: {
    fontSize: scaleFont(14),
    fontFamily: 'Andika-Regular',
    textAlign: 'center',
    color: '#1c2833',
  },

   successText: {
     color: '#154360',
     fontWeight: 'bold',
     fontFamily: 'Andika-Bold',
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
    fontFamily: 'Andika-Bold',
    color: '#1c2833',
    textAlign: 'center',
  },

  instructionSubtitle: {
    fontSize: 14,
    fontFamily: 'Andika-Regular',
    color: '#859dab',
    marginTop: 4,
    textAlign: 'center',
  },

  instructionListening: {
    color: '#154360',
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
    borderColor: '#ebf5fb',
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  footerControls: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
  },

  activityContentWrapper: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 60,
    gap: 24,
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
    backgroundColor: '#154360',
    opacity: 0.15,
  },

  progressDotActive: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#154360',
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
    backgroundColor: '#154360',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  completedCard: {
    borderColor: '#154360',
    borderWidth: 3,
  },

  errorCard: {
    borderColor: '#e74c3c',
    borderWidth: 3,
  },

  loadingText: {
    fontSize: scaleFont(14),
    color: '#859dab',
    textAlign: 'center',
    fontFamily: 'Andika-Regular',
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
