// import React from 'react';
// import { View, Text, TouchableOpacity, Image } from 'react-native';
// import { Miscue } from '../../../Interfaces/miscue';
// import { MiscueAnalysisService } from '../../../Controller/MiscueAnalysisServiceController';
// import readingStyles from '../../../UI_Designs/ReadingActivityStyles';
// import Svg, { Text as SvgText } from 'react-native-svg';

// interface ReadingFeedbackProps {
//   targetText: string;
//   spokenText: string;
//   miscues: Miscue[];
//   onTryAgain: () => void;
//   type: 'alphabet' | 'passage' | 'word';
//   accuracy?: string;
//   feedback?: string;
//   isTextCorrect: boolean;
// }

// export const FeedbackResult: React.FC<ReadingFeedbackProps> = ({
//   targetText,
//   spokenText,
//   miscues,
//   onTryAgain,
//   type,
//   accuracy: passedAccuracy,
//   feedback: passedFeedback,
//   isTextCorrect,
// }) => {
//   if (type === 'alphabet') {
//     // FOR ALPHABET ANALYSIS
//     // Use passed accuracy/feedback or calculate if not provided
//     const alphabetAccuracy =
//       passedAccuracy ||
//       MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText)
//         .accuracy;
//     const alphabetFeedback =
//       passedFeedback ||
//       MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText)
//         .feedback;
//     const isCorrect = alphabetAccuracy == '100';
//     return (
//       <View>
//         <View
//           style={[
//             readingStyles.calculationContainer,
//             isCorrect
//               ? readingStyles.correctContainer
//               : readingStyles.incorrectContainer,
//           ]}
//         >
//           <Text style={readingStyles.calculationText}>
//             {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
//           </Text>
//         </View>

//         <Text style={readingStyles.feedbackLabel}>Result</Text>
//         <View style={readingStyles.feedbackContainer}>
//           <Text style={readingStyles.feedbackLabelText}>
//             Expected:{' '}
//             <Text style={readingStyles.boldText}>
//               {targetText.toUpperCase()}
//             </Text>
//           </Text>
//           <Text style={readingStyles.feedbackLabelText}>
//             You said:{' '}
//             <Text style={readingStyles.boldText}>
//               {spokenText || '(nothing detected)'}
//             </Text>
//           </Text>
//           <Text
//             style={[
//               readingStyles.feedbackLabelText,
//               isCorrect ? readingStyles.successText : readingStyles.errorText,
//             ]}
//           >
//             {alphabetFeedback}
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={readingStyles.tryAgainButton}
//           onPress={onTryAgain}
//         >
//           <Text style={readingStyles.tryAgainText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   } else if (type === 'word') {
//     return (
//       <View style={readingStyles.feedbackContainer}>
//         <View style={readingStyles.waFeedbackWordBox}>
//           {/* Message */}
//           <Text style={readingStyles.waFeedbackMessage}>
//             {isTextCorrect
//               ? 'You pronounced the it correctly!'
//               : 'Try again! Keep practicing.'}
//           </Text>
//         </View>

//         {/* Actions */}
//         <TouchableOpacity
//           style={readingStyles.tryAgainButton}
//           onPress={onTryAgain}
//         >
//           <Text style={readingStyles.tryAgainText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // FOR THE PASSAGE ANALYSIS
//   const accuracy = MiscueAnalysisService.calculateAccuracy(
//     targetText,
//     spokenText,
//   );
//   const feedback = MiscueAnalysisService.getAccuracyFeedback(accuracy);

//   const categorizedMiscues = {
//     substitution: miscues.filter(m => m.type === 'substitution'),
//     omission: miscues.filter(m => m.type === 'omission'),
//     insertion: miscues.filter(m => m.type === 'insertion'),
//     repetition: miscues.filter(m => m.type === 'repetition'),
//   };

