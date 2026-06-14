import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { BurgerIcon, BookOpenIcon, ClipboardListIcon, UsersIcon } from '../../Components/GlobalUse/Icons';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { useAdminStats } from '../../Hooks/use_AdminStats';
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import bubbles from '../../UI_Designs/BubblesDesign';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { ClassDocument } from '../../Interfaces/dataInterfaces';

export default function AdminClassDashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllClasses } = useAdminStats();
  const { handleLogout, handleNavigateStep } = useNavigationHelper();
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

  const activeCount = classes.filter(c => c.isActive).length;
  const archivedCount = classes.filter(c => !c.isActive).length;

  const handleClassPress = (classItem: ClassDocument) => {
    handleNavigateStep('AdminViewFacultyData' as any, { classId: classItem.classId });
  };

  const handleManagePress = () => {
    handleNavigateStep('AdminClassManagement' as any);
  };

  const renderClassItem = ({ item }: { item: ClassDocument }) => (
    <TouchableOpacity
      style={S.classCard}
      onPress={() => handleClassPress(item)}
      activeOpacity={0.7}
    >
      <View style={S.classCardTop}>
        <View style={S.iconBox}>
          <BookOpenIcon size={22} color={F.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={S.className} numberOfLines={1}>{item.className || item.classCode}</Text>
           <Text style={S.classYear}>{item.acadYear} • {item.gradeLevel === 0 ? '' : `Baitang ${item.gradeLevel}`}</Text>
        </View>
        <View style={[S.codeBadge, { backgroundColor: F.primary + '20' }]}>
          <Text style={[S.codeText, { color: F.primaryDeep }]}>{item.classCode}</Text>
        </View>
      </View>
      <View style={S.classCardFooter}>
        <View style={S.statsRow}>
          <UsersIcon size={16} color={F.slate} />
           <Text style={S.statsText}>{(item.studentIds?.length || 0) === 0 ? 'Walang Mag-aaral' : `${(item.studentIds?.length || 0)} Mag-aaral`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyDashboard.container}>
          <View style={bubbles.bubblesContainer}>
            <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
            <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
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

          <LogoutModal
            visible={logoutVisible}
            onCancel={cancelLogout}
            onConfirm={confirmLogout}
          />

          <View style={facultyDashboard.content}>
            <BounceIn delay={100}>
              <View style={S.heroCard}>
                <View>
                  <Text style={S.heroSubtitle}>Class Dashboard</Text>
                  <Text style={S.heroTitle}>Mga Klase sa System</Text>
                </View>
                <BookOpenIcon size={48} color={F.primaryLight} />
              </View>
            </BounceIn>

            <View style={{ marginBottom: 20 }}>
              <Text style={S.sectionLabel}>Buod ng Klase</Text>
              <View style={S.summaryGrid}>
                <View style={S.sumCard}>
                  <Text style={S.sumVal}>{activeCount}</Text>
                  <Text style={S.sumLabel}>Aktibong Klase</Text>
                </View>
                <View style={S.sumCard}>
                  <Text style={S.sumVal}>{archivedCount}</Text>
                  <Text style={S.sumLabel}>Nakarchive</Text>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={S.sectionLabel}>Mabilisang Aksyon</Text>
              <TouchableOpacity
                style={S.quickActionBtn}
                onPress={handleManagePress}
              >
                <ClipboardListIcon size={20} color={F.white} />
                <Text style={S.quickActionText}>Pamamahala ng Klase</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={S.loadingCenter}>
                <ActivityIndicator size="large" color={F.primary} />
                <Text style={S.loadingText}>Inaayos ang mga klase...</Text>
              </View>
            ) : (
              <View>
                <Text style={S.sectionLabel}>Lahat ng Klase ({classes.length})</Text>
                <FlatList
                  data={classes}
                  keyExtractor={item => item.classId}
                  renderItem={renderClassItem}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={S.emptyBox}>
                      <BookOpenIcon size={64} color={F.slate} />
                      <Text style={S.emptyTitle}>Walang klase</Text>
                      <Text style={S.emptySub}>Mag-create ng klase sa pamamahala.</Text>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <AdminSideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogoutPress}
        currentRoute={route.name}
      />
    </SafeAreaView>
  );
}

const facultyDashboard = {
  safeArea: { flex: 1, backgroundColor: F.bg },
  container: { padding: 5 },
  content: { padding: 10 },
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
  heroCard: {
    backgroundColor: F.primaryDeep, borderRadius: Radii.xl,
    padding: 24, marginBottom: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    ...Shadows.cardLift
  },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  summaryGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sumCard: {
    flex: 1, minWidth: '45%', backgroundColor: F.white, borderRadius: Radii.lg,
    padding: 16, alignItems: 'center', ...Shadows.card, marginBottom: 10
  },
  sumVal: { fontSize: 22, fontWeight: '900', color: F.ink, marginVertical: 4 },
  sumLabel: { fontSize: 11, fontWeight: '700', color: F.slate, textTransform: 'uppercase' },
  quickActionBtn: {
    backgroundColor: F.primary, borderRadius: Radii.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    ...Shadows.card
  },
  quickActionText: { fontSize: 16, fontWeight: '800', color: F.white },
  classCard: {
    backgroundColor: F.white, borderRadius: Radii.xl, padding: 20,
    marginBottom: 16, ...Shadows.card
  },
  classCardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center'
  },
  className: { fontSize: 17, fontWeight: '800', color: F.ink },
  classYear: { fontSize: 12, color: F.slate, marginTop: 2 },
  codeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  classCardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsText: { fontSize: 12, color: F.slate },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginTop: 16 },
  emptySub: { fontSize: 14, color: F.slate, textAlign: 'center', marginTop: 8 },
});