import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
import { useNavigationHelper } from '../../Controller/NavigationController';
import {
  getAllClasses,
  getUsersByRole,
  createCustomClass,
  archiveClass,
  unarchiveClass,
  deleteClassByAdmin,
} from '../../Controller/AuthenticationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ClassDocument, UserDocument } from '../../Interfaces/dataInterfaces';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import Sidebar from '../../Components/GlobalUse/Sidebar';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { Icon } from '../../Components/GlobalUse/Icon';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import { buildAdminMenuItems } from '../../Utilities/adminMenuItems';
import {
  getCurrentAcademicYear,
  getAcademicYearOptions,
  formatAcademicYear,
} from '../../Utilities/acadYearUtils';
import { FacultyColors } from '../../Utilities/Theme';
import myClass from '../../UI_Designs/MyClassStyles';
import adminUserManagment from '../../UI_Designs/AdminUserManagementStyles';
import adminDashboard from '../../UI_Designs/AdminDashboardStyles';

export default function AdminClassManagement() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [selectedAcadYear, setSelectedAcadYear] = useState<string>(
    getCurrentAcademicYear(),
  );
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Teachers (for the create-class picker)
  const [teachers, setTeachers] = useState<UserDocument[]>([]);

  // Create class modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('1');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit (rename) modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingClassName, setEditingClassName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Ellipsis context menu
  const [ellipsisVisible, setEllipsisVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // ========================================================================
  // HOOKS
  // ========================================================================
  const { handleLogout, handleReplaceStep, handleAdminClassDashboard } =
    useNavigationHelper();
  const menuItems = buildAdminMenuItems(handleReplaceStep);
  const academicYearOptions = getAcademicYearOptions();

  // ========================================================================
  // FETCH CLASSES BY ACADEMIC YEAR
  // Reuses the existing paginated getAllClasses with a high limit so a full
  // year's classes are returned in one shot (admin view, no pagination UI).
  // ========================================================================
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const { classes: result } = await getAllClasses({
        acadYear: selectedAcadYear,
        limitOverride: 300,
      });
      setClasses(result);
    } catch (error: any) {
      console.error('Failed to fetch classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAcadYear]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Load the list of available teachers once for the create picker.
  const fetchTeachers = useCallback(async () => {
    try {
      const { faculty } = await getUsersByRole('faculty');
      setTeachers(faculty);
    } catch (error: any) {
      console.error('Failed to fetch teachers:', error);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // ========================================================================
  // EVENT HANDLERS — chrome
  // ========================================================================
  const toggleMenu = () => setSidebarVisible(prev => !prev);
  const handleLogoutPress = () => {
    setSidebarVisible(false);
    setLogoutVisible(true);
  };
  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };
  const cancelLogout = () => setLogoutVisible(false);

  // ========================================================================
  // CREATE CLASS (acad year is automatic — current school year)
  // ========================================================================
  const handleCreateClassPress = () => {
    setNewClassName('');
    setGradeLevel('1');
    setSelectedTeacherId('');
    setShowTeacherDropdown(false);
    setCreateModalVisible(true);
  };

  const teacherFullName = (t: UserDocument) =>
    `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || t.email || 'Unnamed';

  const selectedTeacher = teachers.find(t => t.uid === selectedTeacherId);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }
    if (!selectedTeacherId) {
      Alert.alert('Error', 'Please assign a teacher to this class');
      return;
    }
    try {
      setIsCreating(true);
      const selectedGrade = parseInt(gradeLevel, 10);
      const classCode = await createCustomClass(
        selectedTeacherId,
        newClassName.trim(),
        selectedGrade,
      );
      Alert.alert(
        'Class Created 🎉',
        `Class Name: ${newClassName}\nTeacher: ${
          selectedTeacher ? teacherFullName(selectedTeacher) : ''
        }\nGrade: ${selectedGrade}\nCode: ${classCode}`,
      );
      setCreateModalVisible(false);
      await fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  // ========================================================================
  // ELLIPSIS CONTEXT MENU
  // ========================================================================
  const handleEllipsisPress = (event: any, item: ClassDocument) => {
    // measureInWindow gives coordinates relative to the app window, which
    // matches the context menu now rendered at the SafeAreaView root. Right-
    // align the menu under the ellipsis (menu min width is 180).
    const MENU_WIDTH = 180;
    event.target.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setMenuPosition({
          x: Math.max(8, x + width - MENU_WIDTH),
          y: y + height + 4,
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

  // ========================================================================
  // EDIT / RENAME
  // ========================================================================
  const handleEditPress = (classItem: ClassDocument) => {
    setSelectedClass(classItem);
    setEditingClassName(classItem.className ?? '');
    setEllipsisVisible(false);
    setEditModalVisible(true);
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
        await fetchClasses();
      }
    } catch (error: any) {
      console.error('Failed to edit class:', error);
      Alert.alert('Error', error.message || 'Failed to update class name');
    } finally {
      setIsUpdating(false);
    }
  };

  // ========================================================================
  // ARCHIVE / UNARCHIVE / DELETE
  // ========================================================================
  const handleArchivePress = (classItem: ClassDocument) => {
    setEllipsisVisible(false);
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
              await archiveClass(
                classItem.classId,
                getAuth().currentUser?.uid || '',
              );
              Alert.alert('Success', 'Class archived successfully');
              await fetchClasses();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to archive class');
            }
          },
        },
      ],
    );
  };

  const handleUnarchivePress = (classItem: ClassDocument) => {
    setEllipsisVisible(false);
    Alert.alert(
      'Unarchive Class',
      `Restore "${classItem.className}" to active classes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unarchive',
          onPress: async () => {
            try {
              await unarchiveClass(classItem.classId);
              Alert.alert('Success', 'Class unarchived successfully');
              await fetchClasses();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unarchive class');
            }
          },
        },
      ],
    );
  };

  const handleDeletePress = (classItem: ClassDocument) => {
    setEllipsisVisible(false);
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
              await deleteClassByAdmin(classItem.classId);
              Alert.alert(
                'Success',
                `Class "${classItem.className || classItem.classId}" deleted successfully.`,
              );
              await fetchClasses();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete class');
            }
          },
        },
      ],
    );
  };

  // ========================================================================
  // RENDER CLASS CARD
  // ========================================================================
  const renderClassItem = ({ item }: { item: ClassDocument }) => {
    const isArchived = item.status === 'archived';
    const studentCount = item.studentIds?.length ?? 0;
    return (
      <TouchableOpacity
        style={[myClass.classCard, isArchived && myClass.archivedClassCard]}
        activeOpacity={0.7}
        onPress={() => {
          if (ellipsisVisible) {
            handleEllipsisClose();
            return;
          }
          handleAdminClassDashboard({
            classId: item.classId,
            className: item.className,
            acadYear: item.acadYear,
            facultyId: item.facultyId,
            gradeLevel: item.gradeLevel,
            studentCount,
          });
        }}
      >
        <View
          style={[
            myClass.classCardContent,
            isArchived && myClass.archivedClassCardContent,
          ]}
        >
          {/* Class Icon */}
          <View
            style={[
              myClass.classIconContainer,
              isArchived && myClass.archivedClassIconContainer,
            ]}
          >
            <Icon
              name="classroom"
              size={22}
              color={isArchived ? FacultyColors.slate : FacultyColors.primary}
            />
          </View>

          {/* Class Info */}
          <View style={myClass.classInfo}>
            <Text
              style={[myClass.className, isArchived && myClass.archivedClassName]}
              numberOfLines={1}
            >
              {item.className || 'Untitled Class'}
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
              <View style={myClass.classMetaChip}>
                <Text style={myClass.classMetaLabel}>Students</Text>
                <Text style={myClass.classMetaValue}>{studentCount}</Text>
              </View>
              <View
                style={[
                  myClass.classMetaChip,
                  isArchived && myClass.archivedMetaChip,
                ]}
              >
                <Text
                  style={[
                    myClass.classMetaLabel,
                    isArchived && myClass.archivedMetaLabel,
                  ]}
                >
                  Status
                </Text>
                <Text
                  style={[
                    myClass.classMetaValue,
                    isArchived && myClass.archivedMetaValue,
                  ]}
                >
                  {isArchived ? 'Archived' : 'Active'}
                </Text>
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
  };

  return (
    <SafeAreaView style={adminUserManagment.safeArea}>
      {/* ✅ OVERLAY — inside SafeAreaView, outside container */}
        {ellipsisVisible && (
          <TouchableOpacity
            style={myClass.fullScreenOverlay}
            onPress={handleEllipsisClose}
            activeOpacity={1}
          />
        )}

        {/* ✅ CONTEXT MENU — inside SafeAreaView, outside container */}
        {ellipsisVisible && selectedClass && (
          <View
            style={[
              myClass.contextMenu,
              { top: menuPosition.y, left: menuPosition.x },
            ]}
          >
            <TouchableOpacity
              style={myClass.contextMenuItem}
              onPress={() => handleEditPress(selectedClass)}
            >
              <Icon name="edit" size={20} color={FacultyColors.ink} />
              <Text style={[myClass.contextMenuText, styles.menuTextSpacing]}>
                Edit Class
              </Text>
            </TouchableOpacity>

            {selectedClass.status === 'archived' ? (
              <TouchableOpacity
                style={[myClass.contextMenuItem, myClass.archiveMenuItem]}
                onPress={() => handleUnarchivePress(selectedClass)}
              >
                <Icon name="unarchive" size={20} color={FacultyColors.primary} />
                <Text style={[myClass.contextMenuText, styles.menuTextSpacing]}>
                  Unarchive Class
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[myClass.contextMenuItem, myClass.archiveMenuItem]}
                onPress={() => handleArchivePress(selectedClass)}
              >
                <Icon name="archive" size={20} color={FacultyColors.orange} />
                <Text style={[myClass.contextMenuText, styles.menuTextSpacing]}>
                  Archive Class
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[myClass.contextMenuItem, myClass.deleteMenuItem]}
              onPress={() => handleDeletePress(selectedClass)}
            >
              <Icon name="trash" size={20} color={FacultyColors.red} />
              <Text style={[myClass.contextMenuText, myClass.deleteMenuText, styles.menuTextSpacing]}>
                Delete Class
              </Text>
            </TouchableOpacity>
          </View>
        )}

      <View style={adminUserManagment.container}>
        <BubbleBackground />
       
        {/* COMPACT HEADER */}
        <View style={adminUserManagment.headerRow}>
          {/* Spacer to balance the menu button so the title stays centered */}
          <View style={{ width: 44 }} />
          <Text style={adminUserManagment.title}>Class Management</Text>
          <TouchableOpacity
            onPress={toggleMenu}
            style={adminDashboard.menuBtn}
            activeOpacity={0.7}
          >
            <MenuBars />
          </TouchableOpacity>
        </View>

        {/* Sidebar navigation */}
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onLogout={handleLogoutPress}
          currentRoute="class-management"
          menuItems={menuItems}
        />

        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        {/* MAIN CONTENT */}
        <View style={adminUserManagment.content}>
          
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

          {/* YEAR FILTER DROPDOWN */}
          <View style={adminDashboard.yearFilterContainer}>
            <Text style={adminDashboard.yearFilterLabel}>
              Filter Classes by Academic Year
            </Text>
            <TouchableOpacity
              style={adminDashboard.filterDropdownButton}
              onPress={() => setShowYearDropdown(prev => !prev)}
              activeOpacity={0.7}
            >
              <Icon name="calendar" size={18} color={FacultyColors.primary} />
              <Text
                style={[
                  adminDashboard.filterDropdownButtonText,
                  { marginLeft: 10 },
                ]}
              >
                {formatAcademicYear(selectedAcadYear)}
              </Text>
              <View style={adminDashboard.filterDropdownChevron}>
                <Icon name="chevron-down" size={16} color={FacultyColors.slate} />
              </View>
            </TouchableOpacity>

            {showYearDropdown && (
              <View style={adminDashboard.filterDropdownMenu}>
                {academicYearOptions.map(year => {
                  const isSelected = selectedAcadYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[
                        adminDashboard.filterDropdownItem,
                        isSelected && adminDashboard.filterDropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedAcadYear(year);
                        setShowYearDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          adminDashboard.filterDropdownItemText,
                          isSelected &&
                            adminDashboard.filterDropdownItemTextSelected,
                        ]}
                      >
                        {formatAcademicYear(year)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* CLASS COUNT */}
          {!loading && classes.length > 0 && (
            <View style={adminUserManagment.userCountContainer}>
              <Text style={adminUserManagment.userCount}>
                {classes.length} Class{classes.length !== 1 ? 'es' : ''} in{' '}
                {formatAcademicYear(selectedAcadYear)}
              </Text>
            </View>
          )}

          {/* CLASSES LIST */}
          <View style={adminUserManagment.listWrapper}>
            {loading ? (
              <View style={myClass.loadingContainer}>
                <ActivityIndicator size="large" color={FacultyColors.primary} />
                <Text style={myClass.loadingText}>Loading classes...</Text>
              </View>
            ) : (
              <FlatList
                data={classes}
                renderItem={renderClassItem}
                keyExtractor={item => item.classId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={myClass.listContent}
                ListEmptyComponent={
                  <View style={myClass.emptyContainer}>
                    <Text style={myClass.emptyIcon}>📭</Text>
                    <Text style={myClass.emptyTitle}>No classes found</Text>
                    <Text style={myClass.emptyText}>
                      There are no classes for{' '}
                      {formatAcademicYear(selectedAcadYear)}.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>

        {/* CREATE CLASS MODAL */}
        <Modal
          visible={createModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => !isCreating && setCreateModalVisible(false)}
        >
          <View style={myClass.modalOverlay}>
            <View style={myClass.modalContainer}>
              <Text style={myClass.modalTitle}>Create New Class</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Class name */}
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

                {/* Teacher picker */}
                <View style={myClass.formGroup}>
                  <Text style={myClass.formLabel}>Assign Teacher *</Text>
                  <TouchableOpacity
                    style={[myClass.modalInput, styles.pickerButton]}
                    onPress={() => setShowTeacherDropdown(prev => !prev)}
                    activeOpacity={0.7}
                    disabled={isCreating}
                  >
                    <Text
                      style={
                        selectedTeacher
                          ? styles.pickerValue
                          : styles.pickerPlaceholder
                      }
                      numberOfLines={1}
                    >
                      {selectedTeacher
                        ? teacherFullName(selectedTeacher)
                        : 'Select a teacher'}
                    </Text>
                    <Icon
                      name="chevron-down"
                      size={16}
                      color={FacultyColors.slate}
                    />
                  </TouchableOpacity>

                  {showTeacherDropdown && (
                    <View style={styles.teacherList}>
                      {teachers.length === 0 ? (
                        <Text style={styles.teacherEmpty}>
                          No teachers available
                        </Text>
                      ) : (
                        <ScrollView
                          style={styles.teacherScroll}
                          nestedScrollEnabled
                          showsVerticalScrollIndicator
                        >
                          {teachers.map(t => {
                            const isSel = t.uid === selectedTeacherId;
                            return (
                              <TouchableOpacity
                                key={t.uid}
                                style={[
                                  styles.teacherItem,
                                  isSel && styles.teacherItemSelected,
                                ]}
                                onPress={() => {
                                  setSelectedTeacherId(t.uid);
                                  setShowTeacherDropdown(false);
                                }}
                                activeOpacity={0.7}
                              >
                                <Text
                                  style={[
                                    styles.teacherItemText,
                                    isSel && styles.teacherItemTextSelected,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {teacherFullName(t)}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      )}
                    </View>
                  )}
                </View>

                {/* Grade level */}
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
                    • The class is created for the current school year
                  </Text>
                  <Text style={myClass.modalInfoText}>
                    • A unique class code will be generated
                  </Text>
                  <Text style={myClass.modalInfoText}>
                    • The assigned teacher manages the class
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
                    (!newClassName.trim() || !selectedTeacherId) &&
                      myClass.createClassButtonDisabled,
                  ]}
                  onPress={handleCreateClass}
                  disabled={
                    isCreating || !newClassName.trim() || !selectedTeacherId
                  }
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

        {/* EDIT (RENAME) MODAL */}
        <Modal
          visible={editModalVisible}
          transparent
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
                autoFocus
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
    </SafeAreaView>
  );
}

// Hamburger icon — mirrors Admin Dashboard / Faculty dashboard
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 12, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
      <View style={{ width: 18, height: 2.5, borderRadius: 6, backgroundColor: FacultyColors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Context-menu text needs a little gap from the Icon (the shared style
  // assumes an Image with its own marginRight).
  menuTextSpacing: {
    marginLeft: 12,
  },

  // Teacher picker (inside the create modal)
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.ink,
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#999',
  },
  teacherList: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: FacultyColors.slate,
    borderRadius: 10,
    backgroundColor: FacultyColors.white,
    overflow: 'hidden',
  },
  teacherScroll: {
    maxHeight: 180,
  },
  teacherItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  teacherItemSelected: {
    backgroundColor: 'rgba(0, 132, 67, 0.08)',
  },
  teacherItemText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.inkLight,
  },
  teacherItemTextSelected: {
    fontFamily: 'Satoshi-Bold',
    color: FacultyColors.primary,
  },
  teacherEmpty: {
    padding: 14,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: FacultyColors.slate,
    textAlign: 'center',
  },
});
