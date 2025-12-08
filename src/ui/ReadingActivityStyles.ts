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
    flex: 1,
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
  passageContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    marginBottom: 10,
    alignSelf: 'center',
    flexShrink: 1
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
    width: 250,
    height: 250,
    maxHeight: 250,
    maxWidth: 250,
    alignSelf: 'center',
  },
  microphoneContainer: {
    marginTop: 10,
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
  errorText: {
    color: 'red',
    marginTop: 8,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
  
  instructions: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBBF24',
    width: '100%',
  },
  
  instructionText: {
    fontSize: 16,
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default readingStyles;
