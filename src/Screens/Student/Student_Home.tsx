import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BounceIn, FloatingImage } from '../../Components/GlobalUse/Animations';
import {
  BookIcon, UserProfileIcon, LogoutIcon,
  BurgerIcon, ChevronRightIcon, UsersIcon, HistoryIcon, InfoIcon,
} from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { getCurrentUser, getUserProfile } from '../../Controller/AuthenticationController';
import { AssessmentController } from '../../Controller/AssessmentController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

const { width: SW } = Dimensions.get('window');

// ─── Time-of-day greeting ─────────────────────────────────────────────────────
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Magandang Umaga,';
  if (h < 18) return 'Magandang Hapon,';
  return 'Magandang Gabi,';
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserHomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [firstName, setFirstName] = useState('Mag-aaral');
  const [pendingAssessments, setPendingAssessments] = useState(0);

  const { handleLogout, handleNextStep } = useNavigationHelper();

  // Animated entrance for the fab-style cards
  const cardScale1 = useRef(new Animated.Value(1)).current;
  const cardScale2 = useRef(new Animated.Value(1)).current;

  const animatePress = (scale: Animated.Value, cb: () => void) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 6 }),
    ]).start();
    cb();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.firstName) {
            setFirstName(profile.firstName);
          }

          const classCode = profile?.studentData?.classCode;
          if (classCode) {
            try {
              const actList = await AssessmentController.getStudentActivities(classCode);
              let pendingCount = 0;
              for (const act of actList) {
                const res = await AssessmentController.getStudentResult(act.activityId);
                if (!res) pendingCount++;
              }
              setPendingAssessments(pendingCount);
            } catch (actErr) {
              console.warn("Failed to fetch assessments for student:", actErr);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchData();
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
          source={require('../../../assets/images/cisckids copy.png')}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={S.headerMenuBtn}
          onPress={() => setMenuVisible(v => !v)}
          activeOpacity={0.7}
        >
          <BurgerIcon size={22} color={C.ink} />
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
              onPress={() => { setMenuVisible(false); handleNextStep('Tungkol'); }}
              style={S.dropdownItem}
              activeOpacity={0.75}
            >
              <View style={[S.dropdownIconBox, { backgroundColor: C.green + '15' }]}>
                <InfoIcon size={18} color={C.green} />
              </View>
              <Text style={[S.dropdownText, { color: C.green }]}>Tungkol</Text>
            </TouchableOpacity>

            <View style={S.dropdownDivider} />

            <TouchableOpacity
              onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
              style={S.dropdownItem}
              activeOpacity={0.75}
            >
              <View style={[S.dropdownIconBox, { backgroundColor: C.coral + '15' }]}>
                <LogoutIcon size={18} color={C.coral} />
              </View>
              <Text style={[S.dropdownText, { color: C.coral }]}>Maglog-out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <ScrollView
        style={S.body}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Greeting Hero ────────────────────────────────────────────────── */}
        <BounceIn delay={24}>
          <View style={S.greetCard}>
            {/* Decorative circles */}
            <View style={[S.heroCircle, { backgroundColor: C.green + '14', top: -35, right: -35, width: 150, height: 150 }]} />
            <View style={[S.heroCircle, { backgroundColor: C.teal + '0A', bottom: -25, left: -25, width: 100, height: 100 }]} />
            <View style={[S.heroCircle, { backgroundColor: C.mint + '18', top: 20, right: 60, width: 50, height: 50 }]} />

            <View style={S.greetContent}>
              <Text style={S.greetTimeLabel}>{getTimeGreeting().toUpperCase()}</Text>
              <Text style={S.greetName}>{firstName}!</Text>
              <Text style={S.greetSub}>Subukan natin ang iyong galing sa pagbasa!</Text>
            </View>

            <View style={S.greetImgWrapper}>
              <FloatingImage
                source={require('../../../assets/images/Imagination-Reading.png')}
                style={S.greetImage}
              />
            </View>
          </View>
        </BounceIn>

        {/* ── IYONG DAPAT GAWIN ───────────────────────────────────────────── */}
        <View style={S.sectionLabelRow}>
          <View style={S.sectionLabelDot} />
          <Text style={S.sectionLabel}>IYONG DAPAT GAWIN</Text>
        </View>

        <BounceIn delay={60}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => animatePress(cardScale1, () => handleNextStep('PassageSelection'))}
          >
            <Animated.View style={[S.primaryCard, { transform: [{ scale: cardScale1 }] }]}>
              <View style={S.primaryCardGlow} />
              <View style={S.primaryIconBox}>
                <BookIcon size={30} color={C.white} />
              </View>
              <View style={S.primaryTextBox}>
                <Text style={S.primaryLabel}>Pagbasa</Text>
                <Text style={S.primarySub}>Magsanay ng pagbabasa</Text>
              </View>
              <View style={S.primaryArrow}>
                <ChevronRightIcon size={20} color={C.white} />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Kasaysayan */}
          <BounceIn delay={96}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => animatePress(cardScale2, () => handleNextStep('ReadingHistory'))}
            >
              <Animated.View style={[S.secondaryCard, { transform: [{ scale: cardScale2 }] }]}>
                <View style={S.secondaryCardGlow} />
                <View style={S.secondaryIconBox}>
                  <HistoryIcon size={30} color={C.green} />
                </View>
                <View style={S.secondaryTextBox}>
                  <Text style={S.secondaryLabel}>Kasaysayan</Text>
                  <Text style={S.secondarySub}>Nakaraang Pagbasa</Text>
                </View>
                <View style={S.secondaryArrow}>
                  <ChevronRightIcon size={20} color={C.green} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </BounceIn>

          {/* Aking Klase */}
          <BounceIn delay={132}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleNextStep('MyClasses')}
            >
              <Animated.View style={[S.secondaryCard, { transform: [{ scale: cardScale2 }] }]}>
                <View style={S.secondaryCardGlow} />
                <View style={[S.secondaryIconBox, { backgroundColor: C.sky + '15' }]}>
                  <UsersIcon size={30} color={C.sky} />
                </View>
                <View style={S.secondaryTextBox}>
                  <Text style={S.secondaryLabel}>Aking Klase</Text>
                  <Text style={S.secondarySub}>Tingnan ang klase</Text>
                </View>
                <View style={S.secondaryArrow}>
                  <ChevronRightIcon size={20} color={C.sky} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </BounceIn>

          {/* Aking Profile */}
          <BounceIn delay={168}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleNextStep('Profile')}
            >
              <Animated.View style={[S.secondaryCard, { transform: [{ scale: cardScale2 }] }]}>
                <View style={S.secondaryCardGlow} />
                <View style={[S.secondaryIconBox, { backgroundColor: C.green + '15' }]}>
                  <UserProfileIcon size={30} color={C.green} />
                </View>
                <View style={S.secondaryTextBox}>
                  <Text style={S.secondaryLabel}>Aking Profile</Text>
                  <Text style={S.secondarySub}>I-edit ang profile</Text>
                </View>
                <View style={S.secondaryArrow}>
                  <ChevronRightIcon size={20} color={C.green} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </BounceIn>

        </BounceIn>

      </ScrollView>

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => {
          try {
            await handleLogout();
          } catch (e) {
            console.error('Logout failed:', e);
            setLogoutVisible(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = (SW - 48 - 12) / 2;

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
  headerLogo: { width: 100, height: 90 },
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
    top: 68,
    right: 16,
    backgroundColor: C.white,
    borderRadius: Radii.md,
    ...Shadows.cardLift,
    minWidth: 180,
    zIndex: 1000,
    paddingVertical: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: C.slate + '15',
    marginHorizontal: 14,
  },

  // ── Body ────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // ── Greeting Card ───────────────────────────────────────────────────────
  greetCard: {
    backgroundColor: C.white,
    borderRadius: Radii.xl,
    padding: 18,
    minHeight: 150,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    ...Shadows.cardLift,
  },
  heroCircle: { position: 'absolute', borderRadius: 999 },
  greetContent: { flex: 1, zIndex: 10 },
  greetTimeLabel: {
    fontSize: 12, fontFamily: 'Andika-Bold', color: C.green, letterSpacing: 1.5, marginBottom: 6,
  },
  greetName: {
    fontSize: 32, fontFamily: 'Andika-Bold', color: C.ink, lineHeight: 38, marginBottom: 6,
  },
  greetSub: {
    fontSize: 13, fontFamily: 'Andika-Regular', color: C.slate, lineHeight: 19, width: '95%',
  },
  greetImgWrapper: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  greetImage: { width: 110, height: 150, resizeMode: 'contain' },

  // ── Section Label ───────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    marginLeft: 4,
  },
  sectionLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Andika-Bold',
    color: C.slate,
    letterSpacing: 1.2,
  },

  // ── Primary Card (Pagbasa) ──────────────────────────────────────────────
  primaryCard: {
    backgroundColor: C.green,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    overflow: 'hidden',
    ...Shadows.button,
    shadowColor: C.greenDark,
    shadowOpacity: 0.3,
  },
  primaryCardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  primaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryTextBox: { flex: 1 },
  primaryLabel: {
    fontSize: 18, fontFamily: 'Andika-Bold', color: C.white, marginBottom: 2,
  },
  primarySub: {
    fontSize: 13, fontFamily: 'Andika-Regular', color: 'rgba(255,255,255,0.75)',
  },
  primaryArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

// ── Secondary Cards ─────────────────────────────────────────────────────
secondaryCard: {
    marginTop: 10,
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    ...Shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  secondaryCardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryIconBox: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: C.greenLight,
  },
  secondaryTextBox: { flex: 1 },
  secondaryLabel: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    marginBottom: 2,
  },
  secondarySub: {
    fontSize: 13,
    fontFamily: 'Andika-Regular',
    color: C.slate,
  },
  secondaryArrow: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: C.greenLight,
  },

  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  notifTxt: { color: C.white, fontSize: 10, fontFamily: 'Andika-Bold' },

});
