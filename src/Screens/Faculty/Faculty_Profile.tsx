import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import BottomNav from '../../Components/Faculty/NavigationBar/BottomNav';
import {
  getUserProfile,
  getCurrentUser,
} from '../../Controller/AuthenticationController';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import firestore from '@react-native-firebase/firestore';

const { width: SW } = Dimensions.get('window');

// ─── Palette (same green system as all other screens) ─────────────────────────
const C = {
  green:      '#2ecc71',
  greenDark:  '#27ae60',
  greenDeep:  '#1a7a45',
  greenLight: '#d4f5e2',
  greenPale:  '#f0faf4',
  mint:       '#a8edce',
  teal:       '#1abc9c',
  yellow:     '#f9e04b',
  orange:     '#f39c12',
  blue:       '#3498db',
  white:      '#ffffff',
  ink:        '#1b2e23',
  inkLight:   '#4a6358',
  slate:      '#8fafa0',
  bg:         '#f0faf4',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: any; h?: number; r?: number }) {
  const anim = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,    duration: 750, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={{ width: w, height: h, borderRadius: r, backgroundColor: C.mint, opacity: anim, marginBottom: 8 }}
    />
  );
}

// ─── BounceIn ─────────────────────────────────────────────────────────────────
function BounceIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scale   = useRef(new Animated.Value(0.78)).current;
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
  return <Animated.View style={{ transform: [{ scale }], opacity }}>{children}</Animated.View>;
}

