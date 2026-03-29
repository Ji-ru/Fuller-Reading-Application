import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => Math.min(size, width * 0.05);

const readingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    padding: 10,
  },

  insideContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  // ======================
  // PASSAGE (RESPONSIVE)
  // ======================

  passageContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 12,
    alignSelf: 'center',
    width: '95%',
    maxWidth: 700, 
  },

  passageCard: {
    backgroundColor: '#c0e8f2', 
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a73e8',
    elevation: 5,
    width: '90%',
    maxHeight: 300, 
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
  },

  passageAuthor: {
    fontSize: scaleFont(12),
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },

  passageText: {
    fontSize: Math.min(20, width * 0.045),
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
  },

  textContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },

  textLine: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'justify',
    fontFamily: 'Satoshi-Medium',
  },

  // ======================
  // IMAGE (RESPONSIVE)
  // ======================

  readingImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxHeight: 250,
    maxWidth: 250,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  // ======================
  // MICROPHONE (RESPONSIVE)
  // ======================

  microphoneContainer: {
    marginTop: 40,
    alignItems: 'center',
  },

  microphone: {
    backgroundColor: '#84D6F2',
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  microphoneRecording: {
    backgroundColor: '#FF9E9C',
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ======================
  // ALPHABET (FIXED ISSUE HERE)
  // ======================

  alphabetContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },

  letterContainer: {
  backgroundColor: '#4F46E5',
  minWidth: width * 0.25,
  minHeight: width * 0.25,
  padding: 20,
  borderRadius: 999, // perfect circle always
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 24,
  elevation: 8,
  },

  bigLetter: {
    fontSize: Math.min(80, width * 0.18),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  alphabetExamples: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  exampleText: {
    fontSize: scaleFont(20),
    color: '#333',
    lineHeight: scaleFont(28),
    textAlign: 'center',
    flexWrap: 'wrap',
  },

  highlightedLetter: {
    color: '#EF4444',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: scaleFont(22),
  },

  // ======================
  // WORD CARD (FIXED OVERFLOW)
  // ======================

  wordCardContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },

  wordCard: {
    backgroundColor: '#c0e8f2',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.08,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a73e8',
    elevation: 5,
    maxWidth: '90%',
  },

  wordCardText: {
    fontSize: Math.min(64, width * 0.14),
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
    flexWrap: 'wrap',
  },

  wordCardInstruction: {
    fontSize: scaleFont(18),
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
  },

  // ======================
  // FEEDBACK (CLEANED)
  // ======================

  feedbackContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    elevation: 4,
  },

  feedbackText: {
    fontSize: scaleFont(14),
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
  },

  successText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  errorText: {
    color: '#FF5252',
    fontWeight: 'bold',
  },

  // ======================
  // LOADING
  // ======================

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: scaleFont(14),
    color: '#666',
    textAlign: 'center',
  },
});

export default readingStyles;