import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
    LayoutIcon,
    UsersIcon,
    UserProfileIcon,
    LogoutIcon,
    ChevronRightIcon,
    BookOpenIcon,
    ClipboardListIcon,
    BriefcaseIcon,
    InfoIcon,
    EditIcon
  } from '../GlobalUse/Icons';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getUserProfile } from '../../Controller/AuthenticationController';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface AdminSideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentRoute?: string;
}

const AdminSideMenu: React.FC<AdminSideMenuProps> = ({
  visible,
  onClose,
  onLogout,
  currentRoute
}) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const { handleTabNavigation, handleNavigateStep } = useNavigationHelper();

  const currentUser = auth().currentUser;
  const [userName, setUserName] = React.useState('Admin User');
  const [initial, setInitial] = React.useState('A');
  const [shouldRender, setShouldRender] = React.useState(visible);

  React.useEffect(() => {
    const fetchName = async () => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile && profile.firstName) {
            const fullName = `${profile.firstName} ${profile.lastName || ''}`;
            setUserName(fullName.trim());
            setInitial(profile.firstName.charAt(0).toUpperCase());
          }
        } catch (e) {
          console.warn('Sidebar name fetch error:', e);
        }
      }
    };
    fetchName();
  }, [currentUser]);

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
    { id: 'AdminDashboard', label: 'Dashboard', icon: LayoutIcon },
    { id: 'UserManagement', label: 'Pamamahala ng User', icon: UsersIcon },
    { id: 'AdminClassDashboard', label: 'Class Dashboard', icon: BookOpenIcon },
    { id: 'AdminClassManagement', label: 'Pamamahala ng Klase', icon: ClipboardListIcon },
    { id: 'AdminReadingMaterials', label: 'Pamamahala ng Pagbasa', icon: EditIcon },
    { id: 'AdminViewFacultyData', label: 'Faculty Data', icon: BriefcaseIcon },
    { id: 'Tungkol', label: 'Tungkol', icon: InfoIcon },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    handleNavigateStep(route as any);
  };

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: opacityAnim }
          ]}
        />
      </TouchableWithoutFeedback>

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
            <Text style={styles.userRole}>Administrator ng System</Text>
          </View>
        </View>

        <View style={styles.navSection}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleNavigate(item.id)}
                  activeOpacity={0.7}
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
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
            <View style={styles.logoutIconBox}>
              <LogoutIcon size={20} color={F.red} />
            </View>
            <Text style={styles.logoutLabel}>Maglog-out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.0.4 Admin Panel</Text>
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
    paddingVertical: 12, paddingHorizontal: 8, borderRadius: Radii.lg,
    marginBottom: 4,
    minHeight: 44,
  },
  navItemActive: { backgroundColor: F.white, ...Shadows.subtle },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#E8F5F5', justifyContent: 'center',
    alignItems: 'center', marginRight: 10
  },
  iconBoxActive: { backgroundColor: F.primary },
  navLabel: { fontSize: 15, fontWeight: '700', color: F.ink, flex: 1 },
  navLabelActive: { color: F.primaryDeep, flex: 1 },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
  },
  spacer: {
    height: 16,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 16
  },
  logoutIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFE5E5', justifyContent: 'center',
    alignItems: 'center', marginRight: 12
  },
  logoutLabel: { fontSize: 15, fontWeight: '700', color: F.red },
  versionText: { fontSize: 11, color: F.slate, textAlign: 'center', opacity: 0.5 }
});

export default AdminSideMenu;
