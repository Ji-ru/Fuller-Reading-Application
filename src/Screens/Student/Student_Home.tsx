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
import { BookIcon, HistoryIcon, StarIcon, UserProfileIcon } from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getCurrentUser, getUserProfile } from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

const { width: SW, height: SH } = Dimensions.get('window');

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
  large,
}: {
  iconView: React.ReactNode;
  label: string;
  sublabel?: string;
  bgColor: string;
  borderColor: string;
  labelColor?: string;
  onPress: () => void;
  delay?: number;
  large?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
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
            large && S.navBtnLarge,
            { backgroundColor: bgColor, borderColor, transform: [{ scale }] },
          ]}
        >
          {/* Shine */}
          <View style={S.navBtnShine} />

          <View style={S.navBtnIconContainer}>
            {iconView}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.navBtnLabel, large && { fontSize: 18 }, labelColor ? { color: labelColor } : {}]}>{label}</Text>
            {sublabel && <Text style={[S.navBtnSublabel, labelColor ? { color: labelColor, opacity: 0.7 } : {}]}>{sublabel}</Text>}
          </View>
          <View style={[S.navBtnArrow, { backgroundColor: borderColor }]}>
            <Text style={[S.navBtnArrowText, { color: C.white }]}>→</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
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

      {/* Nav */}
      <View style={{ zIndex: 100 }}>
        <View style={upperNav.header}>
          <Image
            style={upperNav.ciscLogo}
            source={require('../../../assets/images/cisckids.png')}
          />
          <TouchableOpacity style={upperNav.touchable} onPress={() => setMenuVisible(v => !v)}>
            <Image style={upperNav.menuIcon} source={require('../../../assets/icons/Menu-icon.png')} />
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
              style={upperNav.logoutButton}
            >
              <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}
      </View>

      {/* ── Body fills all remaining height ──────────────────────────────── */}
      <View style={S.body}>

        {/* Greeting card — grows to absorb spare height */}
        <BounceIn delay={40} flex>
          <View style={S.greetCard}>
            <View style={S.greetText}>
              <Text style={S.greetHi}>Kamusta,</Text>
              <View style={S.nameRow}>
                <Text style={S.greetName}>{firstName}!</Text>
              </View>
              <View style={S.greetPill}>
                <StarIcon size={16} color={C.greenDeep} />
                <Text style={[S.greetPillText, { marginLeft: 6 }]}>Handa ka na bang magbasa?</Text>
              </View>
            </View>
            <FloatingImage
              source={require('../../../assets/images/Imagination-Reading.png')}
              style={S.greetImage}
            />
          </View>
        </BounceIn>

        {/* Buttons */}
        <View style={S.btnsContainer}>
          <NavButton
            iconView={<BookIcon size={30} color={C.white} />}
            label="Magsimulang Magbasa"
            sublabel="Pumili ng alpabeto, salita, o talata"
            bgColor={C.green}
            borderColor={C.greenDark}
            onPress={() => handleNextStep('PassageSelection')}
            delay={160}
            large
          />
          <NavButton
            iconView={<HistoryIcon size={30} color={C.teal} />}
            label="Kasaysayan ng Pagbabasa"
            sublabel="Tingnan ang iyong mga nakaraang pagbabasa"
            bgColor={C.white}
            borderColor={C.teal}
            labelColor={C.teal}
            onPress={() => handleNextStep('ReadingHistory')}
            delay={220}
            large
          />
          <NavButton
            iconView={<UserProfileIcon size={30} color={C.orange} />}
            label="Aking Profile"
            sublabel="Tingnan ang iyong pag-unlad at istatistika"
            bgColor={C.white}
            borderColor={C.orange}
            labelColor={C.orange}
            onPress={() => handleNextStep('Profile')}
            delay={280}
            large
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

  // Body fills remaining height and spaces elements out
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },

  greetCard: {
    flex: 1,
    height: SH * 0.40,
    backgroundColor: C.white,
    borderRadius: Radii.xl,
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: 20,
    paddingVertical: 20,
    ...Shadows.cardLift,
    overflow: 'hidden',
    marginBottom: 12,
  },
  greetText: { flex: 1 },
  greetHi: { fontSize: 17, color: C.slate, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  greetName: { fontSize: 27, fontWeight: '900', color: C.greenDeep, lineHeight: 34 },
  greetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.greenLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  greetPillText: { fontSize: 15, color: C.greenDeep, fontWeight: '700' },
  greetImage: {
    flex: 1,
    width: SW * 0.75,
    height: SW * 0.75,
  },

  // Quote banner
  quoteBanner: {
    backgroundColor: C.white,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    ...Shadows.subtle,
    borderWidth: 1,
    borderColor: C.greenLight,
    marginBottom: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.ink,
    lineHeight: 19,
  },

  // Buttons
  btnsContainer: {
    gap: 10,
  },
  // Nav button
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    ...Shadows.button,
    overflow: 'hidden',
    position: 'relative',
  },
  navBtnLarge: {
    paddingVertical: 18,
  },
  navBtnShine: {
    position: 'absolute',
    top: 8,
    right: 14,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  navBtnIconContainer: { justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  navBtnLabel: { fontSize: 15, fontWeight: '800', color: C.white },
  navBtnSublabel: { fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  navBtnArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.85,
  },
  navBtnArrowText: { fontSize: 16, fontWeight: '900', color: C.white },
});