//   return (
//     <View>
//       {/* <View style={readingStyles.calculationContainer}>
//         <Text style={readingStyles.calculationText}>
//           {feedback} - {accuracy}%
//         </Text>
//       </View> */}
//       <View style={readingStyles.feedbackContainer}>
//         <Image style={readingStyles.feedbackBookicon} source={require('../../../../assets/icons/Book-icon.png')} />
//         <View style={readingStyles.feedbackTitleWrapper}>
//           {/* <Text style={readingStyles.feedbackLabel}>Reading Result</Text> */}
//           <Svg height={50} width={350}>
//             <SvgText
//               x={215}                 // center X
//               y={35}                  // baseline Y
//               fontSize={20}
//               fontFamily="DynaPuff-Bold"
//               textAnchor="middle"     // center align
//               fill="none"          // inside color
//               stroke="#FFFFFF"        // outline color
//               strokeWidth={4}         // outline thickness
//               strokeLinejoin='round'
//             >
//               Reading Summary Result
//             </SvgText>
//             <SvgText
//               x={215}
//               y={35}
//               fontSize={20}
//               fontFamily="DynaPuff-Bold"
//               textAnchor="middle"
//               fill="#3B7FC9"
//             >
//               Reading Summary Result
//             </SvgText>
//           </Svg>
//         </View>
//         <View style={readingStyles.miscueRowsWrapper}>
//           {/* SUBSTITUTION */}
//           <Text style={[readingStyles.substitutionBgColor, readingStyles.miscueRow]}>
//             <Text style={readingStyles.feedbackLabelText}>
//               Substitution:{' '}
//             </Text>
//             <Text style={readingStyles.feedbackValueText}>
//               {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.substitution)}
//             </Text>
//           </Text>

//           {/* OMISSION */}
//           <Text style={[readingStyles.omissionBgColor, readingStyles.miscueRow]}>
//             <Text style={readingStyles.feedbackLabelText}>
//               Omission:{' '}
//             </Text>
//             <Text style={readingStyles.feedbackValueText}>
//               {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
//             </Text>
//           </Text>

//           {/* INSERTION */}
//           <Text style={[readingStyles.insertionBgColor, readingStyles.miscueRow]}>
//             <Text style={readingStyles.feedbackLabelText}>
//               Insertion:{' '}
//             </Text>
//             <Text style={readingStyles.feedbackValueText}>
//               {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.insertion)}
//             </Text>
//           </Text>

