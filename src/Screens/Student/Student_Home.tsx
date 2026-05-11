import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getCurrentUser, getUserProfile } from '../../Controller/AuthenticationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { sw, sh, sf } from '../../Utils/responsive';
import { Icon, IconName } from '../../Components/GlobalUse/Icon';

// ─── Palette ─────────────────
const C = {
  green: '#2ca96a',        // primary green
  greenDark: '#008443',    // slightly lighter deep green
  greenDeep: '#008443',    // deep pine green (remains the same for depth)
  greenLight: '#c0e8f2',   // soft mint background (lighter)
  greenPale: '#E8F5E9',    // very pale green (softer, lighter)

  teal: '#57b8b3',         // fresher teal, less intense
  orange: '#F39C12',       // warm contrast
  coral: '#FF7043',        // gentle coral (lighter shade)
  white: '#ffffff',
  ink: '#1B2B22',          // dark greenish black (remains same for text)
  inkLight: '#6B8E6B',     // softened text green, lighter than previous
  slate: '#A5B8A7',        // green-gray with a lighter tone
  bg: '#F1FBF4',           // light mint green (remains the same)
};

// ─── BounceIn ─────────────────────────────────────────────────────────────────
function BounceIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      {children}
    </Animated.View>
  );
}

// ─── Floating image ───────────────────────────────────────────────────────────
function FloatingImage({ source, style }: { source: any; style: any }) {
  const floatY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.Image
      source={source}
      style={[style, { transform: [{ translateY: floatY }] }]}
      resizeMode="contain"
    />
  );
}

// ─── Hamburger icon ───────────────────────────────────────────────────────────
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

