import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { 
  LayoutIcon, 
  BriefcaseIcon, 
  ArchiveIcon, 
  UserProfileIcon, 
  LogoutIcon, 
  ChevronRightIcon,
  ClipboardListIcon,
  BarChartIcon
} from '../../GlobalUse/Icons';
import { FacultyColors as F, Radii, Shadows } from '../../../Utilities/Theme';
import { useNavigationHelper } from '../../../Controller/NavigationController';
import { getAuth } from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface FacultySideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentRoute?: string;
}

const FacultySideMenu: React.FC<FacultySideMenuProps> = ({ 
  visible, 
  onClose, 
  onLogout,
  currentRoute 
}) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const { handleTabNavigation } = useNavigationHelper();
  const auth = getAuth();
  const user = auth.currentUser;
  const [userName, setUserName] = React.useState('Faculty User');
  const [initial, setInitial] = React.useState('F');

  React.useEffect(() => {
    const fetchName = async () => {
      if (user) {
        try {
          if (user.displayName) {
             setUserName(user.displayName);
             setInitial(user.displayName.charAt(0).toUpperCase());
          } else {
             const { getUserProfile } = require('../../../Controller/AuthenticationController');
             const profile = await getUserProfile(user.uid);
             if (profile) {
                const fullName = `${profile.firstName} ${profile.lastName}`;
                setUserName(fullName);
                setInitial(profile.firstName.charAt(0).toUpperCase());
             }
          }
        } catch (e) {
          console.warn('Sidebar name fetch error:', e);
        }
      }
    };
    fetchName();
  }, [user]);

  const [shouldRender, setShouldRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  const navItems = [
    { id: 'FacultyDashboard', label: 'Dashboard', icon: LayoutIcon },
    { id: 'MyClass', label: 'Mga Klase', icon: BriefcaseIcon },
    { id: 'FacultyAssessments', label: 'Pagsusulit', icon: ClipboardListIcon },
    { id: 'FacultyReports', label: 'Mga Ulat', icon: BarChartIcon },
    { id: 'Archive', label: 'Archive', icon: ArchiveIcon },
    { id: 'FacultyProfile', label: 'Aking Profile', icon: UserProfileIcon },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    handleTabNavigation(route as any);
  };

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: opacityAnim }
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* Sidebar Content */}
      <Animated.View 
        style={[
          styles.sidebar, 
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileCircle} activeOpacity={0.9}>
            <Text style={styles.profileInitial}>{initial}</Text>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            <Text style={styles.userRole}>Faculty Member</Text>
          </View>
        </View>

        <View style={styles.navSection}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handleNavigate(item.id)}
              >
                <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                  <Icon size={20} color={isActive ? F.white : F.primary} />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
                {isActive && <ChevronRightIcon size={16} color={F.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <View style={styles.logoutIconBox}>
              <LogoutIcon size={20} color={F.red} />
            </View>
            <Text style={styles.logoutLabel}>Maglog-out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.0.4 Faculty Panel</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9998,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: F.bg,
    paddingTop: 60,
    ...Shadows.cardLift,
    zIndex: 9999,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: F.white, justifyContent: 'center',
    alignItems: 'center', ...Shadows.card,
    borderWidth: 3, borderColor: F.primaryDeep
  },
  profileInitial: { fontSize: 28, fontWeight: '900', color: F.primaryDeep },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 18, fontWeight: '900', color: F.ink },
  userRole: { fontSize: 13, color: F.slate, fontWeight: '600' },

  navSection: { flex: 1, paddingHorizontal: 16 },
  navItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: Radii.lg,
    marginBottom: 8,
  },
  navItemActive: { backgroundColor: F.white, ...Shadows.subtle },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: F.primary + '15', justifyContent: 'center',
    alignItems: 'center', marginRight: 14
  },
  iconBoxActive: { backgroundColor: F.primary },
  navLabel: { fontSize: 15, fontWeight: '700', color: F.ink },
  navLabelActive: { color: F.primaryDeep, flex: 1 },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 16
  },
  logoutIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: F.red + '15', justifyContent: 'center',
    alignItems: 'center', marginRight: 12
  },
  logoutLabel: { fontSize: 15, fontWeight: '700', color: F.red },
  versionText: { fontSize: 11, color: F.slate, textAlign: 'center', opacity: 0.5 }
});

export default FacultySideMenu;
