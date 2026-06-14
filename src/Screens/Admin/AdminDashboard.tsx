import auth from '@react-native-firebase/auth';
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
import AdminSideMenu from '../../Components/Admin/AdminSideMenu';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon, UsersIcon, TrophyIcon, BriefcaseIcon, BurgerIcon, ClipboardListIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getUserProfile } from '../../Controller/AuthenticationController';
import { useAdminStats } from '../../Hooks/use_AdminStats';

import bubbles from '../../UI_Designs/BubblesDesign';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';

export default function AdminDashboard() {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Admin');
const [stats, setStats] = useState<{
  studentCount: number;
  facultyCount: number;
  classCount: number;
}>({ studentCount: 0, facultyCount: 0, classCount: 0 });
  const { handleLogout, handleNavigateStep } = useNavigationHelper();
  const route = useRoute();
  const { getTotals } = useAdminStats();

   const fetchStats = async () => {
     try {
       const currentUser = auth().currentUser;
       if (!currentUser) throw new Error('No authenticated user found');

       // Fetch Profile for name
       try {
         const profile = await getUserProfile(currentUser.uid);
         if (profile?.firstName) {
           setUserName(profile.firstName);
         }
       } catch (err) {
         console.log('Name fetch error:', err);
       }

       const totals = await getTotals(undefined);
       setStats({
         studentCount: totals.studentCount,
         facultyCount: totals.facultyCount,
         classCount: totals.classCount,
       });
     } catch (error: any) {
       console.log('Stats error:', error);
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    fetchStats();
  }, []);

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

   const renderStatsSection = () => {
     if (loading) {
       return (
         <View style={facultyDashboard.loadingContainer}>
           <ActivityIndicator size="large" color="#4ECDC4" />
           <Text style={facultyDashboard.loadingText}>Loading system data...</Text>
         </View>
       );
     }

     return (
       <View style={S.summaryGrid}>
         <View style={S.sumCard}>
           <UsersIcon size={20} color={F.primary} />
           <Text style={S.sumVal}>{stats.studentCount}</Text>
           <Text style={S.sumLabel}>Mga Mag-aaral</Text>
         </View>
         <View style={S.sumCard}>
           <BriefcaseIcon size={20} color={F.primary} />
           <Text style={S.sumVal}>{stats.facultyCount}</Text>
           <Text style={S.sumLabel}>Mga Guro</Text>
         </View>
         <View style={S.sumCard}>
           <BookOpenIcon size={20} color={F.primary} />
           <Text style={S.sumVal}>{stats.classCount}</Text>
           <Text style={S.sumLabel}>Aktibong Klase</Text>
         </View>
       </View>
     );
   };

  return (
    <SafeAreaView style={facultyDashboard.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={facultyDashboard.container}>
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

          {/* LOGOUT MODAL */}
          <LogoutModal
            visible={logoutVisible}
            onCancel={cancelLogout}
            onConfirm={confirmLogout}
          />

          {/* MAIN CONTENT */}
          <View style={facultyDashboard.content}>
            <BounceIn delay={100}>
              <View style={S.heroCard}>
                <View>
                  <Text style={S.heroSubtitle}>Magandang araw, {userName}!</Text>
                  <Text style={S.heroTitle}>Admin Dashboard</Text>
                </View>
                <TrophyIcon size={48} color={F.primaryLight} />
              </View>
            </BounceIn>

              <View style={{ marginBottom: 20 }}>
                <Text style={S.sectionLabel}>System Overview</Text>
                


                {renderStatsSection()}
              </View>

<View style={{ marginBottom: 20 }}>
               <Text style={S.sectionLabel}>Mabilisang Aksyon</Text>
               <View style={S.actionsGrid}>
                 <TouchableOpacity 
                   style={S.quickActionBtn}
                   onPress={() => handleNavigateStep('UserManagement')}
                 >
                   <UsersIcon size={20} color={F.white} />
                   <Text style={S.quickActionText}>Pamamahala ng User</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={S.quickActionBtn}
                   onPress={() => handleNavigateStep('AdminClassDashboard')}
                 >
                   <BookOpenIcon size={20} color={F.white} />
                   <Text style={S.quickActionText}>Class Dashboard</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={S.quickActionBtn}
                   onPress={() => handleNavigateStep('AdminClassManagement')}
                 >
                   <ClipboardListIcon size={20} color={F.white} />
                   <Text style={S.quickActionText}>Pamamahala ng Klase</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={S.quickActionBtn}
                   onPress={() => handleNavigateStep('AdminViewFacultyData')}
                 >
                   <BriefcaseIcon size={20} color={F.white} />
                   <Text style={S.quickActionText}>Faculty Data</Text>
                 </TouchableOpacity>
               </View>
             </View>
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
    ...Shadows.card,
    flex: 1,
    minWidth: '45%',
  },
  quickActionText: { fontSize: 16, fontWeight: '800', color: F.white },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

});
