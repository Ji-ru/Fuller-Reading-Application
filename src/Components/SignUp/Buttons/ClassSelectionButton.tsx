import React, { useState, useEffect, ReactElement } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ActivityIndicator, FlatList } from 'react-native';
import signup from '../../../UI_Designs/SignUpStyles';
import { getAllActiveClasses } from '../../../Controller/AuthenticationController';
import { ClassDocument } from '../../../Interfaces/dataInterfaces';

interface ClassSelectionButtonProps {
  gradeLevel?: number;
  onSelect?: (classCode: string) => void;
  transparent?: boolean;
}

export default function ClassSelectionButton({ gradeLevel, onSelect, transparent }: ClassSelectionButtonProps): ReactElement {
  const [allClasses, setAllClasses] = useState<(ClassDocument & { id: string })[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<(ClassDocument & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassDocument & { id: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAllOverride, setShowAllOverride] = useState(false);

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

  useEffect(() => {
    if (gradeLevel && !showAllOverride) {
      const gNum = typeof gradeLevel === 'string' ? parseInt(gradeLevel, 10) : gradeLevel;
      const filtered = allClasses.filter(cls => {
         const clsGrade = typeof cls.gradeLevel === 'string' ? parseInt(cls.gradeLevel, 10) : cls.gradeLevel;
         return clsGrade === gNum;
      });
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(allClasses);
    }
    setSelectedClass(null);
  }, [gradeLevel, allClasses, showAllOverride]);

  const handleClassSelect = (cls: ClassDocument & { id: string }) => {
    setSelectedClass(cls);
    if (onSelect) onSelect(cls.classCode);
    setModalVisible(false);
  };

  const currentList = showAllOverride || !gradeLevel ? allClasses : filteredClasses;

  if (loading) {
    return (
      <View style={{ paddingVertical: 10, alignItems: 'center', width: '90%', alignSelf: 'center' }}>
        <ActivityIndicator size="small" color="#2ecc71" />
        <Text style={{ fontSize: 10, color: '#bdc3c7', marginTop: 4 }}>Hinahanap ang mga klase...</Text>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        style={[
          signup.textInputForm,
          { 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            paddingHorizontal: 16,
            marginBottom: filteredClasses.length === 0 && gradeLevel && !showAllOverride ? 4 : 8
          }
        ]}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 15, color: selectedClass ? '#1b2e23' : '#999', fontFamily: 'Satoshi-Medium' }}>
          {selectedClass ? selectedClass.className : 'Pumili sa listahan...'}
        </Text>
        <Text style={{ fontSize: 12, color: '#8fafa0' }}>▼</Text>
      </TouchableOpacity>

      {!showAllOverride && filteredClasses.length === 0 && gradeLevel && (
        <TouchableOpacity onPress={() => setShowAllOverride(true)} style={{ alignSelf: 'center', marginBottom: 8 }}>
           <Text style={{ fontSize: 11, color: '#2ecc71', fontWeight: 'bold', textDecorationLine: 'underline' }}>
             Ipakita ang lahat ng klase
           </Text>
        </TouchableOpacity>
      )}

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
            
            {currentList.length > 0 ? (
              <FlatList
                data={currentList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      localS.option,
                      selectedClass?.id === item.id && localS.selectedOption
                    ]}
                    onPress={() => handleClassSelect(item)}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingHorizontal: 16 }}>
                      <Text style={[
                        localS.optionText,
                        selectedClass?.id === item.id && localS.selectedOptionText
                      ]}>
                        {item.className}
                      </Text>
                      <View style={{ backgroundColor: '#f0faf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: '#2ecc71', fontWeight: 'bold' }}>{item.classCode}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={{ textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }}>
                Walang available na klase.
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
    maxHeight: '70%',
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
});
