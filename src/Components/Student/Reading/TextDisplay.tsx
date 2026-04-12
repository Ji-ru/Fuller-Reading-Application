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

interface PassageDisplayProps {
  material: Passage | Alphabet | Word;
  type: 'alphabet' | 'passage' | 'word';
  spokenText: string;
  isRecording: boolean;
  miscues?: Miscue[];
  isCompleted?: boolean;
}

const CheckmarkBadge = () => (
  <View style={readingStyles.completionBadge}>
    <View style={{ 
      width: 14, 
      height: 8, 
      borderLeftWidth: 3, 
      borderBottomWidth: 3, 
      borderColor: '#fff', 
      transform: [{ rotate: '-45deg' }, { translateY: -1 }] 
    }} />
  </View>
);

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  material,
  type,
  spokenText,
  isRecording,
  miscues = [], 
  isCompleted = false,
}) => {
  // Function to highlight letter in text
  const highlightLetterInText = (text: string, letter: string) => {
    const parts = text.split(new RegExp(`(${letter})`, 'gi'));

    return parts.map((part, index) => {
      if (part.toUpperCase() === letter.toUpperCase()) {
        return (
          <Text key={index} style={readingStyles.highlightedLetter}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };



  // Format passage text with line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <Text key={index} style={readingStyles.textLine}>
        {line}
      </Text>
    ));
  };

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

  const renderTextWithMiscues = () => {
    if (!isPassage(material)) return null;

    const originalWords = material.text
      .split(/\s+/)
      .filter(word => word.length > 0);

    const miscuesByPosition = new Map<
      number,
      {
        substitution?: Miscue;
        omission?: Miscue;
        insertions: Miscue[];
        repetition?: Miscue;
      }
    >();

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

    const renderedWords: JSX.Element[] = [];
    let keyCounter = 0;

    originalWords.forEach((originalWord, index) => {
      const { word: cleanWord, punctuation } = extractPunctuation(originalWord);
      const posData = miscuesByPosition.get(index);

      if (posData?.insertions && posData.insertions.length > 0) {
        posData.insertions.forEach(insertion => {
          renderedWords.push(
            <Text key={`insertion-${keyCounter++}`}>
              <Text style={{ color: '#1A81FF', fontWeight: 'bold' }}>
                {insertion.spoken}
              </Text>
            </Text>,
          );
          renderedWords.push(
            <Text key={`space-insert-${keyCounter++}`}> </Text>,
          );
        });
      }

      if (posData?.repetition) {
        renderedWords.push(
          <Text key={`word-${index}`}>
            <Text style={{ color: '#BF00DD', fontWeight: 'bold' }}>
              {posData.repetition.spoken}
            </Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>,
        );
      } else if (posData?.substitution) {
        renderedWords.push(
          <Text key={`word-${index}`}>
            <Text style={{ color: '#FF2726', fontWeight: 'bold' }}>
              {cleanWord}
            </Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>,
        );
      } else if (posData?.omission) {
        renderedWords.push(
          <Text key={`word-${index}`}>
            <Text style={{ color: '#FF941A', fontWeight: 'bold' }}>
              {cleanWord}
            </Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>,
        );
      } else {
        renderedWords.push(<Text key={`word-${index}`}>{originalWord}</Text>);
      }

      if (index < originalWords.length - 1) {
        renderedWords.push(<Text key={`space-${keyCounter++}`}> </Text>);
      }
    });

    return <Text style={readingStyles.textLine}>{renderedWords}</Text>;
  };

  const renderTextContent = () => {
    if (isPassage(material)) {
      if (!isRecording && miscues && miscues.length > 0) {
        return renderTextWithMiscues();
      }
      return formatText(material.text);
    }
    return null;
  };

  // ALPHABET DISPLAY
  if (type === 'alphabet' && isAlphabet(material)) {
    return (
      <View style={readingStyles.wordCardContainer}>
        <View style={[readingStyles.wordCard, isCompleted && readingStyles.completedCard]}>
          <View style={readingStyles.clipContainer}>
            {/* Decorative shapes to match Hero */}
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.03)', bottom: -15, left: -15, width: 60, height: 60 }]} />
          </View>
          
          {isCompleted && <CheckmarkBadge />}
          <Text style={readingStyles.wordCardText}>
            {material.letter}
          </Text>
        </View>
      </View>
    );
  }

  // WORD DISPLAY
  if (type === 'word' && isWords(material)) {
    const allWords = material.contrasts.flatMap(c => c.words);
  
    return (
      <View style={readingStyles.wordCardContainer}>
        <View style={[readingStyles.wordCard, isCompleted && readingStyles.completedCard]}>
          <View style={readingStyles.clipContainer}>
            {/* Decorative shapes to match Hero */}
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.03)', bottom: -15, left: -15, width: 60, height: 60 }]} />
          </View>

          {isCompleted && <CheckmarkBadge />}
          <Text style={readingStyles.wordCardText}>{allWords[0]}</Text>
        </View>
      </View>
    );
  }
  

  // PASSAGE DISPLAY
  if(type === 'passage' && isPassage(material)){
    return (
      <View style={readingStyles.insideContainer}>
        <View style={readingStyles.passageHeader}>
          <Text style={readingStyles.passageTitle}>{material.title}</Text>
          <Text style={readingStyles.passageAuthor}>{material.author}</Text>
        </View>

        <View style={[
          !isRecording ? readingStyles.passageContainerFeedback : readingStyles.passageContainer,
          isCompleted && readingStyles.completedCard
        ]}>
          <View style={readingStyles.clipContainer}>
             {/* Decorative shapes to match Hero */}
             <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
          </View>

          {isCompleted && <CheckmarkBadge />}
          
          <ScrollView
            style={readingStyles.passageScroll}
            showsVerticalScrollIndicator={true}
          >
            <View style={readingStyles.textContainer}>
              {renderTextContent()}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
  return null
};
