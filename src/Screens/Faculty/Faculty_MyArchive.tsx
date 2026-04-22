import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import bubbles from '../../UI_Designs/BubblesDesign';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import { useRoute } from '@react-navigation/native';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { BurgerIcon, ArchiveIcon, HistoryIcon, BookOpenIcon, RefreshIcon } from '../../Components/GlobalUse/Icons';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { getAuth } from '@react-native-firebase/auth';
import { ClassDocument } from '../../Interfaces/dataInterfaces';

export default function MyArchive() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleLogout } = useNavigationHelper();
  const route = useRoute();
  const auth = getAuth();

  const fetchArchivedClasses = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const archived = await getFacultyClasses_Student.getFacultyClasses(currentUser.uid, false);
      setClasses(archived);
    } catch (error: any) {
      console.log('Fetch archive error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedClasses();
  }, [fetchArchivedClasses]);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [classToRestore, setClassToRestore] = useState<ClassDocument | null>(null);

  const handleRestore = (classItem: ClassDocument) => {
     setClassToRestore(classItem);
     setRestoreModalVisible(true);
  };

  const confirmRestore = async () => {
    if (classToRestore) {
      try {
        await getFacultyClasses_Student.archiveClass(classToRestore.classId, false);
        setClasses(prev => prev.filter(c => c.classId !== classToRestore.classId));
        setRestoreModalVisible(false);
        setClassToRestore(null);
      } catch (e) {
        console.error('Restore error:', e);
      }
    }
  };

  const renderClassItem = ({ item }: { item: ClassDocument }) => (
    <View style={S.classCard}>
      <View style={S.classCardTop}>
         <View style={S.iconBox}>
            <ArchiveIcon size={22} color={F.slate} />
         </View>
         <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={S.className} numberOfLines={1}>{item.className}</Text>
            <Text style={S.classYear}>Archived • Grade {item.gradeLevel}</Text>
         </View>
         <TouchableOpacity onPress={() => handleRestore(item)} style={S.restoreBtn}>
            <Text style={S.restoreText}>Restore</Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={S.safeArea}>
      <View style={S.container}>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

        {/* HEADER */}
        <View style={S.headerRow}>
          <TouchableOpacity style={S.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
            <BurgerIcon size={24} color={F.ink} />
          </TouchableOpacity>
          <Image
            style={S.logo}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} /> 
        </View>

        {loading ? (
            <View style={S.loadingBox}>
                <ActivityIndicator size="large" color={F.primary} />
                <Text style={S.loadingText}>Kinukuha ang iyong mga archived na records...</Text>
            </View>
        ) : (
            <FlatList 
                data={classes}
                renderItem={renderClassItem}
                keyExtractor={item => item.classId}
                ListHeaderComponent={
                    <BounceIn delay={100}>
                        <View style={S.heroCard}>
                            <View>
                                <Text style={S.heroSubtitle}>Pamamahala ng Records</Text>
                                <Text style={S.heroTitle}>Aking Archive</Text>
                            </View>
                            <ArchiveIcon size={48} color={F.primaryLight} />
                        </View>
                        <Text style={S.listLabel}>Mga Naka-archive na Klase ({classes.length})</Text>
                    </BounceIn>
                }
                contentContainerStyle={S.listContent}
                ListEmptyComponent={
                    <View style={S.emptyBox}>
                        <View style={S.emptyIconArea}>
                            <HistoryIcon size={64} color={F.primaryDeep} />
                        </View>
                        <Text style={S.emptyTitle}>Walang naka-archive</Text>
                        <Text style={S.emptySub}>Dito makikita ang mga klase o data{'\n'}na iyong itinago para sa future reference.</Text>
                    </View>
                }
            />
        )}

        <FacultySideMenu 
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

        <ConfirmationModal
          visible={restoreModalVisible}
          type="primary"
          title="I-restore ang Klase?"
          message={`Gusto mo bang ibalik ang "${classToRestore?.className}" sa iyong aktif na mga klase?`}
          confirmText="I-restore"
          onCancel={() => setRestoreModalVisible(false)}
          onConfirm={confirmRestore}
        />
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: F.bg },
  container: { flex: 1 },
  headerRow: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 
  },
  logo: { width: 100, height: 90 },
  menuBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },

  content: { padding: 20 },
  heroCard: {
    backgroundColor: F.primaryDeep, borderRadius: Radii.xl,
    padding: 24, marginBottom: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    ...Shadows.cardLift
  },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white },

  listLabel: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', marginBottom: 16, marginLeft: 4, paddingHorizontal: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  classCard: {
    backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card, opacity: 0.85
  },
  classCardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f1f1f1', justifyContent: 'center', alignItems: 'center' },
  className: { fontSize: 18, fontWeight: '900', color: F.ink },
  classYear: { fontSize: 13, color: F.slate, fontWeight: '600' },
  restoreBtn: { backgroundColor: F.primary + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  restoreText: { fontSize: 12, fontWeight: '800', color: F.primaryDeep },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: F.slate, fontWeight: '600' },

  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyIconArea: { 
    width: 120, height: 120, borderRadius: 60, 
    backgroundColor: F.white, justifyContent: 'center', 
    alignItems: 'center', ...Shadows.card, marginBottom: 24
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: F.ink, marginBottom: 12 },
  emptySub: { fontSize: 14, color: F.slate, textAlign: 'center', lineHeight: 22, fontWeight: '600' },
});
