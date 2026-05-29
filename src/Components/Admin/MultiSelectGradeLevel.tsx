import React, { useState, ReactElement } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { FacultyColors as F, Radii } from '../../Utilities/Theme';

interface MultiSelectGradeLevelProps {
  selectedValues: number[];
  onSelectionChange: (values: number[]) => void;
}

export default function MultiSelectGradeLevel({ selectedValues, onSelectionChange }: MultiSelectGradeLevelProps): ReactElement {
  const gradeLevels = [1, 2, 3];
  const [modalVisible, setModalVisible] = useState(false);

  const toggleGrade = (level: number) => {
    const newValues = selectedValues.includes(level)
      ? selectedValues.filter(l => l !== level)
      : [...selectedValues, level];
    onSelectionChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return 'Pumili ng Baitang';
    return `Baitang ${selectedValues.join(', ')}`;
  };

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        style={[
          localS.selector,
          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }
        ]}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 15, color: F.ink, fontFamily: 'Andika-Regular', flex: 1 }} numberOfLines={1}>
          {getDisplayText()}
        </Text>
        <Text style={{ fontSize: 12, color: F.primaryDeep }}>▼</Text>
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
            
            {gradeLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  localS.option,
                  selectedValues.includes(level) && localS.selectedOption
                ]}
                onPress={() => toggleGrade(level)}
              >
                <Text style={[
                  localS.optionText,
                  selectedValues.includes(level) && localS.selectedOptionText
                ]}>
                  Baitang {level}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={localS.doneBtn} onPress={() => setModalVisible(false)}>
              <Text style={localS.doneBtnText}>Tapos na</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const localS = StyleSheet.create({
  selector: {
    backgroundColor: F.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: F.ink,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#eee',
  },
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
    fontFamily: 'Andika-Bold',
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
    backgroundColor: F.primaryDeep + '12',
    borderRadius: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Andika-Regular',
    color: '#1b2e23',
  },
  selectedOptionText: {
    color: F.primaryDeep,
    fontFamily: 'Andika-Bold',
  },
  doneBtn: {
    backgroundColor: F.primaryDeep,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Andika-Bold',
  },
});