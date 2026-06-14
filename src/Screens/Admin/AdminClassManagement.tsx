import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { BurgerIcon, SearchIcon, BookOpenIcon, PlusIcon, EditIcon, TrashIcon } from '../../Components/GlobalUse/Icons';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { useAdminStats } from '../../Hooks/use_AdminStats';
import { useNavigationHelper } from '../../Controller/NavigationController';
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { getFirestore, doc, updateDoc, deleteDoc, serverTimestamp, collection, addDoc } from '@react-native-firebase/firestore';
import { getCurrentAcademicYear } from '../../Utilities/acadYearUtils';
import bubbles from '../../UI_Designs/BubblesDesign';

const db = getFirestore();

export default function AdminClassManagement() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDocument | null>(null);
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('1');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { getAllClasses } = useAdminStats();
  const { handleLogout } = useNavigationHelper();
  const route = useRoute();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const handleCreateClassPress = () => {
    setClassName('');
    setGradeLevel('1');
    setCreateModalVisible(true);
  };

  const handleCreateClass = async () => {
    if (!className.trim()) {
      Alert.alert('Maling Input', 'Pangalan ng klase ay kinakailangan.');
      return;
    }

    try {
      setEditLoading(true);
      const gradeLevelNum = parseInt(gradeLevel, 10);
      const acadYear = getCurrentAcademicYear();

      const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const classId = `Class_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const classCode = generateClassCode();

      const classDocument: ClassDocument = {
        classId,
        classCode,
        className: className.trim(),
        gradeLevel: gradeLevelNum,
        acadYear,
        facultyId: 'admin',
        studentIds: [],
        isActive: true,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'classes'), { ...classDocument, classId });

      setCreateModalVisible(false);
      fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hindi ma-create ang klase.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditPress = (classItem: ClassDocument) => {
    setSelectedClass(classItem);
    setClassName(classItem.className || '');
    setGradeLevel(classItem.gradeLevel?.toString() || '1');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedClass || !className.trim()) {
      Alert.alert('Maling Input', 'Pangalan ng klase ay kinakailangan.');
      return;
    }

    try {
      setEditLoading(true);
      const classRef = doc(db, 'classes', selectedClass.classId);
      await updateDoc(classRef, {
        className: className.trim(),
        gradeLevel: parseInt(gradeLevel, 10),
        updatedAt: serverTimestamp(),
      });
      setEditModalVisible(false);
      fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hindi ma-update ang klase.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePress = (classItem: ClassDocument) => {
    setSelectedClass(classItem);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const classRef = doc(db, 'classes', selectedClass.classId);
      await deleteDoc(classRef);
      setDeleteModalVisible(false);
      fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hindi ma-delete ang klase.');
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        (c.className || '').toLowerCase().includes(query) ||
        (c.classCode || '').toLowerCase().includes(query)
      );
    }
    return true;
  });

  const renderClassItem = ({ item }: { item: ClassDocument }) => (
    <View style={S.classCard}>
      <View style={S.classCardTop}>
        <View style={S.iconBox}>
          <BookOpenIcon size={22} color={F.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={S.className}>{item.className || item.classCode}</Text>
           <Text style={S.classYear}>{item.acadYear} • {item.gradeLevel === 0 ? '' : `Baitang ${item.gradeLevel}`}</Text>
        </View>
        <View style={[S.codeBadge, { backgroundColor: F.primary + '20' }]}>
          <Text style={[S.codeText, { color: F.primaryDeep }]}>{item.classCode}</Text>
        </View>
      </View>
      <View style={S.classCardFooter}>
         <View style={S.statsRow}>
           <BookOpenIcon size={16} color={F.slate} />
           <Text style={S.statsText}>{(item.studentIds?.length || 0) === 0 ? 'Walang Mag-aaral' : `${(item.studentIds?.length || 0)} Mag-aaral`}</Text>
         </View>
        <View style={S.actionGroup}>
          <TouchableOpacity style={S.actionIcon} onPress={() => handleEditPress(item)}>
            <EditIcon size={18} color={F.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={S.actionIcon} onPress={() => handleDeletePress(item)}>
            <TrashIcon size={18} color={F.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <View style={facultyDashboard.container}>
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

        <View style={S.headerRow}>
          <TouchableOpacity style={S.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
            <BurgerIcon size={24} color="#1b2e23" />
          </TouchableOpacity>
          <Image
            style={S.logo}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>

        <View style={S.searchSection}>
          <View style={S.searchBar}>
            <SearchIcon size={20} color={F.slate} />
            <TextInput
              style={S.searchInput}
              placeholder="Maghanap ng klase..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={F.slate}
            />
          </View>
        </View>

        <View style={S.createSection}>
          <TouchableOpacity style={S.createBtn} onPress={handleCreateClassPress}>
            <View style={S.createIconBox}>
              <PlusIcon size={24} color={F.white} />
            </View>
            <Text style={S.createBtnText}>Gumawa ng Bagong Klase</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={S.loadingCenter}>
            <ActivityIndicator size="large" color={F.primary} />
            <Text style={S.loadingText}>Inaayos ang mga klase...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredClasses}
            keyExtractor={item => item.classId}
            renderItem={renderClassItem}
            contentContainerStyle={S.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={S.emptyBox}>
                <BookOpenIcon size={64} color={F.slate} />
                <Text style={S.emptyTitle}>Walang klase</Text>
                <Text style={S.emptySub}>Subukan ang ibang search term.</Text>
              </View>
            }
          />
        )}

        <AdminSideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onLogout={handleLogoutPress}
          currentRoute={route.name}
        />

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        {/* CREATE MODAL */}
        <Modal visible={createModalVisible} transparent animationType="slide">
          <View style={S.fullModalOverlay}>
            <View style={S.modalContent}>
              <Text style={S.modalHeader}>Bagong Klase</Text>
                 <TextInput
                   style={S.input}
                   placeholder="Pangalan ng Klase (hal. Baitang 1 - A)"
                   value={className}
                   onChangeText={setClassName}
                 />
               <Text style={S.modalLabel}>Baitang</Text>
               <GradeLevelDropDownSelection transparent onSelect={(v) => setGradeLevel(v.toString())} />
              <View style={S.modalActions}>
                <TouchableOpacity style={S.cancelBtn} onPress={() => setCreateModalVisible(false)}>
                  <Text style={S.cancelBtnText}>I-cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.confirmBtn} onPress={handleCreateClass} disabled={editLoading}>
                  {editLoading ? <ActivityIndicator color={F.white} /> : <Text style={S.confirmBtnText}>Gumawa</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* EDIT MODAL */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={S.fullModalOverlay}>
            <View style={S.modalContent}>
              <Text style={S.modalHeader}>I-edit ang Klase</Text>
              <TextInput
                style={S.input}
                placeholder="Pangalan ng Klase"
                value={className}
                onChangeText={setClassName}
               />
               <Text style={S.modalLabel}>Baitang</Text>
               <GradeLevelDropDownSelection transparent initialValue={parseInt(gradeLevel)} onSelect={(v) => setGradeLevel(v.toString())} />
              <View style={S.modalActions}>
                <TouchableOpacity style={S.cancelBtn} onPress={() => setEditModalVisible(false)}>
                  <Text style={S.cancelBtnText}>I-cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.confirmBtn} onPress={handleSaveEdit} disabled={editLoading}>
                  {editLoading ? <ActivityIndicator color={F.white} /> : <Text style={S.confirmBtnText}>I-save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmationModal
          visible={deleteModalVisible}
          type="danger"
          title="Burahin ang Klase?"
          message={`Sigurado ka bang gusto mong burahin ang "${selectedClass?.className}"? Hindi na ito mababalik.`}
          confirmText="Burahin"
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={handleConfirmDelete}
        />
      </View>
    </SafeAreaView>
  );
}

const facultyDashboard = {
  safeArea: { flex: 1, backgroundColor: F.bg },
  container: { padding: 5, flex: 1 },
};

const S = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, marginBottom: 10
  },
  logo: { width: 100, height: 90 },
  menuBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  searchSection: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: F.white,
    borderRadius: Radii.md, paddingHorizontal: 16, height: 50, ...Shadows.subtle
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: F.ink, padding: 0 },
  createSection: { paddingHorizontal: 20, marginBottom: 16 },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: F.white, borderRadius: Radii.lg, padding: 16, ...Shadows.card },
  createIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: F.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  createBtnText: { fontSize: 15, fontWeight: '800', color: F.ink },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  classCard: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  classCardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center' },
  className: { fontSize: 17, fontWeight: '800', color: F.ink },
  classYear: { fontSize: 12, color: F.slate, marginTop: 2 },
  codeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  classCardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f1f1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsText: { fontSize: 12, color: F.slate },
  actionGroup: { flexDirection: 'row', gap: 10 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: F.bg, justifyContent: 'center', alignItems: 'center' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginTop: 16 },
  emptySub: { fontSize: 14, color: F.slate, textAlign: 'center', marginTop: 8 },
  fullModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 24, ...Shadows.card },
  modalHeader: { fontSize: 20, fontWeight: '900', color: F.ink, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '800', color: F.ink, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { borderBottomWidth: 1.5, borderBottomColor: F.primary + '30', paddingVertical: 10, fontSize: 16, color: F.ink, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 12 },
  cancelBtnText: { color: F.slate, fontWeight: '700' },
  confirmBtn: { backgroundColor: F.primaryDeep, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  confirmBtnText: { color: F.white, fontWeight: '800' },
});