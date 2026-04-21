import React, { useState } from 'react';
import { View, Text } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import buttons from '../../../UI_Designs/ButtonStyles';

interface GenderSelectionProps {
  onGenderSelect: (gender: string) => void;
}

const GenderSelection = ({ onGenderSelect }: GenderSelectionProps) => {
  const [selectedId, setSelectedId] = useState('');

  const radioButtons = [
    {
      id: '1',
      label: 'Male',
      value: 'male',
      labelStyle: { fontFamily: 'Satoshi-Medium', color: '#666' },
      color: '#3D71D9',
    },
    {
      id: '2',
      label: 'Female',
      value: 'female',
      labelStyle: { fontFamily: 'Satoshi-Medium', color: '#666' },
      color: '#3D71D9',
    },
  ];

  const handlePress = (id: string) => {
    setSelectedId(id);
    // Find the selected radio button and get its value
    const selectedOption = radioButtons.find(button => button.id === id);
    if (selectedOption && onGenderSelect) {
      onGenderSelect(selectedOption.value);
    }
  };

  return (
    <View>
      <View style={buttons.sexRadioButton}>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={handlePress}
          selectedId={selectedId}
          layout="row"
        />
      </View>
    </View>
  );
};

export default GenderSelection;
