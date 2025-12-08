// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { Miscue } from '../../Types/miscue';
// import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
// import readingStyles from '../../ui/ReadingActivityStyles';

// interface ReadingFeedbackProps {
//   passageText: string;
//   spokenText: string;
//   miscues: Miscue[];
//   onTryAgain: () => void;
// }

// export const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({
//   passageText,
//   spokenText,
//   miscues,
//   onTryAgain,
// }) => {
//   const accuracy = MiscueAnalysisService.calculateAccuracy(passageText, spokenText);
//   const feedback = MiscueAnalysisService.getAccuracyFeedback(accuracy);

//   const categorizedMiscues = {
//     substitution: miscues.filter(m => m.type === 'substitution'),
//     omission: miscues.filter(m => m.type === 'omission'),
//     insertion: miscues.filter(m => m.type === 'insertion'),
//     repetition: miscues.filter(m => m.type === 'repetition'),
//   };

//   return (
//     <View>
//       <View style={readingStyles.calculationContainer}>
//         <Text style={readingStyles.calculationText}>
//           {feedback} - {accuracy}%
//         </Text>
//       </View>

//       <Text style={readingStyles.feedbackLabel}>Feedback Report</Text>
//       <View style={readingStyles.feedbackContainer}>
//         <Text style={readingStyles.feedbackText}>
//           Substitution: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.substitution)}
//         </Text>
//         <Text style={readingStyles.feedbackText}>
//           Omission: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
//         </Text>
//         <Text style={readingStyles.feedbackText}>
//           Insertion: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.insertion)}
//         </Text>
//         <Text style={readingStyles.feedbackText}>
//           Repetition: {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.repetition)}
//         </Text>
//       </View>

//       <TouchableOpacity
//         style={readingStyles.tryAgainButton}
//         onPress={onTryAgain}
//       >
//         <Text style={readingStyles.tryAgainText}>Try Again</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Miscue } from '../../Types/miscue';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
import readingStyles from '../../ui/ReadingActivityStyles';

interface ReadingFeedbackProps {
  targetText: string;
  spokenText: string;
  miscues: Miscue[];
  onTryAgain: () => void;
  type: 'alphabet' | 'passage';
  accuracy?: string;
  feedback?: string;
}

export const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({
  targetText,
  spokenText,
  miscues,
  onTryAgain,
  type,
  accuracy: passedAccuracy,
  feedback: passedFeedback,
}) => {
  if (type === 'alphabet') {
    // FOR ALPHABET ANALYSIS
    // Use passed accuracy/feedback or calculate if not provided
    const alphabetAccuracy = passedAccuracy || MiscueAnalysisService.checkAlphabetAccuracy(targetText, spokenText).accuracy;
    const alphabetFeedback = passedFeedback || MiscueAnalysisService.checkAlphabetAccuracy(targetText, spokenText).feedback;
    const isCorrect = alphabetAccuracy == '100';

    return (
      <View>
        <View style={[
          readingStyles.calculationContainer,
          isCorrect ? readingStyles.correctContainer : readingStyles.incorrectContainer
        ]}>
          <Text style={readingStyles.calculationText}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </Text>
        </View>

        <Text style={readingStyles.feedbackLabel}>Result</Text>
        <View style={readingStyles.feedbackContainer}>
          <Text style={readingStyles.feedbackText}>
            Expected: <Text style={readingStyles.boldText}>{targetText.toUpperCase()}</Text>
          </Text>
          <Text style={readingStyles.feedbackText}>
            You said: <Text style={readingStyles.boldText}>{spokenText || '(nothing detected)'}</Text>
          </Text>
          <Text style={[
            readingStyles.feedbackText,
            isCorrect ? readingStyles.successText : readingStyles.errorText
          ]}>
            {alphabetFeedback}
          </Text>
        </View>

        <TouchableOpacity
          style={readingStyles.tryAgainButton}
          onPress={onTryAgain}
        >
          <Text style={readingStyles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // FOR THE PASSAGE ANALYSIS
  const accuracy = MiscueAnalysisService.calculateAccuracy(targetText, spokenText);
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