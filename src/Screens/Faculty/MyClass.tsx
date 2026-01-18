import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../ui/BubblesDesign';
import upperNav from '../../ui/UpperNavigation';
import LogoutModal from '../../Components/Buttons/LogoutModal';
import BottomNav from '../../Components/NavigationBar/BottomNav';
import { getAuth } from '@react-native-firebase/auth';
import { ClassDocument } from '../../Types/dataInterfaces';
import { getFacultyClasses_Student } from '../../Hooks/useFacultyClasses_Students';
import myClass from '../../ui/MyClassStyles';
import { createCustomClass } from '../../Controller/AuthenticationController';
import GradeLevelDropDownSelection from '../../Components/Buttons/GradeLevelSelectionButton';
import AcademicYearDropDownSelection from '../../Components/Buttons/AcademicYearDropdown';
import { getAcademicYearOptions } from '../../Utils/acadYearUtils';

export default function MyClass() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ellipsisVisible, setEllipsisVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(
    null,
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingClassName, setEditingClassName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('1');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const ignoreNextTouchRef = useRef(false);

  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout, handleClassStudents } = useNavigationHelper();

  // ========================================================================
  // FETCH CLASSES
  // ========================================================================
  const fetchClasses = useCallback(async () => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const facultyClasses = await getFacultyClasses_Student.getFacultyClasses(
        currentUser.uid,
      );
      setClasses(facultyClasses);
    } catch (error: any) {
      throw new Error('Failed to Fetch Classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  useEffect(() => {
    if (ellipsisVisible) {
      ignoreNextTouchRef.current = false;
    }
  }, [ellipsisVisible]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  const handleCreateClassPress = () => {
    setNewClassName('');
    setGradeLevel('1');
    const academicYears = getAcademicYearOptions();
    setAcademicYear(academicYears[0]);
    setCreateModalVisible(true);
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsCreating(true);
      const selectedGrade = parseInt(gradeLevel, 10);
      const classCode = await createCustomClass(
        currentUser.uid,
        newClassName.trim(),
        selectedGrade,
      );
      await fetchClasses();
      Alert.alert(
        'Class Created 🎉',
        `Class Name: ${newClassName}\nGrade: ${selectedGrade}\nCode: ${classCode}`,
      );
      setCreateModalVisible(false);
      setNewClassName('');
      setGradeLevel('1');
      setAcademicYear('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPress = (classItem: ClassDocument) => {
    setSelectedClass(classItem);
    setEditingClassName(classItem.className ?? '');
    setEllipsisVisible(false);
    setEditModalVisible(true);
  };

  const handleEllipsisPress = (event: any, item: ClassDocument) => {
    event.target.measure(
      (
        fx: number,
        fy: number,
        width: number,
        height: number,
        px: number,
        py: number,
      ) => {
        setMenuPosition({
          x: px - 100,
          y: py + height,
        });
        setSelectedClass(item);
        setEllipsisVisible(true);
      },
    );
  };

  const handleEllipsisClose = () => {
    setEllipsisVisible(false);
    setSelectedClass(null);
    setMenuPosition({ x: 0, y: 0 });
  };

  const handleContentTouch = () => {
    if (ellipsisVisible) {
      setEllipsisVisible(false);
      setSelectedClass(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedClass || !editingClassName.trim()) {
      Alert.alert('Error', 'Class name cannot be empty');
      return;
    }

    if (editingClassName === selectedClass.className) {
      setEditModalVisible(false);
      return;
    }

    try {
      setIsUpdating(true);
      const result = await getFacultyClasses_Student.editClass(
        selectedClass.classId,
        editingClassName.trim(),
        {},
      );

      if (result.success) {
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.classId === selectedClass.classId
              ? { ...cls, className: editingClassName.trim() }
              : cls,
          ),
        );
        Alert.alert('Success', result.message);
        setEditModalVisible(false);
      }
    } catch (error: any) {
      console.error('Failed to edit class:', error);
      Alert.alert('Error', error.message || 'Failed to update class name');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePress = async (classItem: ClassDocument) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.className}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await getFacultyClasses_Student.deleteClass(
                classItem.classId,
              );
              if (result.success) {
                setClasses(prevClasses =>
                  prevClasses.filter(cls => cls.classId !== classItem.classId),
                );
                Alert.alert('Success', result.message);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete class');
            }
            setEllipsisVisible(false);
          },
        },
      ],
    );
  };

  const renderClassItem = ({
    item,
    index,
  }: {
    item: ClassDocument;
    index: number;
  }) => (
    <TouchableOpacity
      style={[myClass.classCard, { marginTop: index === 0 ? 0 : 12 }]}
      onPress={() => {
        if (ellipsisVisible) {
          setEllipsisVisible(false);
          setSelectedClass(null);
        }
        handleClassStudents({
          classId: item.classId,
          className: item.className,
          classCode: item.classCode,
          acadYear: item.acadYear,
        });
      }}
      activeOpacity={0.7}
    >
      <View style={myClass.classCardContent}>
        {/* Class Icon */}
        <View style={myClass.classIconContainer}>
          <Text style={myClass.classIcon}>📚</Text>
        </View>

        {/* Class Info */}
        <View style={myClass.classInfo}>
          <Text style={myClass.className} numberOfLines={1}>
            {item.className}
            <Text style={myClass.classMetaValue}> ({item.acadYear})</Text>
          </Text>

          <View style={myClass.classMetaRow}>
            <View style={myClass.classMetaChip}>
              <Text style={myClass.classMetaLabel}>Grade</Text>
              <Text style={myClass.classMetaValue}>{item.gradeLevel}</Text>
            </View>
            <View style={myClass.classMetaChip}>
              <Text style={myClass.classMetaLabel}>Code</Text>
              <Text style={myClass.classMetaValue}>{item.classCode}</Text>
            </View>
          </View>
        </View>

        {/* Ellipsis Button */}
        <TouchableOpacity
          style={myClass.ellipsisButton}
          onPress={event => handleEllipsisPress(event, item)}
        >
          <Image
            style={myClass.ellipsisIcon}
            source={require('../../../assets/icons/Ellipsis-icon.png')}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={myClass.container}>
      {ellipsisVisible && (
        <TouchableOpacity
          style={myClass.fullScreenOverlay}
          onPress={handleEllipsisClose}
          activeOpacity={1}
        />
      )}

      <View style={myClass.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        {/* HEADER */}
        <View style={upperNav.header}>
          <Image
            style={upperNav.ciscLogo}
            source={require('../../../assets/images/cisckids.png')}
          />
          <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
            <Image
              style={upperNav.menuIcon}
              source={require('../../../assets/icons/Menu-icon.png')}
            />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        {/* MAIN CONTENT */}
        <View style={myClass.content}>
          {/* ELLIPSIS CONTEXT MENU */}
          {ellipsisVisible && selectedClass && (
            <>
              <TouchableOpacity
                style={myClass.overlay}
                onPress={handleEllipsisClose}
                activeOpacity={1}
              />
              <View
                style={[
                  myClass.contextMenu,
                  { top: menuPosition.y, left: menuPosition.x },
                ]}
                pointerEvents="box-none"
              >
                <TouchableOpacity
                  style={myClass.contextMenuItem}
                  onPress={() => handleEditPress(selectedClass)}
                >
                  <Image
                    source={require('../../../assets/icons/Edit-icon.png')}
                    style={myClass.contextMenuIcon}
                  />
                  <Text style={myClass.contextMenuText}>Edit Class</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[myClass.contextMenuItem, myClass.deleteMenuItem]}
                  onPress={() => handleDeletePress(selectedClass)}
                >
                  <Image
                    source={require('../../../assets/icons/Delete-icon.png')}
                    style={myClass.contextMenuIcon}
                  />
                  <Text
                    style={[myClass.contextMenuText, myClass.deleteMenuText]}
                  >
                    Delete Class
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* HEADER SECTION */}
          <View style={myClass.headerSection}>
            <Text style={myClass.pageTitle}>My Classes</Text>
            <Text style={myClass.pageSubtitle}>
              Manage and organize your classes
            </Text>
          </View>

          {/* CREATE NEW CLASS BUTTON */}
          <TouchableOpacity
            style={myClass.createButton}
            onPress={handleCreateClassPress}
          >
            <View style={myClass.createButtonContent}>
              <View style={myClass.createButtonIconWrapper}>
                <Image
                  source={require('../../../assets/icons/Add-icon.png')}
                  style={myClass.createButtonIcon}
                />
              </View>
              <Text style={myClass.createButtonText}>Create New Class</Text>
            </View>
          </TouchableOpacity>

          {/* CLASS COUNT */}
          {classes.length > 0 && (
            <Text style={myClass.classCount}>
              {classes.length} Class{classes.length !== 1 ? 'es' : ''}
            </Text>
          )}

          {/* CLASSES LIST */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleContentTouch}
            style={myClass.listWrapper}
          >
            <View style={myClass.classListContainer}>
              {loading ? (
                <View style={myClass.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={myClass.loadingText}>Loading classes...</Text>
                </View>
              ) : classes.length > 0 ? (
                <FlatList
                  data={classes}
                  renderItem={renderClassItem}
                  keyExtractor={item => item.classId}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={myClass.listContent}
                />
              ) : (
                <View style={myClass.emptyContainer}>
                  <Text style={myClass.emptyIcon}>📖</Text>
                  <Text style={myClass.emptyTitle}>No classes yet</Text>
                  <Text style={myClass.emptyText}>
                    Create your first class to get started
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* CREATE CLASS MODAL */}
          <Modal
            visible={createModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => !isCreating && setCreateModalVisible(false)}
          >
            <View style={myClass.modalOverlay}>
              <View style={myClass.modalContainer}>
                <Text style={myClass.modalTitle}>Create New Class</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={myClass.formGroup}>
                    <Text style={myClass.formLabel}>Class Name *</Text>
                    <TextInput
                      style={myClass.modalInput}
                      value={newClassName}
                      onChangeText={setNewClassName}
                      placeholder="e.g., Grade 1 Section A"
                      placeholderTextColor="#999"
                      editable={!isCreating}
                    />
                  </View>

                  <View style={myClass.formGroup}>
                    <Text style={myClass.formLabel}>Grade Level *</Text>
                    <GradeLevelDropDownSelection
                      onSelect={(selectedGrade: number) =>
                        setGradeLevel(selectedGrade.toString())
                      }
                    />
                    <Text style={myClass.formHelperText}>
                      Selected: Grade {gradeLevel}
                    </Text>
                  </View>

                  <View style={myClass.modalInfoBox}>
                    <Text style={myClass.modalInfoTitle}>💡 Quick Info</Text>
                    <Text style={myClass.modalInfoText}>
                      • A unique class code will be generated
                    </Text>
                    <Text style={myClass.modalInfoText}>
                      • Share the code with students to join
                    </Text>
                    <Text style={myClass.modalInfoText}>
                      • Edit class details anytime
                    </Text>
                  </View>
                </ScrollView>

                <View style={myClass.modalButtons}>
                  <TouchableOpacity
                    style={[myClass.modalButton, myClass.cancelButton]}
                    onPress={() => setCreateModalVisible(false)}
                    disabled={isCreating}
                  >
                    <Text style={myClass.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      myClass.modalButton,
                      myClass.createClassButton,
                      !newClassName.trim() && myClass.createClassButtonDisabled,
                    ]}
                    onPress={handleCreateClass}
                    disabled={isCreating || !newClassName.trim()}
                  >
                    {isCreating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={myClass.createClassButtonText}>
                        Create Class
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* EDIT MODAL */}
          <Modal
            visible={editModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => !isUpdating && setEditModalVisible(false)}
          >
            <View style={myClass.modalOverlay}>
              <View style={myClass.modalContainer}>
                <Text style={myClass.modalTitle}>Edit Class Name</Text>

                <TextInput
                  style={myClass.modalInput}
                  value={editingClassName}
                  onChangeText={setEditingClassName}
                  placeholder="Enter class name"
                  autoFocus={true}
                  editable={!isUpdating}
                />

                <View style={myClass.modalButtons}>
                  <TouchableOpacity
                    style={[myClass.modalButton, myClass.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                    disabled={isUpdating}
                  >
                    <Text style={myClass.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[myClass.modalButton, myClass.saveButton]}
                    onPress={handleSaveEdit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={myClass.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}
