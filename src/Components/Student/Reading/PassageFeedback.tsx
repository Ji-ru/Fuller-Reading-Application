import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, G } from 'react-native-svg';
import { MiscueAnalysisService } from '../../../Controller/MiscueAnalysisServiceController';
import { Miscue } from '../../../Interfaces/miscue';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';

interface ReadingFeedbackProps {
  targetText: string;
  spokenText: string;
  miscues: Miscue[];
  onTryAgain: () => void;
  type: 'alphabet' | 'passage' | 'word';
  accuracy?: string;
  feedback?: string;
  isTextCorrect: boolean;
}

const RetryIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 10.5C4.5 7.46243 6.96243 5 10.5 5C14.0376 5 16.5 7.46243 16.5 10.5M4.5 10.5V5M4.5 10.5H10.5"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.5 13.5C19.5 16.5376 17.0376 19 13.5 19C9.96243 19 7.5 16.5376 7.5 13.5M19.5 13.5V19M19.5 13.5H13.5"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FeedbackResult: React.FC<ReadingFeedbackProps> = ({
  targetText,
  spokenText,
  miscues,
  onTryAgain,
  type,
  accuracy: passedAccuracy,
  feedback: passedFeedback,
  isTextCorrect,
}) => {
  if (type === 'alphabet') {
    const alphabetAccuracy =
      passedAccuracy ||
      MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText)
        .accuracy;
    const alphabetFeedback =
      passedFeedback ||
      MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText)
        .feedback;
    const isCorrect = alphabetAccuracy == '100';
    
    return (
      <View style={localStyles.container}>
      </View>
    );
  } else if (type === 'word') {
    return (
      <View style={localStyles.container}>
      </View>
    );
  }

  // PASSAGE ANALYSIS
  const accuracy = MiscueAnalysisService.calculateAccuracy(
    targetText,
    spokenText,
  );
  const feedback = MiscueAnalysisService.getAccuracyFeedback(accuracy);


  return (
    <View style={localStyles.container}>
      <View style={readingStyles.calculationContainer}>
        <Text style={readingStyles.calculationText}>
          {feedback} • {accuracy}% Accuracy
        </Text>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
  }
});
