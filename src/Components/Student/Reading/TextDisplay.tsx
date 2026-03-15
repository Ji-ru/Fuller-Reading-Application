import React, { JSX } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
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
import Svg, { Text as SvgText } from 'react-native-svg';

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
    return {
      type: 'passageSuccess',
      title: 'Excellent Reading!',
      message: 'You read with 90%+ accuracy! Amazing work! 🎉',
    };
  }

  if (accuracy >= 50) {
    return {
      type: 'goodJob',
      title: 'Good Job!',
      message: 'Keep it up. You can do it better!',
    };
  }

  return {
    type: 'tryAgain',
    title: "Let's Try Again!",
    message: 'Practice makes perfect! Give it another try.',
  };
};

interface PassageDisplayProps {
  material: Passage | Alphabet | Word;
  type: 'alphabet' | 'passage' | 'word';
  spokenText: string;
  isRecording: boolean;
  accuracy?: number;
  miscues?: Miscue[];
  isReadingCompleted: boolean;
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  material,
  type,
  spokenText,
  isRecording,
  miscues = [],
  accuracy = 0,
  isReadingCompleted = false
}) => {

  // Format passage text with line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <Text key={index} style={readingStyles.textLine}>
        {line}
      </Text>
    ));
  };

  /**
   * Extract punctuation from a word
   * Returns an object with the clean word and any trailing punctuation
   *
   * Example: "hello," -> { word: "hello", punctuation: "," }
   *          "world!"  -> { word: "world", punctuation: "!" }
   *          "test"    -> { word: "test", punctuation: "" }
   */
  const extractPunctuation = (
    word: string,
  ): { word: string; punctuation: string } => {
    const match = word.match(/^([a-zA-Z0-9]+)([.,!?;:'"'"]+)?$/);
    if (match) {
      return {
        word: match[1] || word,
        punctuation: match[2] || '',
      };
    }
    return { word, punctuation: '' };
  };

  const passageGreeting =
    type === 'passage' && isReadingCompleted
      ? getPassageGreetingContent(accuracy)
      : null;

  /**
   * Renders text with colored miscues, preserving punctuation
   *
   * This function processes the target text and applies color coding based on detected miscues.
   *
   * Color scheme:
   * - Substitution: Red (#FF2726) - colors the target word that was substituted
   * - Omission: Yellow (#FF941A) - colors the target word that was omitted
   * - Insertion: Blue (#1A81FF) - shows inserted word(s) BEFORE the target word
   * - Repetition: Purple (#BF00DD) - shows repeated word in purple
   *
   * DISPLAY LOGIC:
   * - Substitution: Color the target word at that position (word was said wrong)
   * - Omission: Color the target word at that position (word was skipped)
   * - Insertion: Show inserted word(s) in blue BEFORE the normal target word
   * - Repetition: Show the repeated spoken word in purple at that position
   *
   * PUNCTUATION HANDLING:
   * - Original passage text with punctuation is preserved
   * - Miscue detection uses words without punctuation (for matching)
   * - Display shows words with their original punctuation intact
   *
   * Example:
   *   Target: "Hello, world!"
   *   Spoken: "Hello there world"
   *   Display: "Hello, there world!" (there in blue, punctuation preserved)
   */
  const renderTextWithMiscues = () => {
    if (!isPassage(material)) return null;

    /**
     * Parse the original text to extract words WITH their punctuation
     * This preserves the original formatting of the passage
     */
    const originalWords = material.text
      .split(/\s+/)
      .filter(word => word.length > 0);

    /**
     * Also get clean words (without punctuation) for matching with miscues
     * This matches the logic in MiscueAnalysisService which strips punctuation
     */
    const cleanWords = material.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    /**
     * Organize miscues by type for proper rendering
     *
     * IMPORTANT: Multiple miscues can occur at the same position!
     * For example, if a word is substituted AND there's an insertion before it.
     */
    const miscuesByPosition = new Map<
      number,
      {
        substitution?: Miscue;
        omission?: Miscue;
        insertions: Miscue[];
        repetition?: Miscue;
      }
    >();

    // Initialize structure for each position
    miscues.forEach(miscue => {
      if (!miscuesByPosition.has(miscue.position)) {
        miscuesByPosition.set(miscue.position, { insertions: [] });
      }

      const posData = miscuesByPosition.get(miscue.position)!;

      switch (miscue.type) {
        case 'substitution':
          posData.substitution = miscue;
          break;
        case 'omission':
          posData.omission = miscue;
          break;
        case 'insertion':
          posData.insertions.push(miscue);
          break;
        case 'repetition':
          posData.repetition = miscue;
          break;
      }
    });

    // Build the rendered text with colors
    const renderedWords: JSX.Element[] = [];
    let keyCounter = 0; // Counter for unique keys

    originalWords.forEach((originalWord, index) => {
      // Extract the clean word and punctuation from original
      const { word: cleanWord, punctuation } = extractPunctuation(originalWord);

      const posData = miscuesByPosition.get(index);

      /**
       * STEP 1: Render any INSERTIONS that occurred BEFORE this target word position
       * Insertions are extra words, so they appear before the actual target word
       */
      if (posData?.insertions && posData.insertions.length > 0) {
        posData.insertions.forEach(insertion => {
          renderedWords.push(
            <Text key={`insertion-${keyCounter++}`}>
              <Text style={{ color: '#1A81FF', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>
                {insertion.spoken}
              </Text>
            </Text>,
          );
          // Add space after insertion
          renderedWords.push(
            <Text key={`space-insert-${keyCounter++}`}> </Text>,
          );
        });
      }

      /**
       * STEP 2: Render the TARGET WORD at this position with appropriate styling
       *
       * Priority order (only one can apply to the target word itself):
       * 1. Repetition (replaces target word display with spoken repetition)
       * 2. Substitution (colors target word red)
       * 3. Omission (colors target word yellow)
       * 4. No miscue (normal text)
       *
       * IMPORTANT: Preserve punctuation in all cases
       */
      if (posData?.repetition) {
        // Repetition: Show the repeated SPOKEN word in purple, with punctuation
        renderedWords.push(
          <Text key={`word-${index}`}>
            <Text style={{ color: '#BF00DD', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>
              {posData.repetition.spoken}
            </Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>,
        );
      } else if (posData?.substitution) {
        // Substitution: Color the TARGET word red, with punctuation
        renderedWords.push(
          <Text key={`word-${index}`}>
            <Text style={{ color: '#FF2726', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>
              {cleanWord}
            </Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>,
        );
      } else if (posData?.omission) {
        // Omission: Color the TARGET word yellow, with punctuation
        renderedWords.push(
          <Text key={`word-${index}`}>
            <Text style={{ color: '#FF941A', fontFamily: 'Comfortaa-VariableFont_wght', fontWeight: 'bold' }}>
              {cleanWord}
            </Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>,
        );
      } else {
        // No miscue - render normal text with original casing and punctuation
        renderedWords.push(<Text key={`word-${index}`}>{originalWord}</Text>);
      }

      // Add space between words (except for last word)
      if (index < originalWords.length - 1) {
        renderedWords.push(<Text key={`space-${keyCounter++}`}> </Text>);
      }
    });

    return <Text style={readingStyles.textLine}>{renderedWords}</Text>;
  };

  /**
   * MODIFIED: Updated to use colored miscue rendering when not recording
   * - During recording: shows target text (original passage)
   * - After recording: shows target text with colored miscues
   */
  const renderTextContent = () => {
    if (isPassage(material)) {
      // After recording is complete and miscues are detected, show colored version
      if (!isRecording && miscues && miscues.length > 0) {
        return renderTextWithMiscues();
      }
      // During recording OR no miscues detected, show original formatted text
      return formatText(material.text);
    }
    return null;
  };

  // ALPHABET DISPLAY
  if (isAlphabet(material)) {
    return (
      <View style={readingStyles.alphabetContainer}>
        {/* Big Letter Display */}
        <View style={readingStyles.letterContainer}>
          <Text style={readingStyles.bigLetter}>{material.letter}</Text>
        </View>
      </View>
    );
  }

  // WORD DISPLAY
  if (type === 'word' && isWords(material)) {
    const allWords = material.contrasts.flatMap(c => c.words);

    return (
      <View style={readingStyles.wordCardContainer}>
        <View style={readingStyles.wordCard}>
          <Text style={readingStyles.wordCardText}>{allWords[0]}</Text>
        </View>
        <Text style={readingStyles.wordCardInstruction}>Read the word</Text>
      </View>
    );
  }

  // PASSAGE DISPLAY
  return (
    <View style={readingStyles.insideContainer}>
      {!isRecording && isReadingCompleted && type === 'passage' && (
        <StarRatingDisplay
          accuracy={accuracy}
          visible={isReadingCompleted}
        />
      )}
      {!isRecording && isReadingCompleted && type === 'passage' && passageGreeting && (
        <Svg height={35} width={350} >
          <SvgText
            x={180}                 // center X
            y={25}                  // baseline Y
            fontSize={30}
            fontFamily="DynaPuff-Bold"
            textAnchor="middle"     // center align
            fill="none"          // inside color
            stroke="#FFFFFF"        // outline color
            strokeWidth={6}         // outline thickness
            strokeLinejoin='round'
          >
            {passageGreeting.title}
          </SvgText>
          <SvgText
            x={180}
            y={25}
            fontSize={30}
            fontFamily="DynaPuff-Bold"
            textAnchor="middle"
            fill="#7A5A2B"
          >
            {passageGreeting.title}
          </SvgText>
        </Svg>)}

      {/* {!isRecording && isReadingCompleted && type === 'passage' && passageGreeting && (
        <View
          style={readingStyles.passageGreetingContainer}
        >
          <Text style={readingStyles.passageGreetingTitle}>
            {passageGreeting.title}
          </Text>
        </View>
      )} */}

      {!isReadingCompleted ? (
        <Image
          style={readingStyles.readingImage}
          source={getPassageImage(material.image)}
        />
      ) : null
      }

      <View
        style={
          !isRecording
            ? readingStyles.passageContainer
            : readingStyles.passageContainerFeedback
        }
      >
        {/* <Text style={readingStyles.passageTitle}>{material.title}</Text>
        <Text style={readingStyles.passageAuthor}>By {material.author}</Text> */}
        {isReadingCompleted ? (
          <ScrollView
            style={readingStyles.passageScrollView}
            contentContainerStyle={readingStyles.passageScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={readingStyles.passageTextWrapper}>
              {renderTextContent()}
            </View>
          </ScrollView>
        ) : (
          <View style={readingStyles.passageTextWrapper}>
            {renderTextContent()}
          </View>
        )}
      </View>
    </View>
  );
};
