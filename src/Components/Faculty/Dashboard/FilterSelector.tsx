import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { FilterOptions } from '../../../Interfaces/miscue';

interface FilterSelectorProps {
  facultyId: string | null;
  currentFilter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
  classes?: Array<{
    classId: string;
    className: string;
    gradeLevel: number;
  }>;
  loading?: boolean;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  currentFilter,
  onFilterChange,
  classes = [],
  loading = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getDisplayText = () => {
    if (currentFilter.type === 'overall') {
      return 'Overall Statistics';
    } else if (currentFilter.className) {
      return currentFilter.className;
    }
    return 'Select Filter';
  };

  const handleOptionSelect = (option: 'overall' | { classId: string; className: string; gradeLevel: number }) => {
    if (option === 'overall') {
      onFilterChange({ type: 'overall' });
    } else {
      onFilterChange({
        type: 'class',
        classId: option.classId,
        className: option.className,
      });
    }
    setShowDropdown(false);
  };

  const renderDropdownItem = (item: { label: string; value: 'overall' | { classId: string; className: string; gradeLevel: number } }) => {
    const isSelected = 
      item.value === 'overall' 
        ? currentFilter.type === 'overall'
        : currentFilter.classId === (item.value as any).classId;

    return (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          isSelected && styles.selectedDropdownItem,
        ]}
        onPress={() => handleOptionSelect(item.value)}
      >
        <Text style={[
          styles.dropdownItemText,
          isSelected && styles.selectedDropdownItemText,
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const dropdownOptions = [
    { label: 'Overall Statistics', value: 'overall' as const },
    ...classes.map(cls => ({
      label: cls.className,
      value: cls as { classId: string; className: string; gradeLevel: number }
    }))
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setShowDropdown(true)}
        disabled={loading}
      >
        <Text style={styles.dropdownTriggerText} numberOfLines={1}>
          {getDisplayText()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Filter</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#5B5FED" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : dropdownOptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No options available</Text>
              </View>
            ) : (
              <FlatList
                data={dropdownOptions}
                keyExtractor={(item, index) => 
                  item.value === 'overall' ? 'overall' : item.value.classId
                }
                renderItem={({ item }) => renderDropdownItem(item)}
                contentContainerStyle={styles.dropdownList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownTriggerText: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '85%',
    maxHeight: '60%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownTitle: {
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  dropdownList: {
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  selectedDropdownItem: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#5B5FED',
    fontFamily: 'Andika-Bold',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Andika-Regular',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Andika-Regular',
  },
});

export default FilterSelector;
