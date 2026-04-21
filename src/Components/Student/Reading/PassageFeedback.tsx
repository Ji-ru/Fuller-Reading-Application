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
  onNextItem?: () => void;
  hasNextItem?: boolean;
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
  onNextItem,
  hasNextItem,
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
    const isCorrect = alphabetAccuracy === '100';

    return (
      <View>
        <View style={readingStyles.feedbackContainer}>
          <Image style={readingStyles.feedbackBookicon} source={require('../../../../assets/icons/Book-icon.png')} />
          <View style={readingStyles.feedbackTitleWrapper}>
            <Svg height={50} width={350}>
              <SvgText
                x={215}
                y={35}
                fontSize={isCorrect ? 32 : 21}
                fontFamily="Nunito-Black"
                textAnchor="middle"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={4}
                strokeLinejoin='round'
              >
                {isCorrect ? 'Good Job!' : 'Keep it up. You can do it.'}
              </SvgText>
              <SvgText
                x={215}
                y={35}
                fontSize={isCorrect ? 32 : 21}
                fontFamily="Nunito-Black"
                textAnchor="middle"
                fill={isCorrect ? '#3B7FC9' : '#F08C3A'}
              >
                {isCorrect ? 'Good Job!' : 'Keep it up. You can do it.'}
              </SvgText>
            </Svg>
          </View>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={[isCorrect ? readingStyles.plainLetterCorrect : readingStyles.plainLetterIncorrect, { fontFamily: 'Nunito-Bold' }]}>
              {targetText.toUpperCase()}
            </Text>
            <Text style={[readingStyles.plainResultLabel, isCorrect ? readingStyles.plainResultCorrect : readingStyles.plainResultIncorrect, { fontFamily: 'Nunito-Bold', marginTop: 10 }]}>
              {isCorrect ? 'Correct' : 'Incorrect Reading'}
            </Text>
          </View>
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

        {hasNextItem && onNextItem ? (
          <TouchableOpacity
            style={[readingStyles.tryAgainButton, { marginTop: 10, backgroundColor: '#4DC97A', borderColor: '#34A05B' }]}
            onPress={onNextItem}
          >
            <View style={readingStyles.tryAgainContent}>
              <Text style={{ fontSize: 26, fontFamily: 'DynaPuff-Bold', color: '#FFFFFF' }}>Skip to Next</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[readingStyles.tryAgainButton, { marginTop: 10, backgroundColor: '#F08C3A', borderColor: '#D17529' }]}
            onPress={onNextItem}
          >
            <View style={readingStyles.tryAgainContent}>
              <Text style={{ fontSize: 26, fontFamily: 'DynaPuff-Bold', color: '#FFFFFF' }}>Return to Menu</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (type === 'word') {
    return (
      <View>
        <View style={readingStyles.feedbackContainer}>
          <Image style={readingStyles.feedbackBookicon} source={require('../../../../assets/icons/Book-icon.png')} />
          <View style={readingStyles.feedbackTitleWrapper}>
            <Svg height={50} width={350}>
              <SvgText
                x={215}
                y={35}
                fontSize={isTextCorrect ? 32 : 21}
                fontFamily="Nunito-Black"
                textAnchor="middle"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={4}
                strokeLinejoin='round'
              >
                {isTextCorrect ? 'Good Job!' : 'Keep it up. You can do it.'}
              </SvgText>
              <SvgText
                x={215}
                y={35}
                fontSize={isTextCorrect ? 32 : 21}
                fontFamily="Nunito-Black"
                textAnchor="middle"
                fill={isTextCorrect ? '#3B7FC9' : '#F08C3A'}
              >
                {isTextCorrect ? 'Good Job!' : 'Keep it up. You can do it.'}
              </SvgText>
            </Svg>
          </View>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={[isTextCorrect ? readingStyles.plainLetterCorrect : readingStyles.plainLetterIncorrect, readingStyles.plainWordSize, { fontFamily: 'Nunito-Bold' }]}>
              {targetText}
            </Text>
            <Text style={[readingStyles.plainResultLabel, isTextCorrect ? readingStyles.plainResultCorrect : readingStyles.plainResultIncorrect, { fontFamily: 'Nunito-Bold', marginTop: 10 }]}>
              {isTextCorrect ? 'Correct' : 'Incorrect Reading'}
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

        {hasNextItem && onNextItem ? (
          <TouchableOpacity
            style={[readingStyles.tryAgainButton, { marginTop: 10, backgroundColor: '#4DC97A', borderColor: '#34A05B' }]}
            onPress={onNextItem}
          >
            <View style={readingStyles.tryAgainContent}>
              <Text style={{ fontSize: 26, fontFamily: 'DynaPuff-Bold', color: '#FFFFFF' }}>Skip to Next</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[readingStyles.tryAgainButton, { marginTop: 10, backgroundColor: '#F08C3A', borderColor: '#D17529' }]}
            onPress={onNextItem}
          >
            <View style={readingStyles.tryAgainContent}>
              <Text style={{ fontSize: 26, fontFamily: 'DynaPuff-Bold', color: '#FFFFFF' }}>Return to Menu</Text>
            </View>
          </TouchableOpacity>
        )}
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
            <Text style={[readingStyles.feedbackLabelText, { fontFamily: 'DynaPuff-Bold' }]}>Substitution: </Text>
            <Text style={[readingStyles.feedbackValueText, { fontFamily: 'Comfortaa-Regular' }]}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.substitution)}
            </Text>
          </Text>

          {/* OMISSION */}
          <Text style={[readingStyles.omissionBgColor, readingStyles.miscueRow]}>
            <Text style={[readingStyles.feedbackLabelText, { fontFamily: 'DynaPuff-Bold' }]}>Omission: </Text>
            <Text style={[readingStyles.feedbackValueText, { fontFamily: 'Comfortaa-Regular' }]}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.omission)}
            </Text>
          </Text>

          {/* INSERTION */}
          <Text style={[readingStyles.insertionBgColor, readingStyles.miscueRow]}>
            <Text style={[readingStyles.feedbackLabelText, { fontFamily: 'DynaPuff-Bold' }]}>Insertion: </Text>
            <Text style={[readingStyles.feedbackValueText, { fontFamily: 'Comfortaa-Regular' }]}>
              {MiscueAnalysisService.formatMiscueWords(categorizedMiscues.insertion)}
            </Text>
          </Text>

          {/* REPETITION */}
          <Text style={[readingStyles.repetitionBgColor, readingStyles.miscueRow]}>
            <Text style={[readingStyles.feedbackLabelText, { fontFamily: 'DynaPuff-Bold' }]}>Repetition: </Text>
            <Text style={[readingStyles.feedbackValueText, { fontFamily: 'Comfortaa-Regular' }]}>
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

      {hasNextItem && onNextItem ? (
        <TouchableOpacity
          style={[readingStyles.tryAgainButton, { marginTop: 10, backgroundColor: '#4DC97A', borderColor: '#34A05B' }]}
          onPress={onNextItem}
        >
          <View style={readingStyles.tryAgainContent}>
            <Text style={{ fontSize: 26, fontFamily: 'DynaPuff-Bold', color: '#FFFFFF' }}>Skip to Next</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[readingStyles.tryAgainButton, { marginTop: 10, backgroundColor: '#F08C3A', borderColor: '#D17529' }]}
          onPress={onNextItem}
        >
          <View style={readingStyles.tryAgainContent}>
            <Text style={{ fontSize: 26, fontFamily: 'DynaPuff-Bold', color: '#FFFFFF' }}>Return to Menu</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};