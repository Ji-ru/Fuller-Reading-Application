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
  isCorrect?: boolean;
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

const ErrorBadge = () => (
  <View style={[readingStyles.completionBadge, { backgroundColor: '#e74c3c' }]}>
    <View style={{ position: 'relative', width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: 2, height: 14, backgroundColor: '#fff', transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: 2, height: 14, backgroundColor: '#fff', transform: [{ rotate: '-45deg' }] }} />
    </View>
  </View>
);

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  material,
  type,
  spokenText,
  isRecording,
  miscues = [], 
  isCompleted = false,
  isCorrect = true,
}) => {
  // Unified renderer — always renders word-by-word to guarantee identical layout
  const renderPassageText = () => {
    if (!isPassage(material)) return null;

    const lines = material.text.split('\n');
    let globalWordIndex = 0;

    // Build miscue map only when showing feedback
    const showFeedback = !isRecording && isCompleted;
    const miscuesByPosition = new Map<
      number,
      {
        substitution?: Miscue;
        omission?: Miscue;
        insertions: Miscue[];
        repetition?: Miscue;
      }
    >();

    if (showFeedback) {
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
    }

    return lines.map((line, lineIdx) => {
      const wordsInLine = line.split(/\s+/).filter(w => w.length > 0);
      const renderedWords: JSX.Element[] = [];

      wordsInLine.forEach((originalWord, inLineIdx) => {
        const keyBase = `line-${lineIdx}-word-${inLineIdx}`;

        // Determine color
        let wordColor = '#1c2833'; // Default black (during reading)

        if (showFeedback) {
          const noAudio = !spokenText || spokenText.trim() === '';
          if (noAudio) {
            // No audio detected — all words red
            wordColor = '#eb5c6c';
          } else {
            const posData = miscuesByPosition.get(globalWordIndex);
            if (posData?.substitution) {
              wordColor = '#eb5c6c'; // Pagpapalit (Red)
            } else if (posData?.omission) {
              wordColor = '#f39c12'; // Kaligtaan (Orange)
            } else if (posData?.repetition) {
              wordColor = '#9b59b6'; // Pag-uulit (Purple)
            } else {
              wordColor = '#1a7a45'; // Correct (Green)
            }
          }
        }

        renderedWords.push(
          <Text key={keyBase} style={{ color: wordColor }}>
            {originalWord}{' '}
          </Text>
        );

        globalWordIndex++;
      });

      return (
        <Text key={`line-${lineIdx}`} style={readingStyles.textLine}>
          {renderedWords}
        </Text>
      );
    });
  };

  // ALPHABET DISPLAY
  if (type === 'alphabet' && isAlphabet(material)) {
    return (
      <View style={readingStyles.wordCardContainer}>
        <View style={[
          readingStyles.wordCard, 
        ]}>

          <View style={readingStyles.clipContainer}>
            {/* Decorative shapes to match Hero */}
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.03)', bottom: -15, left: -15, width: 60, height: 60 }]} />
          </View>
          
          <Text style={[
             readingStyles.wordCardText,
             isCompleted && { color: isCorrect ? '#1a7a45' : '#e74c3c' }
          ]}>
            {['ang', 'mga', '-ng', 'ng-'].includes(material.letter.toLowerCase())
              ? material.letter
              : `${material.letter.charAt(0).toUpperCase() + material.letter.slice(1).toLowerCase()} ${material.letter.toLowerCase()}`
            }
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
        <View style={[
          readingStyles.wordCard, 
        ]}>

          <View style={readingStyles.clipContainer}>
            {/* Decorative shapes to match Hero */}
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
            <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.03)', bottom: -15, left: -15, width: 60, height: 60 }]} />
          </View>

          <Text style={[
             readingStyles.wordCardText,
             isCompleted && { color: isCorrect ? '#1a7a45' : '#e74c3c' }
          ]}>{allWords[0]}</Text>
        </View>
      </View>
    );
  }
  

  // PASSAGE DISPLAY
  if(type === 'passage' && isPassage(material)){
    return (
      <View>

        <View style={readingStyles.passageContainer}>



          <View style={readingStyles.clipContainer}>
             {/* Decorative shapes to match Hero */}
             <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
          </View>
          
          <ScrollView
            style={readingStyles.passageScroll}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          >
            <View style={readingStyles.textContainer}>
              {renderPassageText()}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
  return null
};
