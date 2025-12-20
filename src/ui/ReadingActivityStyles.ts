import { StyleSheet } from 'react-native';

const readingStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: '#ECFBFF',
    padding: 10,
    position: 'relative',
  },
  insideContainer: {
    justifyContent: 'flex-start',
    position: 'relative',
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
  category: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    marginBottom: 10,
    alignSelf: 'center',
    flexShrink: 1,
  },
  passageContainerFeedback: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    alignSelf: 'center',
    flexShrink: 1,
    marginBottom: 10,
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
  textContainer: {
    marginTop: 10,
    fontSize: 25,
  },
  textLine: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
  },
  readingImage: {
    width: 230,
    height: 230,
    maxHeight: 250,
    maxWidth: 250,
    alignSelf: 'center',
  },
  substitutionText: {
    color: '#FF2726',
  },
  omissionText: {
    color: '#FF941A',
  },
  insertionText: {
    color: '#1A81FF',
  },
  repetitionText: {
    color: '#BF00DD',
  },
  // MICROPHONE
  microphoneContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  microphone: {
    backgroundColor: '#84D6F2',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  microphoneRecording: {
    backgroundColor: '#FF9E9C',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
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
  // errorText: {
  //   color: 'red',
  //   marginTop: 8,
  // },
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
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
  },
  feedbackLabel: {
    fontSize: 15,
    padding: 5,
    fontFamily: 'Satoshi-Bold',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    elevation: 5,
  },

  tryAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ALPHABET DISPLAY STYLE

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

  // WORD DISPLAY STYLE
  wordCardContainer: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 120
  },

  wordCard: {
    backgroundColor: '#c0e8f2',
    paddingVertical: 40,
    paddingHorizontal: 50,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1a73e8',
    elevation: 6,
    marginBottom: 100
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

    // =====================================
  // WORD & ALPHABET FEEDBACK CARD STYLES
  // =====================================

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

});

export default readingStyles;
