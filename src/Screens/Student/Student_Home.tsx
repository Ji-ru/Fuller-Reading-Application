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
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green:      '#2ecc71',
  greenDark:  '#27ae60',
  greenDeep:  '#1a7a45',
  greenLight: '#d4f5e2',
  greenPale:  '#f0faf4',
  teal:       '#1abc9c',
  orange:     '#f39c12',
  white:      '#ffffff',
  ink:        '#1b2e23',
  slate:      '#8fafa0',
  bg:         '#f0faf4',
};

// ─── BounceIn ─────────────────────────────────────────────────────────────────
function BounceIn({
  children,
  delay = 0,
  flex = false,
}: {
  children: React.ReactNode;
  delay?: number;
  flex?: boolean;
}) {
  const scale   = useRef(new Animated.Value(0.75)).current;
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
    <Animated.View style={[{ transform: [{ scale }], opacity }, flex && { flex: 1 }]}>
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

// ─── Nav Button ───────────────────────────────────────────────────────────────
function NavButton({
  emoji,
  label,
  sublabel,
  bgColor,
  borderColor,
  labelColor,
  onPress,
  delay = 0,
  large = false,
}: {
  emoji: string;
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
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 80 }),
    ]).start();
    onPress();
  };

  return (
    <BounceIn delay={delay}>
      <TouchableOpacity onPress={press} activeOpacity={0.88}>
        <Animated.View
          style={[
            S.navBtn,
            large && S.navBtnLarge,
            { backgroundColor: bgColor, borderColor, transform: [{ scale }] },
          ]}
        >
          <View style={S.navBtnShine} />
          <Text style={[S.navBtnEmoji, large && { fontSize: 34 }]}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                S.navBtnLabel,
                large && { fontSize: 18 },
                labelColor ? { color: labelColor } : {},
              ]}
            >
              {label}
            </Text>
            {sublabel && (
              <Text
                style={[
                  S.navBtnSublabel,
                  labelColor ? { color: labelColor, opacity: 0.7 } : {},
                ]}
              >
                {sublabel}
              </Text>
            )}
          </View>
          <View style={[S.navBtnArrow, { backgroundColor: borderColor }]}>
            <Text style={S.navBtnArrowText}>→</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserHomeScreen() {
  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const { handleLogout, handleNextStep } = useNavigationHelper();

  return (
    <SafeAreaView style={S.bg}>
      <BubbleBackground />

      {/* Nav */}
      <View style={{ zIndex: 100 }}>
        <View style={upperNav.header}>
          {/* No logo in this project — menu icon only on the right */}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={upperNav.touchable}
            onPress={() => setMenuVisible(v => !v)}
          >
            <Image
              style={upperNav.menuIcon}
              source={require('../../../assets/icons/Menu-icon.png')}
            />
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
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

      {/* Body — flex fills screen, space-between anchors buttons at bottom */}
      <View style={S.body}>

        {/* Greeting + image — no card, plain on background */}
        <BounceIn delay={40} flex>
          <View style={S.greetSection}>
            <Text style={S.greetHi}>Welcome,</Text>
            <Text style={S.greetName}>Learner! 👋</Text>
            <FloatingImage
              source={require('../../../assets/images/Imagination-Reading.png')}
              style={S.greetImage}
            />
          </View>
        </BounceIn>

        {/* Quote banner */}
        <BounceIn delay={100}>
          <View style={S.quoteBanner}>
            <Text style={S.quoteEmoji}>💬</Text>
            <Text style={S.quoteText}>
              When you can read, you can make your own stories and use your big imagination!
            </Text>
          </View>
        </BounceIn>

        {/* Buttons */}
        <View style={S.btnsContainer}>
          <NavButton
            emoji="📖"
            label="Start Learning"
            sublabel="Pick a passage and start reading"
            bgColor={C.green}
            borderColor={C.greenDark}
            onPress={() =>
              handleNextStep('StudentTabs' as any, { screen: 'StudentLibrary' } as any)
            }
            delay={160}
            large
          />
          <NavButton
            emoji="📋"
            label="Reading History"
            sublabel="View your past reading sessions"
            bgColor={C.white}
            borderColor={C.teal}
            labelColor={C.teal}
            onPress={() => handleNextStep('ReadingHistory')}
            delay={220}
          />
          <NavButton
            emoji="👤"
            label="My Profile"
            sublabel="View your progress and details"
            bgColor={C.white}
            borderColor={C.orange}
            labelColor={C.orange}
            onPress={() => handleNextStep('StudentProfile' as any)}
            delay={280}
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

  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },

  // Greeting section — no card
  greetSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  greetHi:   { fontSize: 18, color: C.slate, fontWeight: '800', textAlign: 'center' },
  greetName: {
    fontSize: 30, fontWeight: '900', color: C.greenDeep,
    lineHeight: 36, marginBottom: 8, textAlign: 'center',
  },
  greetImage: {
    width: SW * 0.75,
    height: SW * 0.75,
  },

  // Quote banner
  quoteBanner: {
    backgroundColor: C.greenLight,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  quoteEmoji: { fontSize: 22 },
  quoteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.ink,
    lineHeight: 19,
  },

  // Buttons container
  btnsContainer: { gap: 10 },

  // Nav button base
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  navBtnLarge:   { paddingVertical: 18 },
  navBtnShine: {
    position: 'absolute',
    top: 8, right: 14,
    width: 16, height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  navBtnEmoji:    { fontSize: 26 },
  navBtnLabel:    { fontSize: 15, fontWeight: '800', color: C.white },
  navBtnSublabel: { fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  navBtnArrow: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center', opacity: 0.85,
  },
  navBtnArrowText: { fontSize: 16, fontWeight: '900', color: C.white },
});