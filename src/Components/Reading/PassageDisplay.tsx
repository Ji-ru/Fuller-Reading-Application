import React from 'react';
import { View, Text, Image } from 'react-native';
import {
  Passage,
  AlphabetItem,
  isPassage,
  isAlphabet,
} from '../../Types/passage';
import readingStyles from '../../ui/ReadingActivityStyles';

interface PassageDisplayProps {
  material: Passage | AlphabetItem;
  type: 'alphabet' | 'passage';
  spokenText: string;
  isRecording: boolean;
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  material,
  type,
  spokenText,
  isRecording,
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

  // Function to get passage image
  const getPassageImage = (imageName: string) => {
    const images: { [key: string]: any } = {
      Hickory: require('../../../assets/ReadingMaterial/PassageImages/Hickory.png'),
    };
    return images[imageName] || require('../../../assets/icons/Empty-icon.png');
  };

  // Format passage text with line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <Text key={index} style={readingStyles.textLine}>
        {line}
      </Text>
    ));
  };

  const renderTextContent = () => {
    if (spokenText) {
      return spokenText;
    }
    if (isPassage(material)) {
      return formatText(material.text);
    }
    return null;
  };

  if (isAlphabet(material)) {
    return (
      <View style={readingStyles.alphabetContainer}>
        {/* Big Letter Display */}
        <View style={readingStyles.letterContainer}>
          <Text style={readingStyles.bigLetter}>{material.letter}</Text>
        </View>

        {/* Word and Example Display */}
        <View style={readingStyles.alphabetExamples}>
          <View style={readingStyles.exampleSection}>
            <Text style={readingStyles.exampleLabel}>Word:</Text>
            <Text style={readingStyles.exampleText}>
              {highlightLetterInText(material.word, material.letter)}
            </Text>
          </View>

          <View style={readingStyles.exampleSection}>
            <Text style={readingStyles.exampleLabel}>Example:</Text>
            <Text style={readingStyles.exampleText}>
              {highlightLetterInText(material.example, material.letter)}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={readingStyles.instructions}>
          <Text style={readingStyles.instructionText}>
            Please read the letter "{material.letter}" out loud
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={readingStyles.insideContainer}>
      <Image
        style={readingStyles.readingImage}
        source={getPassageImage(material.image)}
      />
      <View
        style={
          !isRecording
            ? readingStyles.passageContainerFeedback
            : readingStyles.passageContainer
        }
      >
        <Text style={readingStyles.passageTitle}>{material.title}</Text>
        <Text style={readingStyles.passageAuthor}>By {material.author}</Text>
        <View style={readingStyles.textContainer}>
          <Text style={readingStyles.textLine}>{renderTextContent()}</Text>
        </View>
      </View>
    </View>
  );
};
