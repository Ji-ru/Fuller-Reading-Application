import React from 'react';
import { View, Text, Image } from 'react-native';
import { Passage } from '../../Types/passage';
import readingStyles from '../../ui/ReadingActivityStyles';

interface PassageDisplayProps {
  passage: Passage;
  spokenText: string;
  isRecording: boolean;
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({
  passage,
  spokenText,
  isRecording
}) => {
  const getPassageImage = (imageName: string) => {
    const images: { [key: string]: any } = {
      Hickory: require('../../../assets/ReadingMaterial/PassageImages/Hickory.png'),
    };
    return images[imageName] || require('../../../assets/icons/Empty-icon.png');
  };

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
    return formatText(passage.text);
  };

  return (
    <View style={readingStyles.insideContainer}>
      <Image
        style={readingStyles.readingImage}
        source={getPassageImage(passage.image)}
      />
      <View style={!isRecording ? readingStyles.passageContainerFeedback : readingStyles.passageContainer}>
        <Text style={readingStyles.passageTitle}>{passage.title}</Text>
        <Text style={readingStyles.passageAuthor}>By {passage.author}</Text>
        <View style={readingStyles.textContainer}>
          <Text style={readingStyles.textLine}>{renderTextContent()}</Text>
        </View>
      </View>
    </View>
  );
};