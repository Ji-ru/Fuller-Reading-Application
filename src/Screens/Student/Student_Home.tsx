import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BounceIn, FloatingImage } from '../../Components/GlobalUse/Animations';
import { BookIcon, HistoryIcon, UserProfileIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getCurrentUser, getUserProfile } from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

const { width: SW } = Dimensions.get('window');

// ─── Hamburger Icon (3-bar) ───────────────────────────────────────────────────
function MenuBars({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: color }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
}

// ─── Nav Button (main CTAs) ───────────────────────────────────────────────────
function NavButton({
  iconView,
  label,
  sublabel,
  bgColor,
  borderColor,
  labelColor,
  onPress,
  delay,
}: {
  iconView: React.ReactNode;
  label: string;
  sublabel?: string;
  bgColor: string;
  borderColor: string;
  labelColor?: string;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80 }),
    ]).start();
    onPress();
  };

  return (
    <BounceIn delay={delay ?? 0}>
      <TouchableOpacity onPress={press} activeOpacity={0.88}>
        <Animated.View
          style={[
            S.navBtn,
            { backgroundColor: bgColor, borderColor, transform: [{ scale }] },
          ]}
        >
          <View style={S.navBtnIconContainer}>{iconView}</View>
          <View style={{ flex: 1 }}>
            <Text style={[S.navBtnLabel, labelColor ? { color: labelColor } : {}]}>{label}</Text>
            {sublabel && (
              <Text style={[S.navBtnSublabel, labelColor ? { color: labelColor, opacity: 0.6 } : {}]}>
                {sublabel}
              </Text>
            )}
          </View>
          <View style={[S.navBtnArrow, { backgroundColor: borderColor }]}>
            <Text style={S.navBtnArrowText}>›</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Time-of-day greeting ─────────────────────────────────────────────────────
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Magandang Umaga';
  if (h < 18) return 'Magandang Hapon';
  return 'Magandang Gabi';
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserHomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [firstName, setFirstName] = useState('Mag-aaral');

  const { handleLogout, handleNextStep } = useNavigationHelper();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.firstName) {
            setFirstName(profile.firstName);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.bg}>

      {/* Bubbles */}
      <View style={bubbles.bubblesContainer} pointerEvents="none">
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

      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <View style={S.headerBar}>
        <Image
          style={S.headerLogo}
          source={require('../../../assets/images/cisckids.png')}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={S.headerMenuBtn}
          onPress={() => setMenuVisible(v => !v)}
          activeOpacity={0.7}
        >
          <MenuBars />
        </TouchableOpacity>
      </View>

      {/* Dropdown overlay */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={S.menuOverlay}
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

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <View style={S.body}>

        {/* Greeting card */}
        <BounceIn delay={40} flex>
          <View style={S.greetCard}>
            <View style={S.greetAccent} />

            <View style={S.greetContent}>
              <Text style={S.greetTimeLabel}>{getTimeGreeting()}</Text>
              <Text style={S.greetName}>{firstName}!</Text>
              <Text style={S.greetSub}>Handa ka na bang magbasa?</Text>
            </View>

            <FloatingImage
              source={require('../../../assets/images/Imagination-Reading.png')}
              style={S.greetImage}
            />
          </View>
        </BounceIn>

        {/* Navigation buttons */}
        <View style={S.btnsContainer}>
          <NavButton
            iconView={<BookIcon size={26} color={C.white} />}
            label="Magsimulang Magbasa"
            sublabel="Pumili ng alpabeto, salita, o talata"
            bgColor={C.green}
            borderColor={C.greenDark}
            onPress={() => handleNextStep('PassageSelection')}
            delay={120}
          />
          <NavButton
            iconView={<HistoryIcon size={26} color={C.teal} />}
            label="Kasaysayan ng Pagbabasa"
            sublabel="Tingnan ang iyong mga nakaraang pagbabasa"
            bgColor={C.white}
            borderColor={C.teal}
            labelColor={C.teal}
            onPress={() => handleNextStep('ReadingHistory')}
            delay={180}
          />
          <NavButton
            iconView={<UserProfileIcon size={26} color={C.orange} />}
            label="Aking Profile"
            sublabel="Tingnan ang iyong pag-unlad at istatistika"
            bgColor={C.white}
            borderColor={C.orange}
            labelColor={C.orange}
            onPress={() => handleNextStep('Profile')}
            delay={240}
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

  // ── Header ──────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
  },
  headerLogo: {
    width: 100,
    height: 90,
  },
  headerMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },

  // ── Dropdown ────────────────────────────────────────────────────────────
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: C.white,
    borderRadius: Radii.md,
    ...Shadows.cardLift,
    minWidth: 160,
    zIndex: 1000,
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: C.coral,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.coral,
  },

  // ── Body ────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 16,
  },

  // ── Greeting Card ───────────────────────────────────────────────────────
  greetCard: {
    flex: 1,
    minHeight: 100,
    maxHeight: 200,
    backgroundColor: C.white,
    borderRadius: Radii.xl,
    flexDirection: 'row',
    alignItems: 'stretch',
    ...Shadows.cardLift,
    overflow: 'hidden',
  },
  greetAccent: {
    width: 6,
    backgroundColor: C.green,
    borderTopLeftRadius: Radii.xl,
    borderBottomLeftRadius: Radii.xl,
  },
  greetContent: {
    flex: 1,
    paddingLeft: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  greetTimeLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: C.slate,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  greetName: {
    fontSize: 40,
    fontWeight: '900',
    color: C.greenDeep,
    lineHeight: 50,
    marginBottom: 6,
  },
  greetSub: {
    fontSize: 16,
    fontWeight: '600',
    color: C.inkLight,
    lineHeight: 22,
    marginBottom: 12,
  },
  greetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.greenLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  greetBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.greenDeep,
  },
  greetImage: {
    width: SW * 0.46,
    height: '105%',
  },

  // ── Nav Buttons ─────────────────────────────────────────────────────────
  btnsContainer: {
    gap: 22,
    marginBottom: 40,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 22,
    gap: 12,
    ...Shadows.button,
    overflow: 'hidden',
  },
  navBtnIconContainer: {
    width: 44,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnLabel: { fontSize: 15, fontWeight: '800', color: C.white },
  navBtnSublabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 7 },
  navBtnArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.85,
  },
  navBtnArrowText: { fontSize: 20, fontWeight: '700', color: C.white },
});