// ─── Info Pill ────────────────────────────────────────────────────────────────
function InfoPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={S.infoPill}>
      <Text style={S.infoPillIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={S.infoPillLabel}>{label}</Text>
        <Text style={S.infoPillValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  emoji,
  value,
  label,
  color,
}: {
  emoji: string;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <View style={[S.statCard, { borderTopColor: color }]}>
      <Text style={S.statEmoji}>{emoji}</Text>
      <Text style={[S.statValue, { color }]}>{value}</Text>
      <Text style={S.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Class Row ────────────────────────────────────────────────────────────────
function ClassRow({
  classId,
  index,
}: {
  classId: string;
  index: number;
}) {
  const [classInfo, setClassInfo] = useState<{
    className: string;
    gradeLevel: number;
    studentCount: number;
    classCode: string;
  } | null>(null);

  const ACCENT_COLORS = [C.green, C.teal, C.blue, C.orange, C.yellow];
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  useEffect(() => {
    // Fetch class info from Firestore
    const fetchClass = async () => {
      try {
        const doc = await firestore().collection('classes').doc(classId).get();
        if (doc.exists()) {
          const data = doc.data();
          setClassInfo({
            className:    data?.className    ?? 'Unknown Class',
            gradeLevel:   data?.gradeLevel   ?? 0,
            studentCount: data?.studentIds?.length ?? 0,
            classCode:    data?.classCode    ?? '—',
          });
        }
      } catch (e) {
        setClassInfo({
          className:    'Unknown Class',
          gradeLevel:   0,
          studentCount: 0,
          classCode:    '—',
        });
      }
    };
    fetchClass();
  }, [classId]);

  if (!classInfo) {
    return (
      <View style={S.classRow}>
        <Skeleton h={18} w="60%" />
        <Skeleton h={13} w="40%" />
      </View>
    );
  }

  return (
    <View style={[S.classRow, { borderLeftColor: accent }]}>
      <View style={[S.classIconBubble, { backgroundColor: accent + '22' }]}>
        <Text style={S.classIcon}>🏫</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={S.className}>{classInfo.className}</Text>
        <Text style={S.classMeta}>
          Grade {classInfo.gradeLevel}  •  Code: {classInfo.classCode}
        </Text>
      </View>
      <View style={[S.studentCountBadge, { backgroundColor: accent }]}>
        <Text style={S.studentCountText}>{classInfo.studentCount}</Text>
        <Text style={S.studentCountLabel}>mag-aaral</Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FacultyProfile() {
  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [profileData,   setProfileData]   = useState<UserDocument | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const { handleLogout } = useNavigationHelper();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const cur = getCurrentUser();
      if (!cur) { setError('No user logged in'); return; }
      const profile = await getUserProfile(cur.uid);
      setProfileData(profile);
    } catch (e: any) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts: any): string => {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return '—'; }
  };

  const getSexLabel = (sex?: string) =>
    sex === 'male' ? 'Lalaki' : sex === 'female' ? 'Babae' : '—';

  const assignedClasses  = profileData?.facultyData?.assignedClassIds   ?? [];
  const assignedGrades   = profileData?.facultyData?.assignedGradeLevels ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.bg}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}  // room for BottomNav
      >
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

        {/* ── Loading skeletons ──────────────────────────────────────────── */}
        {loading && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <View style={[S.heroCard, { alignItems: 'flex-start', gap: 10 }]}>
              <Skeleton h={80} w={80} r={40} />
              <Skeleton h={22} w="55%" />
              <Skeleton h={14} w="35%" />
            </View>
            <View style={S.section}>
              <Skeleton h={18} w="40%" />
              <Skeleton h={14} w="70%" />
              <Skeleton h={14} w="60%" />
            </View>
          </View>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {!loading && error && (
          <View style={S.emptyState}>
            <Text style={{ fontSize: 40 }}>😕</Text>
            <Text style={S.emptyTitle}>{error}</Text>
            <TouchableOpacity style={S.retryBtn} onPress={fetchProfile}>
              <Text style={S.retryText}>Subukan Ulit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Main content ───────────────────────────────────────────────── */}
        {!loading && !error && profileData && (
          <>
            {/* ── Hero Card ──────────────────────────────────────────────── */}
            <BounceIn delay={50}>
              <View style={S.heroCard}>
                {/* Avatar */}
                <View style={S.avatarWrap}>
                  <Image
                    source={
                      profileData.profileImageUrl
                        ? { uri: profileData.profileImageUrl }
                        : require('../../../assets/images/defaultProfile.png')
                    }
                    style={S.avatar}
                  />
                  {/* Teacher badge */}
                  <View style={S.teacherBadge}>
                    <Text style={S.teacherBadgeText}>👨‍🏫 Guro</Text>
                  </View>
                </View>

                {/* Name + email */}
                <Text style={S.heroName}>
                  {profileData.firstName} {profileData.lastName}
                </Text>
                {profileData.middleName ? (
                  <Text style={S.heroMiddle}>
                    {profileData.middleName}
                  </Text>
                ) : null}
                <Text style={S.heroEmail}>{profileData.email}</Text>

                {/* Quick stat pills */}
                <View style={S.heroPills}>
                  <View style={[S.heroPill, { backgroundColor: C.greenLight }]}>
                    <Text style={S.heroPillText}>
                      🏫 {assignedClasses.length} klase
                    </Text>
                  </View>
                  <View style={[S.heroPill, { backgroundColor: C.greenLight }]}>
                    <Text style={S.heroPillText}>
                      📚 Grade {assignedGrades.join(', ') || '—'}
                    </Text>
                  </View>
                </View>
              </View>
            </BounceIn>

            {/* ── Stats row ──────────────────────────────────────────────── */}
            <BounceIn delay={120}>
              <View style={S.statsRow}>
                <StatCard
                  emoji="🏫"
                  value={assignedClasses.length}
                  label="Klase"
                  color={C.green}
                />
                <StatCard
                  emoji="📚"
                  value={assignedGrades.length > 0 ? `G${assignedGrades.join('/')}` : '—'}
                  label="Grade Level"
                  color={C.teal}
                />
                <StatCard
                  emoji="📅"
                  value={formatDate(profileData.createdAt).split(' ')[2] ?? '—'}
                  label="Taon ng Pagsali"
                  color={C.orange}
                />
              </View>
            </BounceIn>

            {/* ── Personal Information ───────────────────────────────────── */}
            <BounceIn delay={180}>
              <View style={S.section}>
                <Text style={S.sectionTitle}>👤 Personal na Impormasyon</Text>
                <View style={S.pillGrid}>
                  <InfoPill
                    icon="🧑"
                    label="Buong Pangalan"
                    value={`${profileData.firstName} ${profileData.middleName ? profileData.middleName + ' ' : ''}${profileData.lastName}`}
                  />
                  <InfoPill
                    icon="⚧"
                    label="Kasarian"
                    value={getSexLabel(profileData.sex)}
                  />
                  <InfoPill
                    icon="📧"
                    label="Email"
                    value={profileData.email ?? '—'}
                  />
                  <InfoPill
                    icon="🗓"
                    label="Petsa ng Pagsali"
                    value={formatDate(profileData.createdAt)}
                  />
                  <InfoPill
                    icon="🔄"
                    label="Huling Na-update"
                    value={formatDate(profileData.updatedAt)}
                  />
                </View>
              </View>
            </BounceIn>

            {/* ── Academic Information ───────────────────────────────────── */}
            <BounceIn delay={240}>
              <View style={S.section}>
                <Text style={S.sectionTitle}>🎓 Akademikong Impormasyon</Text>
                <View style={S.pillGrid}>
                  <InfoPill
                    icon="📚"
                    label="Itinalagang Grade Level"
                    value={
                      assignedGrades.length > 0
                        ? assignedGrades.map(g => `Grade ${g}`).join(', ')
                        : 'Wala pang itinalaga'
                    }
                  />
                  <InfoPill
                    icon="🏫"
                    label="Bilang ng Klase"
                    value={`${assignedClasses.length} klase`}
                  />
                </View>
              </View>
            </BounceIn>

            {/* ── Assigned Classes ───────────────────────────────────────── */}
            {assignedClasses.length > 0 && (
              <BounceIn delay={300}>
                <View style={S.section}>
                  <Text style={S.sectionTitle}>🏫 Mga Klase</Text>
                  {assignedClasses.map((classId, i) => (
                    <ClassRow key={classId} classId={classId} index={i} />
                  ))}
                </View>
              </BounceIn>
            )}

            {assignedClasses.length === 0 && (
              <BounceIn delay={300}>
                <View style={S.section}>
                  <Text style={S.sectionTitle}>🏫 Mga Klase</Text>
                  <View style={S.emptyClasses}>
                    <Text style={S.emptyClassEmoji}>📋</Text>
                    <Text style={S.emptyClassText}>
                      Wala pang klase na itinalaga.
                    </Text>
                  </View>
                </View>
              </BounceIn>
            )}

            {/* ── Refresh button ─────────────────────────────────────────── */}
            <BounceIn delay={360}>
              <TouchableOpacity
                style={S.refreshBtn}
                onPress={fetchProfile}
                activeOpacity={0.8}
              >
                <Text style={S.refreshText}>🔄  I-refresh ang Profile</Text>
              </TouchableOpacity>
            </BounceIn>
          </>
        )}
      </ScrollView>

      <BottomNav />

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

  // Hero card
  heroCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderTopWidth: 5,
    borderTopColor: C.green,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrap:    { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 4, borderColor: C.green,
  },
  teacherBadge: {
    position: 'absolute', bottom: -6, left: '50%',
    transform: [{ translateX: -36 }],
    backgroundColor: C.greenDark,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    minWidth: 72, alignItems: 'center',
  },
  teacherBadgeText: { color: C.white, fontSize: 11, fontWeight: '700' },
  heroName:   { fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 6, textAlign: 'center' },
  heroMiddle: { fontSize: 14, color: C.slate, marginTop: 2 },
  heroEmail:  { fontSize: 13, color: C.slate, marginTop: 4, marginBottom: 14 },
  heroPills:  { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  heroPill: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  heroPillText: { fontSize: 13, fontWeight: '700', color: C.greenDeep },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: C.white,
    borderRadius: 18, padding: 14,
    alignItems: 'center', borderTopWidth: 4,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, color: C.slate, textAlign: 'center' },

  // Section
  section: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '800', color: C.ink, marginBottom: 14,
  },

  // Info pills
  pillGrid: { gap: 10 },
  infoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.greenPale, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  infoPillIcon:  { fontSize: 18 },
  infoPillLabel: { fontSize: 11, color: C.slate },
  infoPillValue: { fontSize: 14, fontWeight: '700', color: C.ink },

  // Class rows
  classRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.greenPale, borderRadius: 14,
    borderLeftWidth: 5, padding: 14, marginBottom: 10, gap: 12,
  },
  classIconBubble: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  classIcon:    { fontSize: 20 },
  className:    { fontSize: 15, fontWeight: '800', color: C.ink, marginBottom: 3 },
  classMeta:    { fontSize: 12, color: C.slate },
  studentCountBadge: {
    borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', minWidth: 52,
  },
  studentCountText:  { fontSize: 18, fontWeight: '900', color: C.white },
  studentCountLabel: { fontSize: 10, color: C.white, fontWeight: '600' },

  // Empty classes
  emptyClasses: { alignItems: 'center', paddingVertical: 20 },
  emptyClassEmoji: { fontSize: 36, marginBottom: 8 },
  emptyClassText:  { fontSize: 14, color: C.slate, textAlign: 'center' },

  // Refresh
  refreshBtn: {
    backgroundColor: C.green,
    marginHorizontal: 16, marginTop: 16,
    paddingVertical: 16, borderRadius: 20,
    alignItems: 'center',
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  refreshText: { color: C.white, fontSize: 16, fontWeight: '800' },

  // Error / empty
  emptyState: {
    alignItems: 'center', paddingTop: 80, paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16, color: C.inkLight, textAlign: 'center',
    marginTop: 12, marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: C.green,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24,
  },
  retryText: { color: C.white, fontWeight: '700', fontSize: 15 },
});