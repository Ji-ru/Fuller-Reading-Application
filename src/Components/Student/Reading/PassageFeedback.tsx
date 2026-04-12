import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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


        <View style={readingStyles.feedbackContainer}>
          <Text
            style={[
              readingStyles.feedbackText,
              isCorrect ? readingStyles.successText : readingStyles.errorText,
            ]}
          >
            {alphabetFeedback}
          </Text>
        </View>

        {!isCorrect && (
          <TouchableOpacity
            style={readingStyles.tryAgainButton}
            onPress={onTryAgain}
            activeOpacity={0.8}
          >
            <Text style={readingStyles.tryAgainText}>Ulitin</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  } else if (type === 'word') {
    return (
      <View style={localStyles.container}>


        {!isTextCorrect && (
          <TouchableOpacity
            style={readingStyles.tryAgainButton}
            onPress={onTryAgain}
            activeOpacity={0.8}
          >
            <Text style={readingStyles.tryAgainText}>Subukan Muli</Text>
          </TouchableOpacity>
        )}
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

      {!isTextCorrect && (
        <TouchableOpacity
          style={readingStyles.tryAgainButton}
          onPress={onTryAgain}
          activeOpacity={0.8}
        >
          <Text style={readingStyles.tryAgainText}>Subukan Muli</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 24,
  }
});
