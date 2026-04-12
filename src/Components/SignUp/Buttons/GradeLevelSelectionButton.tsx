import React, { useState, ReactElement } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import signup from '../../../UI_Designs/SignUpStyles';

interface GradeLevelDropDownSelectionProps {
  onSelect?: (value: number) => void;
  transparent?: boolean;
}

export default function GradeLevelDropDownSelection({ onSelect, transparent }: GradeLevelDropDownSelectionProps): ReactElement {
  const gradeLevels = ['Baitang 1', 'Baitang 2', 'Baitang 3'];
  const [selectedValue, setSelectedValue] = useState(gradeLevels[0]);
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (onSelect) {
      onSelect(1);
    }
  }, []);

  const handleLevelSelect = (level: string) => {
    setSelectedValue(level);
    const num = parseInt(level.replace(/\D/g, ''), 10);
    if (onSelect) onSelect(num);
    setModalVisible(false);
  };

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        style={[
          signup.textInputForm,
          { 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            paddingHorizontal: 16 
          }
        ]}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 15, color: '#1b2e23', fontFamily: 'Satoshi-Medium' }}>
          {selectedValue}
        </Text>
        <Text style={{ fontSize: 12, color: '#8fafa0' }}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={localS.overlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={localS.modalContainer}>
            <View style={localS.indicator} />
            <Text style={localS.modalTitle}>Pumili ng Baitang</Text>
            
            {gradeLevels.map((level, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  localS.option,
                  selectedValue === level && localS.selectedOption
                ]}
                onPress={() => handleLevelSelect(level)}
              >
                <Text style={[
                  localS.optionText,
                  selectedValue === level && localS.selectedOptionText
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const localS = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#1b2e23',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#f0faf4',
    borderRadius: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#1b2e23',
  },
  selectedOptionText: {
    color: '#1a7a45',
    fontFamily: 'Satoshi-Bold',
  },
});
