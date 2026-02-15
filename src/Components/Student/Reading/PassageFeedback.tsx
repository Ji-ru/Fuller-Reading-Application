import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Miscue } from '../../../Interfaces/miscue';
import { MiscueAnalysisService } from '../../../Controller/MiscueAnalysisServiceController';
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
    // FOR ALPHABET ANALYSIS
    // Use passed accuracy/feedback or calculate if not provided
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
      <View>
        <View
          style={[
            readingStyles.calculationContainer,
            isCorrect
              ? readingStyles.correctContainer
              : readingStyles.incorrectContainer,
          ]}
        >
          <Text style={readingStyles.calculationText}>
            {isCorrect ? '✓ Tama!' : '✗ Mali'}
          </Text>
        </View>

        <Text style={readingStyles.feedbackLabel}>Kalabasan</Text>
        <View style={readingStyles.feedbackContainer}>
          <Text style={readingStyles.feedbackText}>
            Inaasahan:{' '}
            <Text style={readingStyles.boldText}>
              {targetText.toUpperCase()}
            </Text>
          </Text>
          <Text style={readingStyles.feedbackText}>
            Iyong bigkas:{' '}
            <Text style={readingStyles.boldText}>
              {spokenText || '(walang natukoy)'}
            </Text>
          </Text>
          <Text
            style={[
              readingStyles.feedbackText,
              isCorrect ? readingStyles.successText : readingStyles.errorText,
            ]}
          >
            {alphabetFeedback}
          </Text>
        </View>

        <TouchableOpacity
          style={readingStyles.tryAgainButton}
          onPress={onTryAgain}
        >
          <Text style={readingStyles.tryAgainText}>Ulitin</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (type === 'word') {
    return (
      <View style={readingStyles.feedbackContainer}>
        <View style={readingStyles.waFeedbackWordBox}>
          {/* Message */}
          <Text style={readingStyles.waFeedbackMessage}>
            {isTextCorrect
              ? 'Tama ang iyong pag bigkas!'
              : 'Subukan muli!.'}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={readingStyles.tryAgainButton}
          onPress={onTryAgain}
        >
          <Text style={readingStyles.tryAgainText}>Subukan Muli</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // FOR THE PASSAGE ANALYSIS
  const accuracy = MiscueAnalysisService.calculateAccuracy(
    targetText,
    spokenText,
  );
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

      <Text style={readingStyles.feedbackLabel}>Paguulat ng Katugunan</Text>
      <View style={readingStyles.feedbackContainer}>
        <Text
          style={[readingStyles.feedbackText, readingStyles.substitutionText]}
        >
          Pagpapalit:{' '}
          {MiscueAnalysisService.formatMiscueWords(
            categorizedMiscues.substitution,
          )}
        </Text>
        <Text style={[readingStyles.feedbackText, readingStyles.omissionText]}>
          Kaligtaan:{' '}
          {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
        </Text>
        <Text style={[readingStyles.feedbackText, readingStyles.insertionText]}>
          Pagsingit:{' '}
          {MiscueAnalysisService.formatMiscueWords(
            categorizedMiscues.insertion,
          )}
        </Text>
        <Text
          style={[readingStyles.feedbackText, readingStyles.repetitionText]}
        >
          Pag-uulit:{' '}
          {MiscueAnalysisService.formatMiscueWords(
            categorizedMiscues.repetition,
          )}
        </Text>
      </View>

      <TouchableOpacity
        style={readingStyles.tryAgainButton}
        onPress={onTryAgain}
      >
        <Text style={readingStyles.tryAgainText}>Subukan Muli</Text>
      </TouchableOpacity>
    </View>
  );
};
