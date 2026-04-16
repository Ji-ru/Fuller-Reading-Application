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
  // Inside FeedbackResult component, replace the alphabet feedback block with this:

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
      <View style={{ width: '100%', alignItems: 'center' }}>
        <View style={[
          readingStyles.newAlphaCard,
          isCorrect ? readingStyles.newAlphaCardCorrect : readingStyles.newAlphaCardIncorrect
        ]}>
          <View style={readingStyles.newAlphaHeader}>
            <Text style={readingStyles.newAlphaHeaderEmoji}>{isCorrect ? '🌟' : '💡'}</Text>
            <Text style={[
              readingStyles.newAlphaHeaderText,
              isCorrect ? readingStyles.newAlphaTextCorrect : readingStyles.newAlphaTextIncorrect
            ]}>
              {isCorrect ? 'Perfectly Pronounced!' : 'Keep Practicing!'}
            </Text>
          </View>

          <View style={readingStyles.newAlphaComparisonContainer}>
            <View style={readingStyles.newAlphaTargetBox}>
              <Text style={readingStyles.newAlphaLabel}>Letter</Text>
              <Text style={readingStyles.newAlphaTargetLetter}>{targetText.toUpperCase()}</Text>
            </View>

            <View style={readingStyles.newAlphaDivider}>
               <Text style={readingStyles.newAlphaDividerIcon}>{isCorrect ? '✓' : '✗'}</Text>
            </View>

            <View style={[
              readingStyles.newAlphaSpokenBox,
              isCorrect ? readingStyles.newAlphaSpokenCorrect : readingStyles.newAlphaSpokenIncorrect
            ]}>
              <Text style={readingStyles.newAlphaLabel}>You Said</Text>
              <Text style={[
                readingStyles.newAlphaSpokenLetter,
                isCorrect ? readingStyles.newAlphaSpokenLetterCorrect : readingStyles.newAlphaSpokenLetterIncorrect
              ]}>{spokenText ? spokenText.toUpperCase() : '—'}</Text>
            </View>
          </View>

          {alphabetFeedback && (
            <View style={readingStyles.newAlphaFeedbackBox}>
              <Text style={readingStyles.newAlphaFeedbackText}>{alphabetFeedback}</Text>
            </View>
          )}
        </View>

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
  // Now includes target vs spoken word comparison.
  // ─────────────────────────────────────────────────────────
  if (type === 'word') {
    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        <View style={[
          readingStyles.newAlphaCard,
          isTextCorrect ? readingStyles.newAlphaCardCorrect : readingStyles.newAlphaCardIncorrect
        ]}>
          <View style={readingStyles.newAlphaHeader}>
            <Text style={readingStyles.newAlphaHeaderEmoji}>{isTextCorrect ? '🌟' : '💡'}</Text>
            <Text style={[
              readingStyles.newAlphaHeaderText,
              isTextCorrect ? readingStyles.newAlphaTextCorrect : readingStyles.newAlphaTextIncorrect
            ]}>
              {isTextCorrect
                ? 'Perfectly Pronounced!'
                : 'Keep Practicing!'}
            </Text>
          </View>

          <View style={readingStyles.newAlphaComparisonContainer}>
            <View style={readingStyles.newAlphaTargetBox}>
              <Text style={readingStyles.newAlphaLabel}>Word</Text>
              <Text style={[readingStyles.newAlphaTargetLetter, { fontSize: 28, lineHeight: 36 }]}>{targetText}</Text>
            </View>

            <View style={readingStyles.newAlphaDivider}>
               <Text style={readingStyles.newAlphaDividerIcon}>{isTextCorrect ? '✓' : '✗'}</Text>
            </View>

            <View style={[
              readingStyles.newAlphaSpokenBox,
              isTextCorrect ? readingStyles.newAlphaSpokenCorrect : readingStyles.newAlphaSpokenIncorrect
            ]}>
              <Text style={readingStyles.newAlphaLabel}>You Said</Text>
              <Text style={[
                readingStyles.newAlphaSpokenLetter,
                isTextCorrect ? readingStyles.newAlphaSpokenLetterCorrect : readingStyles.newAlphaSpokenLetterIncorrect,
                { fontSize: 28, lineHeight: 36 }
              ]}>{spokenText ? spokenText : '—'}</Text>
            </View>
          </View>

          {passedFeedback && (
            <View style={readingStyles.newAlphaFeedbackBox}>
              <Text style={readingStyles.newAlphaFeedbackText}>{passedFeedback}</Text>
            </View>
          )}
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