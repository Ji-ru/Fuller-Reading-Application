import React, { useState, useEffect, ReactElement } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import signup from '../../../UI_Designs/SignUpStyles';
import { getAllActiveClasses } from '../../../Controller/AuthenticationController';
import { ClassDocument } from '../../../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../../../Utilities/acadYearUtils';

interface ClassSelectionButtonProps {
  gradeLevel?: number;
  onSelect?: (classCode: string) => void;
  transparent?: boolean;
}

export default function ClassSelectionButton({ gradeLevel, onSelect, transparent }: ClassSelectionButtonProps): ReactElement {
  const [allClasses, setAllClasses] = useState<(ClassDocument & { id: string })[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<(ClassDocument & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<(ClassDocument & { id: string }) | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch all active classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await getAllActiveClasses();
        data.sort((a, b) => (a.className || '').localeCompare(b.className || ''));
        setAllClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Filter classes whenever gradeLevel changes
  useEffect(() => {
    let list: (ClassDocument & { id: string })[] = [];
    const currentSY = getCurrentAcademicYear();

    if (allClasses.length > 0) {
      // 1. Filter by Academic Year first
      const currentYearClasses = allClasses.filter(cls => cls.acadYear === currentSY);

      // 2. Filter by Grade Level if provided
      if (gradeLevel) {
        const gNum = typeof gradeLevel === 'string' ? parseInt(gradeLevel.replace(/\D/g, ''), 10) : gradeLevel;
        list = currentYearClasses.filter(cls => {
          if (!cls.gradeLevel) return false;
          const clsGrade = typeof cls.gradeLevel === 'string' ? parseInt(cls.gradeLevel.replace(/\D/g, ''), 10) : cls.gradeLevel;
          return clsGrade === gNum;
        });
      } else {
        list = currentYearClasses;
      }
    }

    setFilteredClasses(list);

    // 3. Pre-select logic: Only auto-select if we don't have a valid selection for this filter
    if (list.length > 0) {
      const isCurrentSelectionValid = selectedClass && list.some(cls => cls.id === selectedClass.id);
      
      if (!isCurrentSelectionValid) {
        const defaultClass = list[0];
        setSelectedClass(defaultClass);
        if (onSelect) onSelect(defaultClass.classCode);
      }
    } else if (selectedClass !== null) {
      setSelectedClass(null);
      if (onSelect) onSelect('');
    }
  }, [gradeLevel, allClasses, onSelect]);

  const handleClassSelect = (cls: ClassDocument & { id: string }) => {
    setSelectedClass(cls);
    if (onSelect) onSelect(cls.classCode);
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={{ paddingVertical: 10, alignItems: 'center', width: '90%', alignSelf: 'center' }}>
        <ActivityIndicator size="small" color="#2ecc71" />
        <Text style={{ fontSize: 10, color: '#bdc3c7', marginTop: 4, fontFamily: 'Satoshi-Medium' }}>Hinahanap ang mga klase...</Text>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      {/* Dropdown trigger — same style as Antas ng Baitang */}
      <TouchableOpacity
        style={[
          signup.textInputForm,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
          }
        ]}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 15, color: selectedClass ? '#1b2e23' : '#999', fontFamily: 'Satoshi-Medium' }}>
          {selectedClass ? selectedClass.className : 'Pumili ng klase...'}
        </Text>
        <Text style={{ fontSize: 12, color: '#8fafa0' }}>▼</Text>
      </TouchableOpacity>

      {/* Bottom-sheet modal — same design as Baitang picker */}
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
            <Text style={localS.modalTitle}>Pumili ng Klase</Text>

            {filteredClasses.length > 0 ? (
              <FlatList
                data={filteredClasses}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const isSelected = selectedClass?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[localS.option, isSelected && localS.selectedOption]}
                      onPress={() => handleClassSelect(item)}
                    >
                      <Text style={[localS.optionText, isSelected && localS.selectedOptionText]}>
                        {item.className}
                      </Text>
                      <View style={[localS.codeBadge, isSelected && localS.codeBadgeSelected]}>
                        <Text style={[localS.codeText, isSelected && localS.codeTextSelected]}>
                          {item.classCode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Text style={localS.emptyText}>
                Walang available na klase sa baitang na ito.
              </Text>
            )}
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
    maxHeight: '60%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#f0faf4',
    borderRadius: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#1b2e23',
    flex: 1,
  },
  selectedOptionText: {
    color: '#1a7a45',
    fontFamily: 'Satoshi-Bold',
  },
  codeBadge: {
    backgroundColor: '#f0faf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  codeBadgeSelected: {
    backgroundColor: '#1a7a45',
  },
  codeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  codeTextSelected: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
});
