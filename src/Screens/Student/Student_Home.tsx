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
import bubbles from '../../UI_Designs/BubblesDesign';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green:      '#2ecc71',
  greenDark:  '#27ae60',
  greenDeep:  '#1a7a45',
  greenLight: '#d4f5e2',
  greenPale:  '#f0faf4',
  mint:       '#a8edce',
  teal:       '#1abc9c',
  yellow:     '#f9e04b',
  yellowDark: '#e6c820',
  orange:     '#f39c12',
  white:      '#ffffff',
  ink:        '#1b2e23',
  inkLight:   '#4a6358',
  slate:      '#8fafa0',
  bg:         '#f0faf4',
};

// ─── BounceIn ─────────────────────────────────────────────────────────────────
function BounceIn({ children, delay = 0, flex = false }: { children: React.ReactNode; delay?: number; flex?: boolean }) {
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
  return <Animated.View style={[{ transform: [{ scale }], opacity }, flex && { flex: 1 }]}>{children}</Animated.View>;
}

// ─── Floating animation for the image ─────────────────────────────────────────
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

// ─── Nav Button (main CTAs) ───────────────────────────────────────────────────
function NavButton({
  emoji,
  label,
  sublabel,
  bgColor,
  borderColor,
  labelColor,
  onPress,
  delay,
  large,
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

          <Text style={[S.navBtnEmoji, large && { fontSize: 34 }]}>{emoji}</Text>
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
  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const { handleLogout, handleNextStep } = useNavigationHelper();

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
              <Text style={S.greetName}>Mag-aaral! 👋</Text>
              <View style={S.greetPill}>
                <Text style={S.greetPillText}>✨ Handa ka na bang magbasa?</Text>
              </View>
            </View>
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
              Sa bawat buklat, may bagong kwentong naghihintay!
            </Text>
          </View>
        </BounceIn>

        {/* Buttons */}
        <View style={S.btnsContainer}>
          <NavButton
            emoji="📖"
            label="Magsimulang Magbasa"
            sublabel="Pumili ng alpabeto, salita, o talata"
            bgColor={C.green}
            borderColor={C.greenDark}
            onPress={() => handleNextStep('PassageSelection')}
            delay={160}
            large
          />
          <NavButton
            emoji="📜"
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
            emoji="👤"
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
    flex: .9,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },

  
  greetCard: {
    // flex: 1,
    height: SH * 0.40,
    backgroundColor: C.white,
    borderRadius: 28,
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: 20,
    paddingVertical: 20,
    borderTopWidth: 5,
    borderTopColor: C.green,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 7,
    overflow: 'hidden',
    marginBottom: 12,
  },
  greetText:  { flex: 1 },
  greetHi:    { fontSize: 17, color: C.slate, fontWeight: '800' },
  greetName:  { fontSize: 27, fontWeight: '900', color: C.greenDeep, lineHeight: 34, marginBottom: 12 },
  greetPill:  {
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
    // marginRight: -8,
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
    shadowColor: C.yellowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 12,
  },
  quoteEmoji: { fontSize: 22 },
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
  navBtnEmoji:   { fontSize: 26 },
  navBtnLabel:   { fontSize: 15, fontWeight: '800', color: C.white },
  navBtnSublabel:{ fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
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