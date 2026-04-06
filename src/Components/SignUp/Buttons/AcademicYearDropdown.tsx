// Components/Buttons/AcademicYearSelectionButton.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getAcademicYearOptions, formatAcademicYear } from '../../../Utilities/acadYearUtils';
import { sw, sh, sf } from '../../../Utils/responsive';
interface AcademicYearDropDownSelectionProps {
  onSelect: (value: string) => void;
  selectedValue?: string;
  label?: string;
}

const AcademicYearDropDownSelection: React.FC<AcademicYearDropDownSelectionProps> = ({
  onSelect,
  selectedValue,
  label = 'Academic Year',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const academicYears = getAcademicYearOptions();

  const handleSelect = (year: string) => {
    onSelect(year);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedValue ? styles.selectedText : styles.placeholderText}>
          {selectedValue ? formatAcademicYear(selectedValue) : `Select ${label}`}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsContainer}>
              {academicYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.option,
                    selectedValue === year && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(year)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedValue === year && styles.selectedOptionText,
                  ]}>
                    {formatAcademicYear(year)}
                  </Text>
                  {selectedValue === year && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: sh(16),
  },
  label: {
    fontSize: sf(14),
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: sh(8),
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: sw(8),
    paddingHorizontal: sw(16),
    paddingVertical: sh(14),
  },
  selectedText: {
    fontSize: sf(16),
    color: '#2C3E50',
  },
  placeholderText: {
    fontSize: sf(16),
    color: '#7F8C8D',
  },
  dropdownIcon: {
    fontSize: sf(12),
    color: '#4ECDC4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: sw(20),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: sw(12),
    width: '90%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: sw(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: sf(18),
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeButton: {
    padding: sw(4),
  },
  closeButtonText: {
    fontSize: sf(20),
    color: '#7F8C8D',
  },
  optionsContainer: {
    maxHeight: sw(300),
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sh(16),
    paddingHorizontal: sw(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F0F9F8',
  },
  optionText: {
    fontSize: sf(16),
    color: '#2C3E50',
  },
  selectedOptionText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: sf(16),
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
});

export default AcademicYearDropDownSelection;