//           {/* REPETITION */}
//           <Text style={[readingStyles.repetitionBgColor, readingStyles.miscueRow]}>
//             <Text style={readingStyles.feedbackLabelText}>
//               Repetition:{' '}
//             </Text>
//             <Text style={readingStyles.feedbackValueText}>
//               {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.repetition)}
//             </Text>
//           </Text>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={readingStyles.tryAgainButton}
//         onPress={onTryAgain}
//       >
//         {/* <Text style={readingStyles.tryAgainText}>Try Again</Text> */}
//         <View style={readingStyles.tryAgainContent}>
//           <Image style={readingStyles.tryAgainIcon} source={require('../../../../assets/icons/Retry-icon.png')} />
//           <Svg height={35} width={200}>
//             <SvgText
//               x={100}                 // center X
//               y={26}                  // baseline Y
//               fontSize={30}
//               fontFamily="DynaPuff-Bold"
//               textAnchor="middle"     // center align
//               fill="none"          // inside color
//               stroke="#3B7FC9"        // outline color
//               strokeWidth={6}         // outline thickness
//               strokeLinejoin='round'
//             >
//               Try Again?
//             </SvgText>
//             <SvgText
//               x={100}
//               y={26}
//               fontSize={30}
//               fontFamily="DynaPuff-Bold"
//               textAnchor="middle"
//               fill="#D7E9FF"
//             >
//               Try Again?
//             </SvgText>
//           </Svg>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Miscue } from '../../../Interfaces/miscue';
import { MiscueAnalysisService } from '../../../Controller/MiscueAnalysisServiceController';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';
import Svg, { Text as SvgText } from 'react-native-svg';

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

  // ─────────────────────────────────────────────────────────
  // ALPHABET FEEDBACK — REDESIGNED
  // Colour-coded header band (green = correct, orange = not
  // quite), then two rows comparing expected vs spoken.
  // ─────────────────────────────────────────────────────────
  if (type === 'alphabet') {
    const alphabetAccuracy =
      passedAccuracy ||
      MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText)
        .accuracy;
    const alphabetFeedback =
      passedFeedback ||
      MiscueAnalysisService.checkAlphabetPhonemeAccuracy(targetText, spokenText)
        .feedback;
    const isCorrect = alphabetAccuracy === '100';

    return (
      <View>
        {/* Result card */}
        <View style={readingStyles.alphaResultCard}>
          {/* Header band */}
          <View style={[
            readingStyles.alphaResultHeader,
            isCorrect
              ? readingStyles.alphaResultHeaderCorrect
              : readingStyles.alphaResultHeaderIncorrect,
          ]}>
            <Text style={readingStyles.alphaResultHeaderIcon}>
              {isCorrect ? '✓' : '✗'}
            </Text>
            <Text style={readingStyles.alphaResultHeaderText}>
              {isCorrect ? 'You got it!' : 'Not quite…'}
            </Text>
          </View>

          {/* Comparison rows */}
          <View style={readingStyles.alphaResultBody}>
            {/* Expected */}
            <View style={readingStyles.alphaResultRow}>
              <Text style={readingStyles.alphaResultLabel}>Expected</Text>
              <Text style={readingStyles.alphaResultValue}>
                {targetText.toUpperCase()}
              </Text>
            </View>

            {/* You said */}
            <View style={readingStyles.alphaResultRow}>
              <Text style={readingStyles.alphaResultLabel}>You said</Text>
              {spokenText ? (
                <Text style={readingStyles.alphaResultValue}>{spokenText}</Text>
              ) : (
                <Text style={readingStyles.alphaResultValueMuted}>
                  (nothing detected)
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Try again button — consistent with the rest of the app */}
        <TouchableOpacity
          style={readingStyles.tryAgainButton}
          onPress={onTryAgain}
        >
          <View style={readingStyles.tryAgainContent}>
            <Image
              style={readingStyles.tryAgainIcon}
              source={require('../../../../assets/icons/Retry-icon.png')}
            />
            <Svg height={35} width={200}>
              <SvgText
                x={100}
                y={26}
                fontSize={30}
                fontFamily="DynaPuff-Bold"
                textAnchor="middle"
                fill="none"
                stroke="#3B7FC9"
                strokeWidth={6}
                strokeLinejoin='round'
              >
                Try Again?
              </SvgText>
              <SvgText
                x={100}
                y={26}
                fontSize={30}
                fontFamily="DynaPuff-Bold"
                textAnchor="middle"
                fill="#D7E9FF"
              >
                Try Again?
              </SvgText>
            </Svg>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────
  // WORD FEEDBACK — REDESIGNED
  // Single colour-coded result band — green when correct,
  // orange when not — with a clear emoji + message.
  // ─────────────────────────────────────────────────────────
  if (type === 'word') {
    return (
      <View>
        {/* Result card */}
        <View style={readingStyles.wordResultCard}>
          <View style={[
            readingStyles.wordResultContent,
            isTextCorrect
              ? readingStyles.wordResultCorrect
              : readingStyles.wordResultIncorrect,
          ]}>
            <Text style={readingStyles.wordResultIcon}>
              {isTextCorrect ? '✓' : '✗'}
            </Text>
            <Text style={readingStyles.wordResultText}>
              {isTextCorrect
                ? 'You pronounced it correctly!'
                : 'Keep practicing — you can do it!'}
            </Text>
          </View>
        </View>

        {/* Try again button */}
        <TouchableOpacity
          style={readingStyles.tryAgainButton}
          onPress={onTryAgain}
        >
          <View style={readingStyles.tryAgainContent}>
            <Image
              style={readingStyles.tryAgainIcon}
              source={require('../../../../assets/icons/Retry-icon.png')}
            />
            <Svg height={35} width={200}>
              <SvgText
                x={100}
                y={26}
                fontSize={30}
                fontFamily="DynaPuff-Bold"
                textAnchor="middle"
                fill="none"
                stroke="#3B7FC9"
                strokeWidth={6}
                strokeLinejoin='round'
              >
                Try Again?
              </SvgText>
              <SvgText
                x={100}
                y={26}
                fontSize={30}
                fontFamily="DynaPuff-Bold"
                textAnchor="middle"
                fill="#D7E9FF"
              >
                Try Again?
              </SvgText>
            </Svg>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PASSAGE FEEDBACK — UNCHANGED
  // ─────────────────────────────────────────────────────────
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
      <View style={readingStyles.feedbackContainer}>
        <Image style={readingStyles.feedbackBookicon} source={require('../../../../assets/icons/Book-icon.png')} />
        <View style={readingStyles.feedbackTitleWrapper}>
          <Svg height={50} width={350}>
            <SvgText
              x={215}
              y={35}
              fontSize={20}
              fontFamily="DynaPuff-Bold"
              textAnchor="middle"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={4}
              strokeLinejoin='round'
            >
              Reading Summary Result
            </SvgText>
            <SvgText
              x={215}
              y={35}
              fontSize={20}
              fontFamily="DynaPuff-Bold"
              textAnchor="middle"
              fill="#3B7FC9"
            >
              Reading Summary Result
            </SvgText>
          </Svg>
        </View>
        <View style={readingStyles.miscueRowsWrapper}>
          {/* SUBSTITUTION */}
          <Text style={[readingStyles.substitutionBgColor, readingStyles.miscueRow]}>
            <Text style={readingStyles.feedbackLabelText}>Substitution: </Text>
            <Text style={readingStyles.feedbackValueText}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.substitution)}
            </Text>
          </Text>

          {/* OMISSION */}
          <Text style={[readingStyles.omissionBgColor, readingStyles.miscueRow]}>
            <Text style={readingStyles.feedbackLabelText}>Omission: </Text>
            <Text style={readingStyles.feedbackValueText}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
            </Text>
          </Text>

          {/* INSERTION */}
          <Text style={[readingStyles.insertionBgColor, readingStyles.miscueRow]}>
            <Text style={readingStyles.feedbackLabelText}>Insertion: </Text>
            <Text style={readingStyles.feedbackValueText}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.insertion)}
            </Text>
          </Text>

          {/* REPETITION */}
          <Text style={[readingStyles.repetitionBgColor, readingStyles.miscueRow]}>
            <Text style={readingStyles.feedbackLabelText}>Repetition: </Text>
            <Text style={readingStyles.feedbackValueText}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.repetition)}
            </Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={readingStyles.tryAgainButton}
        onPress={onTryAgain}
      >
        <View style={readingStyles.tryAgainContent}>
          <Image style={readingStyles.tryAgainIcon} source={require('../../../../assets/icons/Retry-icon.png')} />
          <Svg height={35} width={200}>
            <SvgText
              x={100}
              y={26}
              fontSize={30}
              fontFamily="DynaPuff-Bold"
              textAnchor="middle"
              fill="none"
              stroke="#3B7FC9"
              strokeWidth={6}
              strokeLinejoin='round'
            >
              Try Again?
            </SvgText>
            <SvgText
              x={100}
              y={26}
              fontSize={30}
              fontFamily="DynaPuff-Bold"
              textAnchor="middle"
              fill="#D7E9FF"
            >
              Try Again?
            </SvgText>
          </Svg>
        </View>
      </TouchableOpacity>
    </View>
  );
};