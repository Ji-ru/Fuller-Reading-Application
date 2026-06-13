import React, { JSX, useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, Animated, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Rect,
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';
import {
  Passage,
  Alphabet,
  Word,
  isPassage,
  // isAlphabet,
  isWords,
} from '../../../Interfaces/passage';
import { Miscue } from '../../../Interfaces/miscue';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';
import { getPassageImage } from '../../../Utilities/ReadingAssets';
import { StarRatingDisplay } from './StarRatingDisplay';
import { FeedbackResult } from './PassageFeedback';

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  letterFill: '#84D6F2',
  letterDark: '#4DB8DF',
  letterStroke: '#2ca96a',
  letterShade: '#5EC5E5',
  letterHilit: '#B8EDFB',
  eyeBase: '#57b8b3',
  eyeBaseDark: '#2C6975',
  eyeWhite: '#FFFFFF',
  iris: '#008443',
  pupil: '#005028',
  shine: '#FFFFFF',
  arm: '#57b8b3',
  armStroke: '#2C6975',
  leg: '#57b8b3',
  legStroke: '#2C6975',
  shoe: '#008443',
  shoeStroke: '#006a35',
  shoeHilit: '#2ca96a',
  blush: '#FFB3B3',
  shadow: 'rgba(0,0,0,0.10)',
};

// ─── Canvas constants ──────────────────────────────────────────────────────────
const W = 280;
const H = 300;
const CX = W / 2;

const LETTER_SIZE = 210;
const LETTER_X = CX;
const LETTER_Y = 248;

const DOTS: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 88, cy: 175, r: 17 },
  { cx: 155, cy: 195, r: 13 },
  { cx: 120, cy: 215, r: 10 },
  { cx: 75, cy: 220, r: 9 },
  { cx: 170, cy: 160, r: 8 },
  { cx: 100, cy: 240, r: 7 },
  { cx: 155, cy: 240, r: 6 },
];

// ─── Alphabet sizes ────────────────────────────────────────────────────────────
// const ALPHA_CARD_WIDTH = 300;
// const ALPHA_CARD_HEIGHT = 280;
// const ALPHA_FONT = 160; // same size for both glyphs — baseline stays level
//
// const alphabetCardStyle = StyleSheet.create({
//   card: {
//     width: ALPHA_CARD_WIDTH,
//     height: ALPHA_CARD_HEIGHT,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 28,
//     borderWidth: 4,
//     borderColor: '#008443',
//     justifyContent: 'center',
//     alignItems: 'center',
//     // shadow
//     elevation: 8,
//     shadowColor: '#008443',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.20,
//     shadowRadius: 10,
//     marginTop: 30,
//     marginBottom: 24,
//     alignSelf: 'center',
//   },
//   letterRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline', // keeps both glyphs on the same text baseline
//     justifyContent: 'center',
//     gap: 8,
//   },
//   upper: {
//     fontSize: ALPHA_FONT,
//     fontFamily: 'Andika-Bold',
//     color: '#008443',
//   },
//   separator: {
//     fontSize: ALPHA_FONT,
//     fontFamily: 'Andika-Bold',
//     color: '#C8E6C9',
//   },
//   lower: {
//     fontSize: ALPHA_FONT,
//     fontFamily: 'Andika-Bold',
//     color: '#2ca96a',
//   },
// });
//
// interface AlphabetCharacterProps {
//   letter: string;
// }
//
// const AlphabetCharacter: React.FC<AlphabetCharacterProps> = ({ letter }) => {
//   return (
//     <View style={alphabetCardStyle.card}>
//       <View style={alphabetCardStyle.letterRow}>
//         <Text style={alphabetCardStyle.upper} allowFontScaling={false}>
//           {letter.toUpperCase()}
//         </Text>
//         <Text style={alphabetCardStyle.separator} allowFontScaling={false}>
//           {''}
//         </Text>
//         <Text style={alphabetCardStyle.lower} allowFontScaling={false}>
//           {letter.toLowerCase()}
//         </Text>
//       </View>
//     </View>
//   );
// };


