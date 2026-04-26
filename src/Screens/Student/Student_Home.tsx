import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getCurrentUser, getUserProfile } from '../../Controller/AuthenticationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

const { width: SW } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green:      '#2ecc71',
  greenDark:  '#27ae60',
  greenDeep:  '#1a7a45',
  greenLight: '#d4f5e2',
  greenPale:  '#f0faf4',
  teal:       '#1abc9c',
  orange:     '#f39c12',
  coral:      '#e74c3c',
  white:      '#ffffff',
  ink:        '#1b2e23',
  inkLight:   '#4a6358',
  slate:      '#8fafa0',
  bg:         '#e8f5f0',   // light mint — matches screenshot background
};

// ─── BounceIn ─────────────────────────────────────────────────────────────────
function BounceIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const scale   = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 65, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 220,         useNativeDriver: true }),
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
        Animated.timing(floatY, { toValue:   0, duration: 1800, useNativeDriver: true }),
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
  emoji,
  label,
  sublabel,
  primary = false,
  onPress,
  delay = 0,
}: {
  emoji: string;
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
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 80 }),
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
            <Text style={S.actBtnEmoji}>{emoji}</Text>
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
  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [firstName,     setFirstName]     = useState('Learner');

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

      {/* ── Greeting Card ──────────────────────────────────────────────── */}
      <BounceIn delay={40}>
        <View style={S.greetCard}>
          {/* Text side */}
          <View style={S.greetLeft}>
            <Text style={S.greetTime}>{getTimeGreeting().toUpperCase()}</Text>
            <Text style={S.greetName}>{firstName}!</Text>
            <Text style={S.greetSub}>
              Let's practice your reading skills today!
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
          emoji="📖"
          label="Start Reading"
          sublabel="Practice reading passages"
          primary
          onPress={() =>
            handleNextStep('StudentTabs' as any, { screen: 'StudentLibrary' } as any)
          }
          delay={140}
        />
        <ActivityButton
          emoji="📋"
          label="Reading History"
          sublabel="View past reading sessions"
          onPress={() => handleNextStep('ReadingHistory')}
          delay={200}
        />
        <ActivityButton
          emoji="👤"
          label="My Profile"
          sublabel="View your progress and details"
          onPress={() => handleNextStep('StudentProfile' as any)}
          delay={260}
        />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 100,
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: C.greenDeep,
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },

  // Dropdown
  dropdown: {
    position: 'absolute', top: 72, right: 20,
    backgroundColor: C.white, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 12, elevation: 10,
    minWidth: 160, zIndex: 1000, paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownIcon: { width: 20, height: 20, marginRight: 12, tintColor: C.coral },
  dropdownText: { fontSize: 15, fontWeight: '700', color: C.coral },

  // Greeting card — white rounded card matching screenshot
  greetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    paddingLeft: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    overflow: 'hidden',
  },
  greetLeft: { flex: 1 },
  greetTime: {
    fontSize: 12,
    fontWeight: '800',
    color: C.green,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  greetName: {
    fontSize: 38,
    fontWeight: '900',
    color: C.ink,
    lineHeight: 46,
    marginBottom: 8,
  },
  greetSub: {
    fontSize: 13,
    fontWeight: '500',
    color: C.slate,
    lineHeight: 19,
    maxWidth: SW * 0.45,
  },
  greetImage: {
    width: SW * 0.42,
    height: SW * 0.42,
    marginRight: -8,
  },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  sectionDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.inkLight,
    letterSpacing: 1.5,
  },

  // Activity buttons container
  btnsContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },

  // Activity button base
  actBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
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
    width: 52, height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actBtnIconBoxPrimary: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  actBtnIconBoxSecondary: {
    backgroundColor: C.greenLight,
  },
  actBtnEmoji: { fontSize: 26 },

  // Button text
  actBtnLabel: {
    fontSize: 17, fontWeight: '800', color: C.white, marginBottom: 3,
  },
  actBtnSublabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500',
  },

  // Arrow circle
  actBtnArrow: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  actBtnArrowText: { fontSize: 22, fontWeight: '700', color: C.white, lineHeight: 26 },
});