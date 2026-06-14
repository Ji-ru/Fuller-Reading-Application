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
import { BurgerIcon, BriefcaseIcon, UsersIcon, BookOpenIcon } from '../../Components/GlobalUse/Icons';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { useAdminStats } from '../../Hooks/use_AdminStats';
import { useNavigationHelper } from '../../Controller/NavigationController';
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import bubbles from '../../UI_Designs/BubblesDesign';
import { UserDocument } from '../../Interfaces/dataInterfaces';

export default function AdminViewFacultyData() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [faculty, setFaculty] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [facultyClassMap, setFacultyClassMap] = useState<Record<string, string[]>>({});

  const { getAllUsers } = useAdminStats();
  const { handleLogout } = useNavigationHelper();
  const route = useRoute();
  const classId = (route.params as any)?.classId;

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      let facultyList = users.filter((u: UserDocument) => u.role === 'faculty');

      if (classId) {
        facultyList = facultyList.filter((f: UserDocument) =>
          f.facultyData?.assignedClassIds?.includes(classId),
        );
      }
      setFaculty(facultyList);

      // Build class map
      const classMap: Record<string, string[]> = {};
      for (const f of facultyList) {
        if (f.facultyData?.assignedClassIds) {
          classMap[f.uid] = f.facultyData.assignedClassIds;
        }
      }
      setFacultyClassMap(classMap);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [classId]);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const renderFacultyItem = ({ item }: { item: UserDocument }) => {
    const assignedGradeLevels = item.facultyData?.assignedGradeLevels || [];
    
    return (
      <View style={S.facultyCard}>
        <View style={S.facultyCardTop}>
          <View style={S.facultyAvatar}>
            <Text style={S.avatarText}>{item.firstName?.charAt(0) || 'G'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={S.facultyName}>{item.firstName} {item.lastName}</Text>
            <Text style={S.facultyEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={S.facultyCardFooter}>
          <Text style={S.gradeLabel}>Itinalagang Baitang:</Text>
          <View style={S.gradeBadges}>
            {assignedGradeLevels.map((level: number) => (
              <View key={level} style={S.gradeBadge}>
                <Text style={S.gradeBadgeText}>Baitang {level}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

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
                  <Text style={S.heroSubtitle}>Faculty Data</Text>
                  <Text style={S.heroTitle}>Mga Guro</Text>
                </View>
                <BriefcaseIcon size={48} color={F.primaryLight} />
              </View>
            </BounceIn>

            {loading ? (
              <View style={S.loadingCenter}>
                <ActivityIndicator size="large" color={F.primary} />
                <Text style={S.loadingText}>Inaayos ang data ng mga guro...</Text>
              </View>
            ) : (
              <View>
                <Text style={S.sectionLabel}>Mga Guro ({faculty.length})</Text>
                <FlatList
                  data={faculty}
                  keyExtractor={item => item.uid}
                  renderItem={renderFacultyItem}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={S.emptyBox}>
                      <BriefcaseIcon size={64} color={F.slate} />
                      <Text style={S.emptyTitle}>Walang guro</Text>
                      <Text style={S.emptySub}>Mag-add ng guro sa sistema.</Text>
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
  facultyCard: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  facultyCardTop: { flexDirection: 'row', alignItems: 'center' },
  facultyAvatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: F.primaryLight,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: F.primaryDeep },
  facultyName: { fontSize: 16, fontWeight: '800', color: F.ink },
  facultyEmail: { fontSize: 13, color: F.slate, marginTop: 4 },
  facultyCardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  gradeLabel: { fontSize: 12, color: F.slate, fontWeight: '600', marginBottom: 8 },
  gradeBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gradeBadge: { backgroundColor: F.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  gradeBadgeText: { fontSize: 12, fontWeight: '700', color: F.primaryDeep },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginTop: 16 },
  emptySub: { fontSize: 14, color: F.slate, textAlign: 'center', marginTop: 8 },
});