interface WordCharacterProps {
  word: string;
}

export const WordCharacter: React.FC<WordCharacterProps> = ({ word }) => {
  return (
    <View style={[readingStyles.wordContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          fontSize: 160,
          fontFamily: 'Andika-Regular',
          color: '#008443',
          textAlign: 'center',
          width: '100%'
        }}
      >
        {word}
      </Text>
    </View>
  );
};

// ─── Passage helpers ──────────────────────────────────────────────────────────

type PassagePerformanceType = 'passageSuccess' | 'goodJob' | 'tryAgain';

interface PassageGreetingContent {
  type: PassagePerformanceType;
  title: string;
  message: string;
}

export const getPassageGreetingContent = (
  accuracy: number,
): PassageGreetingContent => {
  if (accuracy >= 90) {
    return { type: 'passageSuccess', title: 'Excellent Reading!', message: 'Amazing!' };
  }
  if (accuracy >= 50) {
    return { type: 'goodJob', title: 'Good Job!', message: 'Keep it up!' };
  }
  return { type: 'tryAgain', title: "Try Again!", message: 'Oops! Try again!' };
};

// ─── WordProgressDots ────────────────────────────────────────────────────────

const MAX_VISIBLE_DOTS = 10;

const WordProgressDots: React.FC<{ total: number; current: number }> = ({
  total,
  current,
}) => {
  if (total <= 1) return null;

  if (total > MAX_VISIBLE_DOTS) {
    return (
      <View style={dotStyles.counterWrap}>
        <Text style={dotStyles.counterText}>
          {current + 1} / {total}
        </Text>
      </View>
    );
  }

  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <View
              style={[
                dotStyles.dot,
                isDone && dotStyles.dotDone,
                isActive && dotStyles.dotActive,
              ]}
            />
            {i < total - 1 && (
              <View style={[dotStyles.line, isDone && dotStyles.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#c0e8f2',
    borderWidth: 2.5,
    borderColor: '#008443',
  },
  dotDone: {
    backgroundColor: '#008443',
    borderColor: '#006a35',
  },
  dotActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#008443',
    borderColor: '#008443',
    shadowColor: '#008443',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  line: {
    height: 3,
    width: 16,
    backgroundColor: '#c0e8f2',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  lineDone: {
    backgroundColor: '#008443',
  },
  counterWrap: {
    marginTop: 14,
    marginBottom: 4,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 132, 67, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: '#008443',
  },
  counterText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#008443',
    letterSpacing: 0.5,
  },
});

// ─── PassageDisplay ───────────────────────────────────────────────────────────

interface PassageDisplayProps {
  material: Passage | Alphabet | Word;
  type: 'alphabet' | 'passage' | 'word';
  spokenText: string;
  isRecording: boolean;
  recordTime?: string;        // forwarded from RecordingControls / parent
  accuracy?: number;
  accuracyString?: string;
  miscues?: Miscue[];
  isReadingCompleted: boolean;
  // ── Result card props (alphabet / word only) ─────────────────────────────
  isTextCorrect?: boolean;
  feedback?: string;
  onTryAgain?: () => void;
  onNextItem?: () => void;
  hasNextItem?: boolean;
  // ── Word progress indicator ──────────────────────────────────────────────
  currentWordIndex?: number;   // 0-based index of the current word in the lesson
  lessonWordCount?: number;    // total number of words in the current lesson
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  material,
  type,
  spokenText,
  isRecording,
  recordTime = '0:00',
  miscues = [],
  accuracy = 0,
  accuracyString = '0',
  isReadingCompleted = false,
  isTextCorrect = false,
  feedback = '',
  onTryAgain,
  onNextItem,
  hasNextItem,
  currentWordIndex = 0,
  lessonWordCount = 1,
}) => {

  const formatText = (text: string) => text.split('\n').map((line, index) => (
    <Text key={index} style={[readingStyles.textLine]}>{line}</Text>
  ));

  const extractPunctuation = (word: string): { word: string; punctuation: string } => {
    const match = word.match(/^([a-zA-Z0-9]+)([.,!?;:'"“”'"]+)?$/);
    if (match) return { word: match[1] || word, punctuation: match[2] || '' };
    return { word, punctuation: '' };
  };

  const passageGreeting =
    type === 'passage' && isReadingCompleted
      ? getPassageGreetingContent(accuracy)
      : null;

  const renderTextWithMiscues = () => {
    if (!isPassage(material)) return null;
    const originalWords = material.text.split(/\s+/).filter(w => w.length > 0);
    const miscuesByPosition = new Map<number, { substitution?: Miscue; omission?: Miscue; insertions: Miscue[]; repetition?: Miscue }>();

    miscues.forEach(miscue => {
      if (!miscuesByPosition.has(miscue.position)) {
        miscuesByPosition.set(miscue.position, { insertions: [] });
      }
      const posData = miscuesByPosition.get(miscue.position)!;
      switch (miscue.type) {
        case 'substitution': posData.substitution = miscue; break;
        case 'omission': posData.omission = miscue; break;
        case 'insertion': posData.insertions.push(miscue); break;
        case 'repetition': posData.repetition = miscue; break;
      }
    });

    const renderedWords: JSX.Element[] = [];
    let keyCounter = 0;
    const passageBaseFont = 'Andika-Bold';
    const passageEmphasisFont = 'Andika-Bold';
    const baseFont = type === 'passage' ? passageBaseFont : passageBaseFont;
    const errorFont = type === 'passage' ? passageEmphasisFont : passageBaseFont;

    originalWords.forEach((originalWord, index) => {
      const { word: cleanWord, punctuation } = extractPunctuation(originalWord);
      const posData = miscuesByPosition.get(index);

      if (posData?.insertions?.length) {
        posData.insertions.forEach(ins => {
          renderedWords.push(<Text key={`ins-${keyCounter++}`}><Text style={{ color: '#2ca96a', fontFamily: errorFont, fontWeight: 'bold' }}>{ins.spoken}</Text></Text>);
          renderedWords.push(<Text key={`spi-${keyCounter++}`}> </Text>);
        });
      }

      if (posData?.repetition) {
        renderedWords.push(<Text key={`w-${index}`}><Text style={{ color: '#BF00DD', fontFamily: errorFont, fontWeight: 'bold' }}>{posData.repetition.spoken}</Text>{punctuation && <Text style={{ fontFamily: errorFont }}>{punctuation}</Text>}</Text>);
      } else if (posData?.substitution) {
        renderedWords.push(<Text key={`w-${index}`}><Text style={{ color: '#FF2726', fontFamily: errorFont, fontWeight: 'bold' }}>{posData.substitution.spoken}</Text>{punctuation && <Text style={{ fontFamily: errorFont }}>{punctuation}</Text>}</Text>);
      } else if (posData?.omission) {
        renderedWords.push(<Text key={`w-${index}`}><Text style={{ color: '#FF941A', fontFamily: errorFont, fontWeight: 'bold' }}>{cleanWord}</Text>{punctuation && <Text style={{ fontFamily: errorFont }}>{punctuation}</Text>}</Text>);
      } else {
        renderedWords.push(<Text key={`w-${index}`} style={{ fontFamily: baseFont }}>{originalWord}</Text>);
      }

      if (index < originalWords.length - 1) {
        renderedWords.push(<Text key={`sp-${keyCounter++}`}> </Text>);
      }
    });

    return <Text style={[readingStyles.textLine, { fontFamily: baseFont }]}>{renderedWords}</Text>;
  };

  const renderTextContent = () => {
    if (isPassage(material)) {
      if (!isRecording && miscues && miscues.length > 0) return renderTextWithMiscues();
      return formatText(material.text);
    }
    return null;
  };

  // ── ALPHABET ────────────────────────────────────────────────────────────────
  // if (isAlphabet(material)) {
  //   // After recording: swap the character illustration for the result card
  //   if (!isRecording && isReadingCompleted) {
  //     return (
  //       <View style={readingStyles.scene}>
  //         <StarRatingDisplay accuracy={accuracy} visible={isReadingCompleted} />
  //         <FeedbackResult
  //           targetText={material.letter}
  //           spokenText={spokenText}
  //           miscues={miscues}
  //           onTryAgain={onTryAgain ?? (() => { })}
  //           onNextItem={onNextItem}
  //           hasNextItem={hasNextItem}
  //           type="alphabet"
  //           accuracy={accuracyString}
  //           feedback={feedback}
  //           isTextCorrect={isTextCorrect}
  //         />
  //       </View>
  //     );
  //   }
  //   return (
  //     <View style={readingStyles.scene}>
  //       <AlphabetCharacter letter={material.letter} />
  //     </View>
  //   );
  // }

  // ── WORD DISPLAY ──────────────────────────────────────────────────────
  if (type === 'word' && isWords(material)) {
    const allWords = material.contrasts.flatMap(c => c.words);
    const word = allWords[0];

    // Split the word into individual letters for the letter-tile treatment
    const letters = word.split('');

    // After recording: replace the word card with the result card
    if (!isRecording && isReadingCompleted) {
      return (
        <View style={readingStyles.wordSceneWrapper}>
          <View style={readingStyles.bubbleTopLeft} pointerEvents="none" />
          <View style={readingStyles.bubbleTopRight} pointerEvents="none" />
          <View style={readingStyles.bubbleBottomRight} pointerEvents="none" />
          <StarRatingDisplay accuracy={accuracy} visible={isReadingCompleted} />
          <FeedbackResult
            targetText={word}
            spokenText={spokenText}
            miscues={miscues}
            onTryAgain={onTryAgain ?? (() => { })}
            onNextItem={onNextItem}
            hasNextItem={hasNextItem}
            type="word"
            accuracy={accuracyString}
            feedback={feedback}
            isTextCorrect={isTextCorrect}
          />
        </View>
      );
    }

    return (
      <View style={[readingStyles.wordSceneWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        {/* Decorative floating bubbles behind the card */}
        <View style={readingStyles.bubbleTopLeft} pointerEvents="none" />
        <View style={readingStyles.bubbleTopRight} pointerEvents="none" />
        <View style={readingStyles.bubbleBottomRight} pointerEvents="none" />

        <WordCharacter word={word} />

        {/* ── Word Progress Dots ─────────────────────────────────────────── */}
        {/* Renders below the word card; fills left-to-right as navigation advances */}
        <WordProgressDots current={currentWordIndex} total={lessonWordCount} />
      </View>
    );
  }

  // ── PASSAGE DISPLAY ────────────────────────────────────────────────────
  return (
    <View style={readingStyles.insideContainer}>
      {!isRecording && isReadingCompleted && (
        <StarRatingDisplay accuracy={accuracy} visible={isReadingCompleted} />
      )}
      {!isRecording && isReadingCompleted && passageGreeting && (
        <Svg height={35} width={350}>
          <SvgText x={180} y={25} fontSize={30} fontFamily="Nunito-Black" textAnchor="middle" fill="none" stroke="#c0e8f2" strokeWidth={6} strokeLinejoin="round">{passageGreeting.title}</SvgText>
          <SvgText x={180} y={25} fontSize={30} fontFamily="Nunito-Black" textAnchor="middle" fill="#008443">{passageGreeting.title}</SvgText>
        </Svg>
      )}

      {!isReadingCompleted && isPassage(material) && material.image ? (
        <Image style={readingStyles.readingImage} source={getPassageImage(material.image)} />
      ) : null}

      <View style={!isRecording ? readingStyles.passageContainer : readingStyles.passageContainerFeedback}>
        <View style={readingStyles.passageTextWrapper}>{renderTextContent()}</View>
      </View>
    </View>
  );
};