import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Miscue } from '../../Types/miscue';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
import readingStyles from '../../ui/ReadingActivityStyles';

interface ReadingFeedbackProps {
  passageText: string;
  spokenText: string;
  miscues: Miscue[];
  onTryAgain: () => void;
}

export const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({
  passageText,
  spokenText,
  miscues,
  onTryAgain,
}) => {
  const accuracy = MiscueAnalysisService.calculateAccuracy(passageText, spokenText);
  const feedback = MiscueAnalysisService.getAccuracyFeedback(accuracy);

  const categorizedMiscues = {
    substitution: miscues.filter(m => m.type === 'substitution'),
    omission: miscues.filter(m => m.type === 'omission'),
    insertion: miscues.filter(m => m.type === 'insertion'),
    repetition: miscues.filter(m => m.type === 'repetition'),
  };

  return (
    <View>
      <View style={readingStyles.calculationContainer}>
        <Text style={readingStyles.calculationText}>
          {feedback} - {accuracy}%
        </Text>
      </View>

      <Text style={readingStyles.feedbackLabel}>Feedback Report</Text>
      <View style={readingStyles.feedbackContainer}>
        <Text style={readingStyles.feedbackText}>
          Substitution: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.substitution)}
        </Text>
        <Text style={readingStyles.feedbackText}>
          Omission: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
        </Text>
        <Text style={readingStyles.feedbackText}>
          Insertion: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.insertion)}
        </Text>
        <Text style={readingStyles.feedbackText}>
          Repetition: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.repetition)}
        </Text>
      </View>

      <TouchableOpacity
        style={readingStyles.tryAgainButton}
        onPress={onTryAgain}
      >
        <Text style={readingStyles.tryAgainText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};