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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getAuth } from '@react-native-firebase/auth';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import myClass from '../../UI_Designs/MyClassStyles';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import { archiveClass, createCustomClass } from '../../Controller/AuthenticationController';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import { getAcademicYearOptions } from '../../Utilities/acadYearUtils';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';
import { Icon } from '../../Components/GlobalUse/Icon';
import { sw } from '../../Utils/responsive';
import { FacultyColors } from '../../Utilities/Theme';

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
  const [isArchiving, setIsArchiving] = useState(false);

  const ignoreNextTouchRef = useRef(false);

  const currentUser = getAuth().currentUser;
  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout, handleClassStudents, handleNextStep } = useNavigationHelper();

  // ========================================================================
  // FETCH CLASSES
  // ========================================================================
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe =
      getFacultyClasses_Student.getToFacultyClassesRealTime(
        currentUser.uid,
        classes => {
          setClasses(classes.filter(c => c.status === 'active'));
          setLoading(false);
        },
      );

    return unsubscribe;
  }, [currentUser]);


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

  const handleArchivePress = async (classItem: ClassDocument) => {
    Alert.alert(
      'Archive Class',
      `Are you sure you want to archive "${classItem.className}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveClass(classItem.classId, currentUser?.uid || '');
              Alert.alert('Success', 'Class archived successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to archive class');
            } finally {
              setIsArchiving(false);
            }
          },
        },
      ],
    );
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
      style={myClass.classCard}
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
        <BubbleBackground />


        {/* UNIFIED HEADER ROW: spacer | SVG title | menu button */}
        <View style={facultyDashboard.header}>
          {/* Left spacer balances the menu button so title is truly centered */}
          <View style={{ width: 44 }} />

          {/* SVG outlined title */}
          <Svg height={56} width={220}>
            {/* Stroke layer — outline effect */}
            <SvgText
              x={110} y={38} fontSize={24}
              fontFamily="Satoshi-Black" textAnchor="middle"
              fill="none"
              stroke="#E8F5EE"
              strokeWidth={8}
              strokeLinejoin="round"
            >
              My Classes
            </SvgText>
            {/* Fill layer — drawn on top */}
            <SvgText
              x={110} y={38} fontSize={24}
              fontFamily="Satoshi-Black" textAnchor="middle"
              fill="#1B2B22"
            >
              My Classes
            </SvgText>
          </Svg>

          {/* Right: hamburger menu button */}
          <TouchableOpacity
            style={facultyDashboard.menuBtn}
            onPress={() => setMenuVisible(v => !v)}
            activeOpacity={0.7}
          >
            <MenuBars />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject as any}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
            <View style={facultyDashboard.dropdown}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); handleNextStep('About'); }}
                style={facultyDashboard.dropdownItem}
                activeOpacity={0.75}
              >
                <Icon name="info" size={sw(20)} color={FacultyColors.slate} filled />
                <Text style={facultyDashboard.dropdownTextAbout}>About</Text>
              </TouchableOpacity>
              <View style={facultyDashboard.dropdownDivider} />
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
                style={facultyDashboard.dropdownItem}
                activeOpacity={0.75}
              >
                <Image
                  source={require('../../../assets/icons/Logout-icon.png')}
                  style={facultyDashboard.dropdownIcon}
                />
                <Text style={facultyDashboard.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
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
                {/* EDIT CLASS */}
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

                {/* ARCHIVE CLASS */}
                <TouchableOpacity
                  style={[myClass.contextMenuItem, myClass.archiveMenuItem]}
                  onPress={() => handleArchivePress(selectedClass)}
                >
                  <Image
                    source={require('../../../assets/icons/Archive-icon.png')}
                    style={myClass.contextMenuIcon}
                  />
                  <Text
                    style={myClass.contextMenuText}
                  >
                    Archive Class
                  </Text>
                </TouchableOpacity>

                {/* DELETE CLASS */}
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
      </View>
    </SafeAreaView>
  );
}

// ─── Hamburger icon ───────────────────────────────────────────────────────────
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
    </View>
  );
}