// ─── Activity Button ──────────────────────────────────────────────────────────
function ActivityButton({
  icon,
  label,
  sublabel,
  primary = false,
  onPress,
  delay = 0,
}: {
  icon: IconName;
  label: string;
  sublabel?: string;
  primary?: boolean;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80 }),
    ]).start();
    onPress();
  };

  return (
    <BounceIn delay={delay}>
      <TouchableOpacity onPress={press} activeOpacity={0.88}>
        <Animated.View
          style={[
            S.actBtn,
            primary ? S.actBtnPrimary : S.actBtnSecondary,
            { transform: [{ scale }] },
          ]}
        >
          {/* Icon bubble */}
          <View style={[S.actBtnIconBox, primary ? S.actBtnIconBoxPrimary : S.actBtnIconBoxSecondary]}>
            <Icon
              name={icon}
              size={sf(28)}
              color={primary ? C.white : C.greenDark}
              filled
            />
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text style={[S.actBtnLabel, !primary && { color: C.ink }]}>{label}</Text>
            {sublabel && (
              <Text style={[S.actBtnSublabel, !primary && { color: C.slate }]}>
                {sublabel}
              </Text>
            )}
          </View>

          {/* Arrow */}
          <View style={[S.actBtnArrow, { backgroundColor: primary ? C.greenDark : C.green }]}>
            <Text style={S.actBtnArrowText}>›</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Time greeting ────────────────────────────────────────────────────────────
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 18) return 'Good Afternoon,';
  return 'Good Evening,';
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserHomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [firstName, setFirstName] = useState('Learner');

  const { handleLogout, handleNextStep } = useNavigationHelper();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile?.firstName) setFirstName(profile.firstName);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={S.bg}>
      <BubbleBackground />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={S.header}>
        <Text style={S.headerLogo}>CISC KIDS</Text>
        <TouchableOpacity
          style={S.menuBtn}
          onPress={() => setMenuVisible(v => !v)}
          activeOpacity={0.7}
        >
          <MenuBars />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject as any}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
          <View style={S.dropdown}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                handleNextStep('About');
              }}
              style={S.dropdownItem}
              activeOpacity={0.75}
            >
              <Icon name="info" size={sw(20)} color={C.slate} filled />
              <Text style={[S.dropdownText, S.aboutText]}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
              style={S.dropdownItem}
              activeOpacity={0.75}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={S.dropdownIcon}
              />
              <Text style={S.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Responsive Scaled Content ──────────────────────────────────── */}
      <View style={S.mainContent}>
        {/* ── Greeting Card ──────────────────────────────────────────────── */}
        <BounceIn delay={40}>
          <View style={S.greetCard}>
            {/* Text side */}
            <View style={S.greetLeft}>
              <Text style={S.greetTime}>{getTimeGreeting().toUpperCase()}</Text>
              <Text style={S.greetName}>{firstName}!</Text>
              <Text style={S.greetSub}>
                Let's check your reading skills today!
              </Text>
            </View>

            {/* Floating illustration */}
            <FloatingImage
              source={require('../../../assets/images/Imagination-Reading.png')}
              style={S.greetImage}
            />
          </View>
        </BounceIn>

        {/* ── Section label ──────────────────────────────────────────────── */}
        <BounceIn delay={100}>
          <View style={S.sectionLabel}>
            <View style={S.sectionDot} />
            <Text style={S.sectionLabelText}>YOUR ACTIVITIES</Text>
          </View>
        </BounceIn>

        {/* ── Activity Buttons ───────────────────────────────────────────── */}
        <View style={S.btnsContainer}>
          <ActivityButton
            icon="bookOpen"
            label="Start Reading"
            sublabel="Practice reading passages"
            primary
            onPress={() =>
              handleNextStep('PassageSelection')
            }
            delay={140}
          />
          <ActivityButton
            icon="history"
            label="Reading Performance"
            sublabel="View past reading sessions"
            onPress={() => handleNextStep('ReadingHistory')}
            delay={200}
          />
          <ActivityButton
            icon="myclass"
            label="My Class"
            sublabel="View your class and classmates"
            onPress={() => handleNextStep('StudentMyClass')}
            delay={260}
          />
          <ActivityButton
            icon="profile"
            label="My Profile"
            sublabel="View your progress and details"
            onPress={() => handleNextStep('Profile')}
            delay={320}
          />
        </View>
      </View>

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sw(20),
    paddingTop: sh(12),
    paddingBottom: sh(8),
    zIndex: 100,
  },
  headerLogo: {
    fontSize: sf(18),
    fontFamily: 'Nunito-Black',
    color: C.green, // the user requested #2ca96a for this, which is now C.green
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: sw(48), height: sw(48),
    borderRadius: sw(14),
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(2) },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },

  // Dropdown
  dropdown: {
    position: 'absolute', top: sh(72), right: sw(20),
    backgroundColor: C.white, borderRadius: sw(14),
    shadowColor: '#000', shadowOffset: { width: 0, height: sh(4) },
    shadowOpacity: 0.14, shadowRadius: 12, elevation: 10,
    minWidth: sw(160), zIndex: 1000, paddingVertical: sh(4),
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sw(16), paddingVertical: sh(14),
  },
  dropdownIcon: { width: sw(20), height: sw(20), marginRight: sw(12), tintColor: C.coral },
  dropdownText: { fontSize: sf(15), fontFamily: 'Nunito-Bold', color: C.coral },
  aboutText: { color: C.slate, marginLeft: sw(12) },

  mainContent: {
    flex: 1,
    paddingBottom: sh(20),
  },

  // Greeting card — white rounded card matching screenshot
  greetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: sw(24),
    marginHorizontal: sw(16),
    marginTop: sh(8),
    marginBottom: sh(24),
    paddingLeft: sw(24),
    paddingVertical: sh(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(4) },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    overflow: 'hidden',
  },
  greetLeft: { flex: 1 },
  greetTime: {
    fontSize: sf(12),
    fontFamily: 'Andika-Bold',
    color: C.green,
    letterSpacing: 1.2,
    marginBottom: sh(4),
  },
  greetName: {
    fontSize: sf(38),
    fontFamily: 'Andika-Bold',
    color: C.ink,
    lineHeight: sh(46),
    marginBottom: sh(8),
  },
  greetSub: {
    fontSize: sf(13),
    fontFamily: 'Andika-Regular',
    color: C.slate,
    lineHeight: sh(19),
    maxWidth: sw(160),
  },
  greetImage: {
    width: sw(160),
    height: sw(160),
    marginRight: sw(-8),
  },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    marginBottom: sh(12),
    gap: sw(8),
  },
  sectionDot: {
    width: sw(8), height: sw(8),
    borderRadius: sw(4),
    backgroundColor: C.green,
  },
  sectionLabelText: {
    fontSize: sf(12),
    fontFamily: 'Andika-Bold',
    color: C.inkLight,
    letterSpacing: 1.5,
  },

  // Activity buttons container
  btnsContainer: {
    paddingHorizontal: sw(16),
    gap: sh(14),
  },

  // Activity button base
  actBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sw(20),
    paddingHorizontal: sw(16),
    paddingVertical: sh(15),
    gap: sw(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sh(3) },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  actBtnPrimary: {
    backgroundColor: C.green,
  },
  actBtnSecondary: {
    backgroundColor: C.white,
  },

  // Icon box
  actBtnIconBox: {
    width: sw(52), height: sw(50),
    borderRadius: sw(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actBtnIconBoxPrimary: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  actBtnIconBoxSecondary: {
    backgroundColor: C.greenLight,
  },
  actBtnEmoji: { fontSize: sf(26) },

  // Button text
  actBtnLabel: {
    fontSize: sf(17), fontFamily: 'Andika-Bold', color: C.white, marginBottom: sh(1),
  },
  actBtnSublabel: {
    fontSize: sf(12), color: 'rgba(255,255,255,0.75)', fontFamily: 'Andika-Regular',
  },

  // Arrow circle
  actBtnArrow: {
    width: sw(36), height: sw(36), borderRadius: sw(18),
    justifyContent: 'center', alignItems: 'center',
  },
  actBtnArrowText: { fontSize: sf(22), fontFamily: 'Nunito-Bold', color: C.white, lineHeight: sh(26) },
});