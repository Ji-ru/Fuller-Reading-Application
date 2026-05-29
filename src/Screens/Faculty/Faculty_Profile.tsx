import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BriefcaseIcon, HistoryIcon, BurgerIcon, UserProfileIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import {
  getCurrentUser,
  getUserProfile,
} from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import bubbles from '../../UI_Designs/BubblesDesign';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';

export default function FacultyProfile() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [profileData, setProfileData] = useState<UserDocument | null>(null);
  const [activeClassCount, setActiveClassCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<string | null>(null);

  const { handleLogout } = useNavigationHelper();
  const route = useRoute();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const cur = getCurrentUser();
      if (!cur) return;
      
      const [profile, activeClasses] = await Promise.all([
        getUserProfile(cur.uid),
        getFacultyClasses_Student.getFacultyClasses(cur.uid, true)
      ]);
      
      setProfileData(profile);
      setActiveClassCount(activeClasses.length);
    } catch (e: any) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const formatDate = (ts: any): string => {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return '—'; }
  };

  if (loading) {
    return (
      <SafeAreaView style={S.safeArea}>
        <View style={S.loadingBox}>
          <LoadingDots />
          <Text style={S.loadingText}>Inihahanda ang iyong Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* MAIN CONTENT */}
          <View style={S.content}>
            <BounceIn delay={100}>
              <View style={S.heroCard}>
                <View style={S.avatarRing}>
                   <Image 
                     source={profileData?.profileImageUrl ? { uri: profileData.profileImageUrl } : require('../../../assets/images/defaultProfile.png')}
                     style={S.avatar}
                   />
                </View>
                <View style={S.heroInfo}>
                   <Text style={S.heroName}>{profileData?.firstName} {profileData?.lastName}</Text>
                   <View style={S.roleBadge}>
                      <Text style={S.roleText}>FACULTY MEMBER</Text>
                   </View>
                </View>
              </View>
            </BounceIn>

            <View style={S.statsGrid}>
               <View style={S.statItem}>
                  <BriefcaseIcon size={24} color={F.primary} />
                  <Text style={S.statVal}>{activeClassCount}</Text>
                  <Text style={S.statLab}>Mga Klase</Text>
               </View>
               <View style={S.statItem}>
                  <HistoryIcon size={24} color={F.primary} />
                   <Text style={S.statVal}>{formatDate(profileData?.createdAt).split(' ')[2] || '—'}</Text>
                   <Text style={S.statLab}>Joined</Text>
               </View>
            </View>

            <Text style={S.sectionLabel}>Account Details</Text>
            
            <View style={S.infoRow}>
               <View style={S.smallIconBox}><UserProfileIcon size={18} color={F.primary} /></View>
               <View>
                  <Text style={S.infoLabel}>Email Address</Text>
                  <Text style={S.infoVal}>{profileData?.email}</Text>
               </View>
            </View>
            <View style={[S.infoRow, { borderBottomWidth: 0 }]}>
               <View style={S.smallIconBox}><BriefcaseIcon size={18} color={F.primary} /></View>
               <View>
                  <Text style={S.infoLabel}>Kasarian</Text>
                  <Text style={S.infoVal}>{profileData?.sex === 'male' ? 'Lalaki' : 'Babae'}</Text>
               </View>
            </View>
          </View>
        </View>
      </ScrollView>

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

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 13, fontWeight: '700', color: F.slate, fontFamily: 'Andika-Regular' },

  content: { padding: 20 },
  heroCard: {
    backgroundColor: F.white, borderRadius: 28, padding: 30,
    alignItems: 'center', ...Shadows.cardLift, marginBottom: 24
  },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 4,
    borderColor: F.primary, padding: 4, marginBottom: 16
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  heroInfo: { alignItems: 'center' },
  heroName: { fontSize: 22, fontWeight: '900', color: F.ink, marginBottom: 8, fontFamily: 'Andika-Bold' },
  roleBadge: { backgroundColor: F.primary + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 10, fontWeight: '800', color: F.primaryDeep, letterSpacing: 1, fontFamily: 'Andika-Bold' },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statItem: {
    flex: 1, backgroundColor: F.white, padding: 16, borderRadius: Radii.lg,
    alignItems: 'center', ...Shadows.card
  },
  statVal: { fontSize: 18, fontWeight: '900', color: F.ink, marginVertical: 4, fontFamily: 'Andika-Bold' },
  statLab: { fontSize: 10, fontWeight: '700', color: F.slate, textTransform: 'uppercase', fontFamily: 'Andika-Regular' },

  sectionLabel: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 4, fontFamily: 'Andika-Bold' },
  infoRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    marginBottom: 12, backgroundColor: F.white, borderRadius: Radii.lg, ...Shadows.subtle
  },
  smallIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: F.bg, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: F.slate, textTransform: 'uppercase', fontFamily: 'Andika-Bold' },
  infoVal: { fontSize: 14, fontWeight: '800', color: F.ink, marginTop: 1, fontFamily: 'Andika-Bold' },

});
