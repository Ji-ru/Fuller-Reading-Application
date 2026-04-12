import { getAuth } from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { ArchiveIcon, BookOpenIcon, EditIcon, TrashIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import { createCustomClass } from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';

const { width: SW } = Dimensions.get('window');

export default function MyClass() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ellipsisVisible, setEllipsisVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingGrade, setEditingGrade] = useState<string>('1');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('1');

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'archive' | 'delete'>('archive');

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [nameError, setNameError] = useState(false);

  const filterOptions = ['All', 'Grade 1', 'Grade 2', 'Grade 3'];

  const { handleLogout, handleClassStudents } = useNavigationHelper();
  const route = useRoute();

  const fetchClasses = useCallback(async () => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      const facultyClasses = await getFacultyClasses_Student.getFacultyClasses(currentUser.uid);
      setClasses(facultyClasses);
    } catch (error: any) {
      console.log('Fetch classes error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const handleCreateClassPress = () => {
    setNewClassName('');
    setGradeLevel('1');
    setNameError(false);
    setCreateModalVisible(true);
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      setNameError(true);
      return;
    }
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    try {
      setIsProcessing(true);
      const selectedGradeInt = parseInt(gradeLevel, 10);
      const classCode = await createCustomClass(currentUser.uid, newClassName.trim(), selectedGradeInt);
      await fetchClasses();
      Alert.alert('Class Created 🎉', `Success! Your class code is: ${classCode}`);
      setCreateModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create class');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPress = (classItem: ClassDocument) => {
    setSelectedClass(classItem);
    setEditingClassName(classItem.className ?? '');
    setEditingGrade(classItem.gradeLevel?.toString() || '1');
    setEllipsisVisible(false);
    setEditModalVisible(true);
  };

  const handleUpdateClass = async () => {
    if (!selectedClass || !editingClassName.trim()) return;
    try {
      setIsProcessing(true);
      await getFacultyClasses_Student.editClass(selectedClass.classId, editingClassName.trim(), {
        gradeLevel: parseInt(editingGrade, 10)
      });
      await fetchClasses();
      setEditModalVisible(false);
      Alert.alert('Success', 'Ang klase ay matagumpay na na-update.');
    } catch (error: any) {
      Alert.alert('Error', 'Hindi ma-update ang klase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionPress = (type: 'archive' | 'delete', classItem: ClassDocument) => {
    setSelectedClass(classItem);
    setActionType(type);
    setEllipsisVisible(false);
    setActionModalVisible(true);
  };

  const executeAction = async () => {
    if (!selectedClass) return;
    try {
      setIsProcessing(true);
      if (actionType === 'archive') {
        await getFacultyClasses_Student.archiveClass(selectedClass.classId, true);
        setClasses(prev => prev.filter(c => c.classId !== selectedClass.classId));
      } else {
        await getFacultyClasses_Student.deleteClass(selectedClass.classId);
        setClasses(prev => prev.filter(c => c.classId !== selectedClass.classId));
      }
      setActionModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', `Hindi ma-execute ang ${actionType}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEllipsisPress = (px: number, py: number, item: ClassDocument) => {
    const screenHeight = Dimensions.get('window').height;
    const menuHeight = 160; // Approximate height of the menu
    const shouldShowUpward = py + menuHeight > screenHeight - 60;

    setMenuPosition({
      x: px - 110,
      y: shouldShowUpward ? py - menuHeight : py + 20
    });
    setSelectedClass(item);
    setEllipsisVisible(true);
  };

  const filteredClassesList = classes.filter(c => {
    if (selectedFilter === 'All') return true;
    const gradeNum = parseInt(selectedFilter.replace(/\D/g, ''), 10);
    return c.gradeLevel === gradeNum;
  });

  const renderClassItem = ({ item }: { item: ClassDocument }) => (
    <TouchableOpacity
      style={S.classCard}
      onPress={() => handleClassStudents({
        classId: item.classId,
        className: item.className,
        classCode: item.classCode,
        acadYear: item.acadYear,
      })}
      activeOpacity={0.7}
    >
      <View style={S.classCardTop}>
        <View style={S.iconBox}>
          <BookOpenIcon size={22} color={F.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={S.className} numberOfLines={1}>{item.className}</Text>
          <Text style={S.classYear}>{item.acadYear} • Grade {item.gradeLevel}</Text>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            const { pageX, pageY } = e.nativeEvent;
            handleEllipsisPress(pageX, pageY, item);
          }}
          style={S.moreBtn}
        >
          <Text style={S.moreText}>•••</Text>
        </TouchableOpacity>
      </View>
      <View style={S.classCardFooter}>
        <View style={S.codeBadge}>
          <Text style={S.codeLabel}>Class Code:</Text>
          <Text style={S.codeVal}>{item.classCode}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={S.safeArea}>
      <View style={S.container}>
        {/* HEADER */}
        <View style={S.headerRow}>
          <TouchableOpacity style={S.menuBtn} onPress={toggleMenu}>
            <View style={S.menuDotLine} />
            <View style={[S.menuDotLine, { width: 14 }]} />
            <View style={S.menuDotLine} />
          </TouchableOpacity>
          <Image
            style={S.logo}
            source={require('../../../assets/images/cisckids.png')}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={S.loadingContainer}>
            <ActivityIndicator size="large" color={F.primary} />
            <Text style={S.loadingText}>Inaayos ang iyong mga klase...</Text>
          </View>
        ) : (
          <View style={S.content}>
            <FlatList
              data={filteredClassesList}
              renderItem={renderClassItem}
              keyExtractor={item => item.classId}
              ListHeaderComponent={
                <BounceIn delay={100}>
                  <View style={S.heroCard}>
                    <View>
                      <Text style={S.heroSubtitle}>Pamamahala ng Klase</Text>
                      <Text style={S.heroTitle}>Aking mga Klase</Text>
                    </View>
                    <BookOpenIcon size={48} color={F.primaryLight} />
                  </View>

                  <TouchableOpacity style={S.createBtn} onPress={handleCreateClassPress}>
                    <View style={S.createIconBox}>
                      <Text style={{ color: F.white, fontSize: 24, fontWeight: 'bold' }}>+</Text>
                    </View>
                    <Text style={S.createBtnText}>Gumawa ng Bagong Klase</Text>
                  </TouchableOpacity>

                  <Text style={S.listLabel}>Listahan ng mga Klase ({filteredClassesList.length})</Text>

                  <View style={S.filterBar}>
                    {filterOptions.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[S.filterChip, selectedFilter === option && S.filterChipActive]}
                        onPress={() => setSelectedFilter(option)}
                      >
                        <Text style={[S.filterText, selectedFilter === option && S.filterTextActive]}>
                          {option === 'All' ? 'Lahat' : option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </BounceIn>
              }
              contentContainerStyle={S.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={S.emptyBox}>
                  <BookOpenIcon size={64} color={F.slate} />
                  <Text style={S.emptyTitle}>Walang nahanap</Text>
                  <Text style={S.emptySub}>Subukan ang ibang filter o gumawa ng bagong klase.</Text>
                </View>
              }
            />
          </View>
        )}

        {/* FACULTY SIDE MENU */}
        <FacultySideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onLogout={handleLogoutPress}
          currentRoute={route.name}
        />

        <LogoutModal visible={logoutVisible} onCancel={cancelLogout} onConfirm={confirmLogout} />

        {/* KEBAB MENU */}
        <Modal visible={ellipsisVisible} transparent animationType="fade">
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
            activeOpacity={1}
            onPress={() => setEllipsisVisible(false)}
          />
          <View style={[S.contextMenu, { top: menuPosition.y, left: menuPosition.x }]} pointerEvents="box-none">
            <TouchableOpacity style={S.menuItem} onPress={() => handleEditPress(selectedClass!)}>
              <EditIcon size={18} color={F.primary} />
              <Text style={S.menuItemText}>I-edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.menuItem} onPress={() => handleActionPress('archive', selectedClass!)}>
              <ArchiveIcon size={18} color={F.primaryDeep} />
              <Text style={[S.menuItemText, { color: F.primaryDeep }]}>I-archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.menuItem, { borderBottomWidth: 0 }]} onPress={() => handleActionPress('delete', selectedClass!)}>
              <TrashIcon size={18} color={F.red} />
              <Text style={[S.menuItemText, { color: F.red }]}>I-delete</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* CREATE MODAL */}
        <Modal visible={createModalVisible} transparent animationType="slide">
          <View style={S.fullModalOverlay}>
            <View style={S.modalContent}>
              <Text style={S.modalHeader}>Bagong Klase</Text>
              <TextInput
                style={[S.input, nameError && { borderBottomColor: F.red }]}
                placeholder="Pangalan ng Klase (hal. Grade 1 - A)"
                value={newClassName}
                onChangeText={(t) => { setNewClassName(t); if (nameError) setNameError(false); }}
              />
              {nameError && <Text style={S.errorText}>* Ito ay kinakailangan</Text>}
              <Text style={S.modalLabel}>Grade Level</Text>
              <GradeLevelDropDownSelection transparent onSelect={(v) => setGradeLevel(v.toString())} />

              <View style={S.modalActions}>
                <TouchableOpacity style={S.cancelBtn} onPress={() => setCreateModalVisible(false)}><Text style={S.cancelBtnText}>I-cancel</Text></TouchableOpacity>
                <TouchableOpacity style={S.confirmBtn} onPress={handleCreateClass} disabled={isProcessing}><Text style={S.confirmBtnText}>{isProcessing ? '...' : 'Gumawa'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* EDIT MODAL */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={S.fullModalOverlay}>
            <View style={S.modalContent}>
              <Text style={S.modalHeader}>I-update ang Klase</Text>
              <TextInput
                style={S.input}
                placeholder="Pangalan ng Klase"
                value={editingClassName}
                onChangeText={setEditingClassName}
              />
              <Text style={S.modalLabel}>Grade Level</Text>
              <GradeLevelDropDownSelection transparent onSelect={(v) => setEditingGrade(v.toString())} />

              <View style={S.modalActions}>
                <TouchableOpacity style={S.cancelBtn} onPress={() => setEditModalVisible(false)}><Text style={S.cancelBtnText}>I-cancel</Text></TouchableOpacity>
                <TouchableOpacity style={S.confirmBtn} onPress={handleUpdateClass} disabled={isProcessing}><Text style={S.confirmBtnText}>{isProcessing ? '...' : 'I-update'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ACTION CONFIRMATION MODAL (Archive/Delete) */}
        <Modal visible={actionModalVisible} transparent animationType="fade">
          <View style={S.fullModalOverlay}>
            <View style={S.actionModal}>
              <View style={[S.actionIconBox, { backgroundColor: actionType === 'delete' ? F.red + '15' : F.primaryDeep + '15' }]}>
                {actionType === 'delete' ? <TrashIcon size={32} color={F.red} /> : <ArchiveIcon size={32} color={F.primaryDeep} />}
              </View>
              <Text style={S.actionTitle}>{actionType === 'delete' ? 'I-delete ang Klase?' : 'I-archive ang Klase?'}</Text>
              <Text style={S.actionSub}>Sigurado ka bang gusto mong {actionType === 'delete' ? 'i-delete' : 'i-archive'} ang "{selectedClass?.className}"?</Text>

              <View style={S.actionButtons}>
                <TouchableOpacity style={S.actionCancel} onPress={() => setActionModalVisible(false)}><Text style={S.actionCancelText}>Bumalik</Text></TouchableOpacity>
                <TouchableOpacity
                  style={[S.actionConfirm, { backgroundColor: actionType === 'delete' ? F.red : F.primaryDeep }]}
                  onPress={executeAction}
                  disabled={isProcessing}
                >
                  <Text style={S.actionConfirmText}>{isProcessing ? '...' : actionType === 'delete' ? 'I-delete' : 'I-archive'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: F.bg },
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
  logo: { width: 100, height: 90 },
  menuBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: F.white, justifyContent: 'center', alignItems: 'center', ...Shadows.subtle },
  menuDotLine: { width: 20, height: 2.5, backgroundColor: F.ink, borderRadius: 2, marginVertical: 2 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: F.white + '80', padding: 4, borderRadius: 16 },
  filterChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginHorizontal: 2 },
  filterChipActive: { backgroundColor: F.primaryDeep, ...Shadows.card },
  filterText: { fontSize: 12, fontWeight: '800', color: F.slate },
  filterTextActive: { color: F.white },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroCard: { backgroundColor: F.primaryDeep, borderRadius: Radii.xl, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, ...Shadows.cardLift },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: F.white, borderRadius: Radii.lg, padding: 16, marginBottom: 24, ...Shadows.card },
  createIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: F.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  createBtnText: { fontSize: 15, fontWeight: '800', color: F.ink },
  listLabel: { fontSize: 13, fontWeight: '800', color: F.slate, letterSpacing: 1, marginBottom: 16 },
  classCard: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  classCardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center' },
  className: { fontSize: 17, fontWeight: '800', color: F.ink },
  classYear: { fontSize: 12, color: F.slate, marginTop: 2, fontWeight: '600' },
  moreBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  moreText: { color: '#999', fontSize: 18, fontWeight: 'bold' },
  classCardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  codeBadge: { flexDirection: 'row', alignItems: 'center' },
  codeLabel: { fontSize: 12, color: F.slate, fontWeight: '600' },
  codeVal: { fontSize: 13, fontWeight: '800', color: F.primaryDeep, marginLeft: 6, textTransform: 'uppercase' },
  emptyBox: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginTop: 16 },
  emptySub: { fontSize: 14, color: F.slate, textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
  contextMenu: { position: 'absolute', backgroundColor: F.white, borderRadius: 16, width: 160, ...Shadows.cardLift, overflow: 'hidden', padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  menuItemText: { fontSize: 14, fontWeight: '700', color: F.ink, marginLeft: 12 },
  fullModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 24, ...Shadows.card },
  modalHeader: { fontSize: 20, fontWeight: '900', color: F.ink, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '800', color: F.ink, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { borderBottomWidth: 1.5, borderBottomColor: F.primary + '30', paddingVertical: 10, fontSize: 16, color: F.ink, marginBottom: 12 },
  errorText: { color: F.red, fontSize: 12, fontWeight: '700', marginTop: -4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 12 },
  cancelBtnText: { color: F.slate, fontWeight: '700' },
  confirmBtn: { backgroundColor: F.primaryDeep, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  confirmBtnText: { color: F.white, fontWeight: '800' },

  actionModal: { backgroundColor: F.white, borderRadius: 24, padding: 32, alignItems: 'center', ...Shadows.cardLift },
  actionIconBox: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  actionTitle: { fontSize: 20, fontWeight: '900', color: F.ink, marginBottom: 12 },
  actionSub: { fontSize: 15, color: F.slate, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  actionButtons: { flexDirection: 'row', width: '100%' },
  actionCancel: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  actionCancelText: { fontSize: 15, fontWeight: '700', color: F.slate },
  actionConfirm: { flex: 1.5, paddingVertical: 14, borderRadius: 14, alignItems: 'center', ...Shadows.subtle },
  actionConfirmText: { fontSize: 15, fontWeight: '800', color: F.white },
});
