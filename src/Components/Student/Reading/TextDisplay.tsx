import React, { JSX, useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, Animated } from 'react-native';
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
  isAlphabet,
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
  letterStroke: '#38B6FF',
  letterShade: '#5EC5E5',
  letterHilit: '#B8EDFB',
  eyeBase: '#57b8b3',
  eyeBaseDark: '#2C6975',
  eyeWhite: '#FFFFFF',
  iris: '#1A3F6F',
  pupil: '#0D1B2A',
  shine: '#FFFFFF',
  arm: '#57b8b3',
  armStroke: '#2C6975',
  leg: '#57b8b3',
  legStroke: '#2C6975',
  shoe: '#3B7FC9',
  shoeStroke: '#2455A4',
  shoeHilit: '#7FB3E8',
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

// ─── AlphabetCharacter ────────────────────────────────────────────────────────
interface AlphabetCharacterProps {
  letter: string;
}

const AlphabetCharacter: React.FC<AlphabetCharacterProps> = ({ letter }) => {
  const lower = letter.toLowerCase();
  const upper = letter.toUpperCase();

  const EYE_Y = 78;
  const EYE_L_X = 114;
  const EYE_R_X = 158;
  const EYE_BUMP_R = 22;
  const EYE_WHITE_R = 18;
  const IRIS_R = 10;
  const PUPIL_R = 5.5;

  return (
    <View style={readingStyles.wordContainer}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="letterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={P.letterHilit} />
            <Stop offset="0.5" stopColor={P.letterFill} />
            <Stop offset="1" stopColor={P.letterDark} />
          </LinearGradient>
          <LinearGradient id="shoeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={P.shoeHilit} />
            <Stop offset="1" stopColor={P.shoe} />
          </LinearGradient>
          <LinearGradient id="eyeBumpGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#7ACECB" />
            <Stop offset="1" stopColor={P.eyeBaseDark} />
          </LinearGradient>
        </Defs>

        <Ellipse cx={CX} cy={H - 14} rx={72} ry={14} fill={P.shadow} />

        <Rect x={94} y={242} width={26} height={34} rx={11} fill={P.leg} stroke={P.legStroke} strokeWidth={2.5} />
        <Rect x={158} y={242} width={26} height={34} rx={11} fill={P.leg} stroke={P.legStroke} strokeWidth={2.5} />

        <Ellipse cx={102} cy={278} rx={26} ry={12} fill="url(#shoeGrad)" stroke={P.shoeStroke} strokeWidth={2} />
        <Ellipse cx={95} cy={274} rx={8} ry={3.5} fill="#FFFFFF" opacity={0.3} />

        <Ellipse cx={172} cy={278} rx={26} ry={12} fill="url(#shoeGrad)" stroke={P.shoeStroke} strokeWidth={2} />
        <Ellipse cx={165} cy={274} rx={8} ry={3.5} fill="#FFFFFF" opacity={0.3} />

        <Ellipse cx={42} cy={168} rx={26} ry={13} fill={P.arm} stroke={P.armStroke} strokeWidth={2.5} transform="rotate(25 42 168)" />
        <Circle cx={22} cy={181} r={13} fill={P.arm} stroke={P.armStroke} strokeWidth={2.5} />
        <Circle cx={17} cy={178} r={2.5} fill={P.armStroke} opacity={0.35} />
        <Circle cx={23} cy={176} r={2.5} fill={P.armStroke} opacity={0.35} />

        <Ellipse cx={238} cy={168} rx={26} ry={13} fill={P.arm} stroke={P.armStroke} strokeWidth={2.5} transform="rotate(-25 238 168)" />
        <Circle cx={258} cy={181} r={13} fill={P.arm} stroke={P.armStroke} strokeWidth={2.5} />
        <Circle cx={253} cy={178} r={2.5} fill={P.armStroke} opacity={0.35} />
        <Circle cx={259} cy={176} r={2.5} fill={P.armStroke} opacity={0.35} />

        <SvgText x={LETTER_X} y={LETTER_Y} fontSize={LETTER_SIZE} fontFamily="DynaPuff-Bold" textAnchor="middle" fill="none" stroke="#3d71d9" strokeWidth={20} strokeLinejoin="round" strokeLinecap="round">
          {lower}
        </SvgText>

        <SvgText x={LETTER_X} y={LETTER_Y} fontSize={LETTER_SIZE} fontFamily="DynaPuff-Bold" textAnchor="middle" fill="url(#letterGrad)" stroke={P.letterStroke} strokeWidth={5} strokeLinejoin="round">
          {lower}
        </SvgText>

        {DOTS.map((dot, i) => (
          <Circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={P.letterDark} opacity={0.45} />
        ))}

        {/* Eye bumps */}
        <Circle cx={EYE_L_X} cy={EYE_Y} r={EYE_BUMP_R} fill="url(#eyeBumpGrad)" />
        <Circle cx={EYE_R_X} cy={EYE_Y} r={EYE_BUMP_R} fill="url(#eyeBumpGrad)" />

        {/* Left eye */}
        <Circle cx={EYE_L_X} cy={EYE_Y} r={EYE_WHITE_R} fill={P.eyeWhite} />
        <Circle cx={EYE_L_X + 2} cy={EYE_Y + 2} r={IRIS_R} fill={P.iris} />
        <Circle cx={EYE_L_X + 2} cy={EYE_Y + 2} r={PUPIL_R} fill={P.pupil} />
        <Circle cx={EYE_L_X + 5} cy={EYE_Y - 2} r={3.5} fill={P.shine} />
        <Circle cx={EYE_L_X - 1} cy={EYE_Y + 5} r={1.5} fill={P.shine} opacity={0.6} />

        {/* Right eye */}
        <Circle cx={EYE_R_X} cy={EYE_Y} r={EYE_WHITE_R} fill={P.eyeWhite} />
        <Circle cx={EYE_R_X + 2} cy={EYE_Y + 2} r={IRIS_R} fill={P.iris} />
        <Circle cx={EYE_R_X + 2} cy={EYE_Y + 2} r={PUPIL_R} fill={P.pupil} />
        <Circle cx={EYE_R_X + 5} cy={EYE_Y - 2} r={3.5} fill={P.shine} />
        <Circle cx={EYE_R_X - 1} cy={EYE_Y + 5} r={1.5} fill={P.shine} opacity={0.6} />

        {/* Uppercase badge */}
        <Circle cx={228} cy={52} r={26} fill={P.shoe} stroke={P.shoeStroke} strokeWidth={2.5} />
        <Circle cx={220} cy={44} r={8} fill="#FFFFFF" opacity={0.2} />
        <SvgText x={228} y={61} fontSize={26} fontFamily="DynaPuff-Bold" textAnchor="middle" fill="#FFFFFF">
          {upper}
        </SvgText>
      </Svg>
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
    return { type: 'passageSuccess', title: 'Excellent Reading!', message: 'You read with 90%+ accuracy! Amazing work! 🎉' };
  }
  if (accuracy >= 50) {
    return { type: 'goodJob', title: 'Good Job!', message: 'Keep it up. You can do it better!' };
  }
  return { type: 'tryAgain', title: "Let's Try Again!", message: 'Practice makes perfect! Give it another try.' };
};

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
}) => {

  const formatText = (text: string) => text.split('\n').map((line, index) => (
    <Text key={index} style={readingStyles.textLine}>{line}</Text>
  ));

  const extractPunctuation = (word: string): { word: string; punctuation: string } => {
    const match = word.match(/^([a-zA-Z0-9]+)([.,!?;:'"'"]+)?$/);
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

    originalWords.forEach((originalWord, index) => {
      const { word: cleanWord, punctuation } = extractPunctuation(originalWord);
      const posData = miscuesByPosition.get(index);

      if (posData?.insertions?.length) {
        posData.insertions.forEach(ins => {
          renderedWords.push(<Text key={`ins-${keyCounter++}`}><Text style={{ color: '#1A81FF', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>{ins.spoken}</Text></Text>);
          renderedWords.push(<Text key={`spi-${keyCounter++}`}> </Text>);
        });
      }

      if (posData?.repetition) {
        renderedWords.push(<Text key={`w-${index}`}><Text style={{ color: '#BF00DD', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>{posData.repetition.spoken}</Text>{punctuation && <Text>{punctuation}</Text>}</Text>);
      } else if (posData?.substitution) {
        renderedWords.push(<Text key={`w-${index}`}><Text style={{ color: '#FF2726', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>{cleanWord}</Text>{punctuation && <Text>{punctuation}</Text>}</Text>);
      } else if (posData?.omission) {
        renderedWords.push(<Text key={`w-${index}`}><Text style={{ color: '#FF941A', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>{cleanWord}</Text>{punctuation && <Text>{punctuation}</Text>}</Text>);
      } else {
        renderedWords.push(<Text key={`w-${index}`}>{originalWord}</Text>);
      }

      if (index < originalWords.length - 1) {
        renderedWords.push(<Text key={`sp-${keyCounter++}`}> </Text>);
      }
    });

    return <Text style={readingStyles.textLine}>{renderedWords}</Text>;
  };

  const renderTextContent = () => {
    if (isPassage(material)) {
      if (!isRecording && miscues && miscues.length > 0) return renderTextWithMiscues();
      return formatText(material.text);
    }
    return null;
  };

  // ── ALPHABET ────────────────────────────────────────────────────────────────
  if (isAlphabet(material)) {
    // After recording: swap the character illustration for the result card
    if (!isRecording && isReadingCompleted) {
      return (
        <View style={readingStyles.scene}>
          <StarRatingDisplay accuracy={accuracy} visible={isReadingCompleted} />
          <FeedbackResult
            targetText={material.letter}
            spokenText={spokenText}
            miscues={miscues}
            onTryAgain={onTryAgain ?? (() => { })}
            type="alphabet"
            accuracy={accuracyString}
            feedback={feedback}
            isTextCorrect={isTextCorrect}
          />
        </View>
      );
    }
    return (
      <View style={readingStyles.scene}>
        <AlphabetCharacter letter={material.letter} />
        <View style={readingStyles.promptRow}>
          <Text style={readingStyles.promptEmoji}>🔊</Text>
          <Text style={readingStyles.promptText}>Say this letter!</Text>
        </View>
      </View>
    );
  }

  // ── WORD — Redesigned ──────────────────────────────────────────────────────
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
            type="word"
            accuracy={accuracyString}
            feedback={feedback}
            isTextCorrect={isTextCorrect}
          />
        </View>
      );
    }

    return (
      <View style={readingStyles.wordSceneWrapper}>

        {/* Decorative floating bubbles behind the card */}
        <View style={readingStyles.bubbleTopLeft} pointerEvents="none" />
        <View style={readingStyles.bubbleTopRight} pointerEvents="none" />
        <View style={readingStyles.bubbleBottomRight} pointerEvents="none" />

        {/* Main card */}
        <View style={readingStyles.wordCard}>
          {/* Letter tiles row */}
          <View style={readingStyles.letterTilesRow}>
            {letters.map((char, i) => (
              <View key={i} style={readingStyles.letterTile}>
                {/* Tile shine */}
                <View style={readingStyles.letterTileShine} />
                <Text style={readingStyles.letterTileText}>{char}</Text>
              </View>
            ))}
          </View>

          {/* Worm / wave decoration between tiles and the footer */}
          <View style={readingStyles.wordCardWave}>
            <Svg height={18} width={260} viewBox="0 0 260 18">
              <Path
                d="M0 9 Q13 0 26 9 Q39 18 52 9 Q65 0 78 9 Q91 18 104 9 Q117 0 130 9 Q143 18 156 9 Q169 0 182 9 Q195 18 208 9 Q221 0 234 9 Q247 18 260 9"
                fill="none"
                stroke="#84D6F2"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </Svg>
          </View>

          {/* Footer hint */}
          <View style={readingStyles.wordCardFooter}>
            <Text style={readingStyles.wordCardFooterText}>Tap 🎤 and say the word out loud!</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── PASSAGE — unchanged ────────────────────────────────────────────────────
  return (
    <View style={readingStyles.insideContainer}>
      {!isRecording && isReadingCompleted && (
        <StarRatingDisplay accuracy={accuracy} visible={isReadingCompleted} />
      )}
      {!isRecording && isReadingCompleted && passageGreeting && (
        <Svg height={35} width={350}>
          <SvgText x={180} y={25} fontSize={30} fontFamily="DynaPuff-Bold" textAnchor="middle" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinejoin="round">{passageGreeting.title}</SvgText>
          <SvgText x={180} y={25} fontSize={30} fontFamily="DynaPuff-Bold" textAnchor="middle" fill="#7A5A2B">{passageGreeting.title}</SvgText>
        </Svg>
      )}

      {!isReadingCompleted ? (
        <Image style={readingStyles.readingImage} source={getPassageImage(material.image)} />
      ) : null}

      <View style={!isRecording ? readingStyles.passageContainer : readingStyles.passageContainerFeedback}>
        {isReadingCompleted ? (
          <ScrollView style={readingStyles.passageScrollView} contentContainerStyle={readingStyles.passageScrollContent} showsVerticalScrollIndicator nestedScrollEnabled>
            <View style={readingStyles.passageTextWrapper}>{renderTextContent()}</View>
          </ScrollView>
        ) : (
          <View style={readingStyles.passageTextWrapper}>{renderTextContent()}</View>
        )}
      </View>
    </View>
  );
};
