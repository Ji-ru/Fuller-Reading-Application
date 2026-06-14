import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import bubbles from '../../UI_Designs/BubblesDesign';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import {
  getUserProfile,
  getCurrentUser,
  getClassByCode,
  updateUserProfile,
} from '../../Controller/AuthenticationController';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { UserDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import {
  UserProfileIcon, MailIcon,
  TargetIcon, ZapIcon, AlertTriangleIcon,
  TypeIcon, BookOpenIcon,
  TrophyIcon, ThumbsUpIcon, FlexIcon, SproutIcon, RocketIcon, StarIcon,
  LogoutIcon, BurgerIcon, CakeIcon, GenderIcon
} from '../../Components/GlobalUse/Icons';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Header Icons ────────────────────────────────────────────────────────────
function BackArrow({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}
 

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudentStats {
  totalAttempts: number;
  averageAccuracy: number;
  topMiscueType: string;
  mostCommonMiscueWords: { word: string; count: number }[];
  passagePerformance: { title: string; accuracy: number; attempts: number }[];
}
interface ProgressData {
  date: string;
  accuracy: number;
  wpm: number;
  passageTitle: string;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  visible,
  title,
  emoji,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  emoji: string; // kept for backwards compat but now we render an icon
  onClose: () => void;
  children: React.ReactNode;
}) {
  const slideY    = useRef(new Animated.Value(300)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY,    { toValue: 0,   useNativeDriver: true, tension: 65, friction: 10 }),
        Animated.timing(bgOpacity, { toValue: 1,   duration: 200,         useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY,    { toValue: 300, duration: 220, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0,   duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[S.modalOverlay, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View style={[S.modalSheet, { transform: [{ translateY: slideY }] }]}>
          <View style={S.modalHandle} />
          <View style={S.modalHeader}>
            <View style={S.modalIconWrap}>
              {title === 'Katumpakan' && <TargetIcon size={24} color={C.greenDeep} />}
              {title === 'Bilis ng Pagbabasa (WPM)' && <ZapIcon size={24} color={C.orange} />}
              {title === 'Mga Uri ng Pagkakamali' && <AlertTriangleIcon size={24} color={C.red} />}
              {title === 'Mga Pagtatangka sa Talata' && <BookOpenIcon size={24} color={C.teal} />}
              {title === 'Mga Salitang May Pagkakamali' && <TypeIcon size={24} color={C.orange} />}
            </View>
            <Text style={S.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={S.modalClose}>
              <Text style={S.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Accuracy Ring ────────────────────────────────────────────────────────────
function AccuracyRing({ value }: { value: number }) {
  const color = value >= 90 ? C.green : value >= 75 ? C.yellow : C.red;
  return (
    <View style={S.ringContainer}>
      <View style={[S.ringOuter, { borderColor: C.greenLight }]}>
        <View style={[S.ringInner, { borderColor: color }]}>
          <Text style={[S.ringValue, { color }]}>{value.toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBarChart({
  data,
  valueKey,
  color,
}: {
  data: ProgressData[];
  valueKey: 'accuracy' | 'wpm';
  color: string;
}) {
  const slice = data.slice(-8);
  const max   = Math.max(...slice.map(d => d[valueKey]), 1);
  return (
    <View style={S.miniChart}>
      {slice.map((d, i) => (
        <View key={i} style={S.miniBarCol}>
          <Text style={S.miniBarVal}>{d[valueKey]}</Text>
          <View style={[S.miniBar, { height: Math.max((d[valueKey] / max) * 80, 4), backgroundColor: color }]} />
          <Text style={S.miniBarDate}>{d.date}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Stat Tile (tappable) ─────────────────────────────────────────────────────
function StatTile({
  emoji,
  iconView,
  value,
  label,
  color,
  onPress,
  delay,
}: {
  emoji: string; // kept for type compat
  iconView?: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <BounceIn delay={delay}>
      <TouchableOpacity onPress={press} activeOpacity={0.85}>
        <Animated.View style={[S.statTile, { borderTopColor: color, transform: [{ scale }] }]}>
          <View style={{ marginBottom: 6 }}>
            {iconView || <StarIcon size={26} color={color} />}
          </View>
          <Text style={[S.statTileValue, { color }]}>{value}</Text>
          <Text style={S.statTileLabel}>{label}</Text>
          <Text style={S.statTileTap}>i-tap para sa detalye</Text>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function InfoPill({
  label,
  value,
  editing,
  onChangeText,
}: {
  label: string;
  value: string;
  editing?: boolean;
  onChangeText?: (text: string) => void;
}) {
  return (
    <View style={S.infoPill}>
      <View style={{ flex: 1 }}>
        <Text style={S.infoPillLabel}>{label}</Text>
        {editing && onChangeText ? (
          <TextInput
            style={S.infoPillInput}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={C.slate + '80'}
          />
        ) : (
          <Text style={S.infoPillValue} numberOfLines={1}>{value}</Text>
        )}
      </View>
    </View>
  );
}

function TrendPill({
  label,
  from,
  to,
  delta,
  suffix,
}: {
  label: string;
  from: number;
  to: number;
  delta: number;
  suffix: string;
}) {
  const flat  = Math.abs(delta) < 0.5;
  const up    = delta > 0;
  const color = flat ? C.slate : up ? C.green : C.red;
  const arrow = flat ? '→' : up ? '↑' : '↓';
  return (
    <View style={[S.trendPill, { borderColor: color }]}>
      {!!label && <Text style={S.trendPillLabel}>{label}</Text>}
      <Text style={[S.trendPillVal, { color }]}>
        {from}{suffix} {arrow} {to}{suffix}
      </Text>
      {!flat && (
        <Text style={[S.trendPillDelta, { color }]}>
          {up ? '+' : ''}{delta.toFixed(1)}{suffix}
        </Text>
      )}
    </View>
  );
}

function ModalStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[S.modalStat, { borderColor: color }]}>
      <Text style={[S.modalStatVal, { color }]}>{value}</Text>
      <Text style={S.modalStatLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Profile() {
  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [profileData,   setProfileData]   = useState<UserDocument | null>(null);
  const [classData,     setClassData]     = useState<ClassDocument | null>(null);
  const [readingStats,  setReadingStats]  = useState<StudentStats | null>(null);
  const [progressData,  setProgressData]  = useState<ProgressData[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [modal, setModal] = useState<'accuracy' | 'wpm' | 'miscues' | 'passages' | 'words' | null>(null);

  const { handleLogout, handleBackStep } = useNavigationHelper();

  // Edit profile states
  const [editingInfo, setEditingInfo] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    sex: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const cur = getCurrentUser();
      if (!cur) { setError('No user logged in'); return; }

      const profile = await getUserProfile(cur.uid);
      setProfileData(profile);

      // Populate edit data when profile loads
      if (profile) {
        setEditData({
          firstName: profile.firstName || '',
          middleName: profile.middleName || '',
          lastName: profile.lastName || '',
          dateOfBirth: profile.studentData?.dateOfBirth || '',
          sex: profile.sex || '',
        });
      }

      if (profile?.studentData?.classCode) {
        const cls = await getClassByCode(profile.studentData.classCode);
        setClassData(cls);
      }

      const [stats, progress] = await Promise.all([
        MiscueReportController.getStudentReadingStats(cur.uid),
        MiscueReportController.getStudentProgressOverTime(cur.uid),
      ]);
      setReadingStats(stats);
      setProgressData(progress);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // Trend computations
  const firstAcc = progressData[0]?.accuracy ?? 0;
  const lastAcc  = progressData[progressData.length - 1]?.accuracy ?? 0;
  const accDelta = lastAcc - firstAcc;
  const firstWpm = progressData[0]?.wpm ?? 0;
  const lastWpm  = progressData[progressData.length - 1]?.wpm ?? 0;
  const wpmDelta = lastWpm - firstWpm;
  const avgWpm   = progressData.length
    ? Math.round(progressData.reduce((s, d) => s + d.wpm, 0) / progressData.length)
    : 0;
  const bestAcc  = progressData.length ? Math.max(...progressData.map(d => d.accuracy)) : 0;
  const bestWpm  = progressData.length ? Math.max(...progressData.map(d => d.wpm)) : 0;

  const getReadingLevelLabel = (level?: string) => {
    const map: Record<string, { label: string; Icon: React.FC<{ size?: number; color?: string }> }> = {
      beginner:     { label: 'Baguhan',    Icon: SproutIcon },
      intermediate: { label: 'Gitna',      Icon: BookOpenIcon },
      advanced:     { label: 'Abante',     Icon: RocketIcon },
      expert:       { label: 'Dalubhasa',  Icon: StarIcon },
    };
    return map[level || 'beginner'] ?? map.beginner;
  };

  // Handle save info
  const handleSaveInfo = async () => {
    try {
      const cur = getCurrentUser();
      if (!cur) return;

      await updateUserProfile(cur.uid, {
        firstName: editData.firstName,
        middleName: editData.middleName,
        lastName: editData.lastName,
        sex: editData.sex,
        studentData: {
          dateOfBirth: editData.dateOfBirth,
        },
      });

      setEditingInfo(false);
      await fetchAll();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
  };

// ─── Jumping Dots Loading ───────────────────────────────────────────────────


  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={S.loadingBg}>
        <LoadingDots color={C.green} />
        <Text style={S.loadingTitle}>Naglo-load ang profile…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={S.loadingBg}>
        <View style={S.loadingCard}>
          <AlertTriangleIcon size={40} color={C.red} />
          <Text style={S.errorText}>{error}</Text>
          <TouchableOpacity style={S.retryBtn} onPress={fetchAll}>
            <Text style={S.retryText}>Subukan Ulit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.bg}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Bubbles */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
        </View>

        {/* Nav */}
        <View style={{ zIndex: 100 }}>
          <View style={S.headerBar}>
            <TouchableOpacity style={S.headerMenuBtn} onPress={() => handleBackStep()} activeOpacity={0.7}>
              <BackArrow />
            </TouchableOpacity>
            <Image style={S.headerLogo} source={require('../../../assets/images/cisckids copy.png')} resizeMode="contain" />
            <View style={{ width: 44 }} />
          </View>
        </View>


        {/* ── Hero Card ─────────────────────────────────────────────────────── */}
        <BounceIn delay={30}>
          <View style={S.heroCard}>
            <View style={S.heroAvatarWrap}>
              <Image
                source={
                  profileData?.profileImageUrl
                    ? { uri: profileData.profileImageUrl }
                    : require('../../../assets/images/defaultProfile.png')
                }
                style={S.heroAvatar}
              />
            </View>
            <Text style={S.heroName}>{profileData?.firstName} {profileData?.lastName}</Text>
            <Text style={S.heroSub}>
              Baitang {profileData?.studentData?.gradeLevel ?? '—'} • {classData?.className ?? 'Walang klase'}
            </Text>
            {/* Accuracy display removed */}
          </View>
        </BounceIn>

        {/* ── Personal Info ─────────────────────────────────────────────────── */}
        <BounceIn delay={72}>
          <View style={S.section}>
            <View style={S.sectionTitleRow}>
              <UserProfileIcon size={16} color={C.ink} />
              <Text style={S.sectionTitle}>Pangunahing Impormasyon</Text>
              <TouchableOpacity onPress={() => setEditingInfo(!editingInfo)} style={S.editBtn} activeOpacity={0.7}>
                <Text style={S.editBtnText}>{editingInfo ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>
            
            {editingInfo ? (
              <View style={S.editForm}>
                <View style={S.editFieldGroup}>
                  <Text style={S.editFieldLabel}>Unang Pangalan</Text>
                  <TextInput
                    style={S.editInput}
                    placeholder="Unang Pangalan"
                    placeholderTextColor={C.slate}
                    value={editData.firstName}
                    onChangeText={(v) => setEditData({ ...editData, firstName: v })}
                  />
                </View>
                <View style={S.editFieldGroup}>
                  <Text style={S.editFieldLabel}>Gitnang Pangalan</Text>
                  <TextInput
                    style={S.editInput}
                    placeholder="Gitnang Pangalan"
                    placeholderTextColor={C.slate}
                    value={editData.middleName}
                    onChangeText={(v) => setEditData({ ...editData, middleName: v })}
                  />
                </View>
                <View style={S.editFieldGroup}>
                  <Text style={S.editFieldLabel}>Apilyedo</Text>
                  <TextInput
                    style={S.editInput}
                    placeholder="Apilyedo"
                    placeholderTextColor={C.slate}
                    value={editData.lastName}
                    onChangeText={(v) => setEditData({ ...editData, lastName: v })}
                  />
                </View>
                <View style={S.editFieldGroup}>
                  <Text style={S.editFieldLabel}>Petsa ng Kapanganakan</Text>
                  <TextInput
                    style={S.editInput}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={C.slate}
                    value={editData.dateOfBirth}
                    onChangeText={(v) => setEditData({ ...editData, dateOfBirth: v })}
                  />
                </View>
                <View style={S.editFieldGroup}>
                  <Text style={S.editFieldLabel}>Kasarian</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[S.genderBtn, editData.sex === 'male' && S.genderBtnActive]}
                      onPress={() => setEditData({ ...editData, sex: 'male' })}
                      activeOpacity={0.8}
                    >
                      <Text style={[S.genderBtnText, editData.sex === 'male' && S.genderBtnTextActive]}>Lalaki</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[S.genderBtn, editData.sex === 'female' && S.genderBtnActive]}
                      onPress={() => setEditData({ ...editData, sex: 'female' })}
                      activeOpacity={0.8}
                    >
                      <Text style={[S.genderBtnText, editData.sex === 'female' && S.genderBtnTextActive]}>Babae</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={S.saveBtn} onPress={handleSaveInfo} activeOpacity={0.8}>
                  <Text style={S.saveBtnText}>I-save ang mga Pagbabago</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={S.infoGrid}>
                <View style={S.infoItem}>
                  <View style={[S.infoIconBox, { backgroundColor: C.green + '12' }]}>
                    <UserProfileIcon size={18} color={C.green} />
                  </View>
                  <View style={S.infoTextBox}>
                    <Text style={S.infoPillLabel}>Unang Pangalan</Text>
                    <Text style={S.infoPillValue}>{profileData?.firstName ?? '—'}</Text>
                  </View>
                </View>
                <View style={S.infoItem}>
                  <View style={[S.infoIconBox, { backgroundColor: C.teal + '12' }]}>
                    <UserProfileIcon size={18} color={C.teal} />
                  </View>
                  <View style={S.infoTextBox}>
                    <Text style={S.infoPillLabel}>Gitnang Pangalan</Text>
                    <Text style={S.infoPillValue}>{profileData?.middleName ?? '—'}</Text>
                  </View>
                </View>
                <View style={S.infoItem}>
                  <View style={[S.infoIconBox, { backgroundColor: C.sky + '12' }]}>
                    <UserProfileIcon size={18} color={C.sky} />
                  </View>
                  <View style={S.infoTextBox}>
                    <Text style={S.infoPillLabel}>Apilyedo</Text>
                    <Text style={S.infoPillValue}>{profileData?.lastName ?? '—'}</Text>
                  </View>
                </View>
                <View style={S.infoItem}>
                  <View style={[S.infoIconBox, { backgroundColor: C.orange + '12' }]}>
                    <CakeIcon size={18} color={C.orange} />
                  </View>
                  <View style={S.infoTextBox}>
                    <Text style={S.infoPillLabel}>Petsa ng Kapanganakan</Text>
                    <Text style={S.infoPillValue}>{profileData?.studentData?.dateOfBirth ?? '—'}</Text>
                  </View>
                </View>
                <View style={S.infoItem}>
                  <View style={[S.infoIconBox, { backgroundColor: C.purple + '12' }]}>
                    <GenderIcon size={18} color={C.purple} />
                  </View>
                  <View style={S.infoTextBox}>
                    <Text style={S.infoPillLabel}>Kasarian</Text>
                    <Text style={S.infoPillValue}>{profileData?.sex === 'male' ? 'Lalaki' : profileData?.sex === 'female' ? 'Babae' : '—'}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </BounceIn>
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════════════
          DETAIL MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Accuracy */}
      <DetailModal visible={modal === 'accuracy'} title="Katumpakan" emoji="🎯" onClose={() => setModal(null)}>
        <View style={S.modalBody}>
          <Text style={S.modalFormula}>Paano kinukuwenta ang Katumpakan?</Text>
          <View style={S.formulaBox}>
            <Text style={S.formulaText}>Katumpakan = (Tamang Salita ÷ Kabuuang Salita) × 100</Text>
          </View>
          <Text style={S.modalDesc}>
            Halimbawa: kung may 90 tamang salita sa 100 na salita, ang katumpakan ay 90%.
          </Text>
          <View style={S.modalStatRow}>
            <ModalStat label="Kasalukuyan" value={`${readingStats?.averageAccuracy ?? 0}%`} color={C.green} />
            <ModalStat label="Pinakamataas" value={`${bestAcc}%`}                           color={C.teal} />
          </View>
          {progressData.length > 1 && (
            <>
              <Text style={S.modalSub}>Kasaysayan ng Katumpakan</Text>
              <MiniBarChart data={progressData} valueKey="accuracy" color={C.green} />
              <View style={[S.trendRow, { marginTop: 10 }]}>
                <TrendPill label="" from={firstAcc} to={lastAcc} delta={accDelta} suffix="%" />
              </View>
            </>
          )}
          <View style={S.gradeGuide}>
            <Text style={S.gradeGuideTitle}>Gabay sa Grado</Text>
            {[
              { range: '90–100%', label: 'Mahusay',            color: C.green  },
              { range: '75–89%',  label: 'Magaling',            color: C.yellow },
              { range: '0–74%',   label: 'Kailangan ng Tulong', color: C.red    },
            ].map(g => (
              <View key={g.range} style={[S.gradeRow, { borderLeftColor: g.color }]}>
                <Text style={S.gradeRange}>{g.range}</Text>
                <Text style={[S.gradeLabel, { color: g.color }]}>{g.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </DetailModal>

      {/* WPM */}
      <DetailModal visible={modal === 'wpm'} title="Bilis ng Pagbabasa (WPM)" emoji="⚡" onClose={() => setModal(null)}>
        <View style={S.modalBody}>
          <Text style={S.modalFormula}>Paano kinukuwenta ang WPM?</Text>
          <View style={S.formulaBox}>
            <Text style={S.formulaText}>WPM = Kabuuang Salita ÷ (Oras sa Minuto)</Text>
          </View>
          <Text style={S.modalDesc}>
            Halimbawa: kung nabasa mo ang 120 salita sa loob ng 2 minuto, ang iyong WPM ay 60.
          </Text>
          <View style={S.modalStatRow}>
            <ModalStat label="Average"      value={`${avgWpm}`}  color={C.orange} />
            <ModalStat label="Pinakamataas" value={`${bestWpm}`} color={C.teal}   />
          </View>
          {progressData.length > 1 && (
            <>
              <Text style={S.modalSub}>Kasaysayan ng WPM</Text>
              <MiniBarChart data={progressData} valueKey="wpm" color={C.orange} />
              <View style={[S.trendRow, { marginTop: 10 }]}>
                <TrendPill label="" from={firstWpm} to={lastWpm} delta={wpmDelta} suffix="" />
              </View>
            </>
          )}
          <View style={S.gradeGuide}>
             <Text style={S.gradeGuideTitle}>Pamantayan para sa Baitang 1–3</Text>
            {[
              { range: '60+ WPM',    label: 'Mabilis',     color: C.green  },
              { range: '40–59 WPM',  label: 'Katamtaman',  color: C.yellow },
              { range: 'Wala sa 40', label: 'Baguhan',     color: C.red    },
            ].map(g => (
              <View key={g.range} style={[S.gradeRow, { borderLeftColor: g.color }]}>
                <Text style={S.gradeRange}>{g.range}</Text>
                <Text style={[S.gradeLabel, { color: g.color }]}>{g.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </DetailModal>

      {/* Miscue Types */}
      <DetailModal visible={modal === 'miscues'} title="Mga Uri ng Pagkakamali" emoji="⚠️" onClose={() => setModal(null)}>
        <View style={S.modalBody}>
          <Text style={S.modalDesc}>
            Ang <Text style={{ fontWeight: '700' }}>miscue</Text> ay isang pagkakamali sa pagbabasa. May apat na uri:
          </Text>
          {[
            { type: 'Substitution', fil: 'Pagpapalit', desc: 'Binago ang salita — "pusa" → "aso"',      color: C.red    },
            { type: 'Omission',     fil: 'Pagkakaltas',  desc: 'Nalaktawan ang isang salita',             color: C.orange },
            { type: 'Insertion',    fil: 'Pagdaragdag',  desc: 'Nagdagdag ng salitang hindi nasa teksto', color: C.yellow  },
            { type: 'Repetition',   fil: 'Pag-uulit',  desc: 'Inulit ang isang salita o parirala',       color: C.teal   },
          ].map(m => (
            <View key={m.type} style={[S.miscueTypeCard, { borderLeftColor: m.color }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[S.miscueTypeName, { color: m.color }]}>{m.fil}</Text>
                <Text style={S.miscueTypeEng}> ({m.type})</Text>
              </View>
              <Text style={S.miscueTypeDesc}>{m.desc}</Text>
              {readingStats?.topMiscueType.toLowerCase() === m.type.toLowerCase() && (
                <View style={[S.topBadge, { backgroundColor: m.color }]}>
                  <Text style={S.topBadgeText}>Pinakamadalas mo!</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </DetailModal>

      {/* Passage Performance */}
      <DetailModal visible={modal === 'passages'} title="Mga Pagtatangka sa Talata" emoji="📖" onClose={() => setModal(null)}>
        <View style={S.modalBody}>
          <Text style={S.modalDesc}>
            Narito ang iyong performance sa bawat talata na iyong binasa.
          </Text>
          {(readingStats?.passagePerformance ?? []).length === 0 && (
            <Text style={{ color: C.slate, textAlign: 'center', marginTop: 16 }}>Wala pang data.</Text>
          )}
          {(readingStats?.passagePerformance ?? []).map((p, i) => {
            const col = p.accuracy >= 90 ? C.green : p.accuracy >= 75 ? C.yellow : C.red;
            return (
              <View key={i} style={S.passageRow}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={S.passageTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={[S.passageAcc, { color: col }]}>{p.accuracy.toFixed(1)}%</Text>
                </View>
                <View style={S.passageBarBg}>
                  <View style={[S.passageBar, { width: `${p.accuracy}%`, backgroundColor: col }]} />
                </View>
                <Text style={S.passageAttempts}>{p.attempts} pagtatangka</Text>
              </View>
            );
          })}
        </View>
      </DetailModal>

      {/* Common Words */}
      <DetailModal visible={modal === 'words'} title="Mga Salitang May Pagkakamali" emoji="🔤" onClose={() => setModal(null)}>
        <View style={S.modalBody}>
          <Text style={S.modalDesc}>
            Ito ang mga salitang madalas mong mali. Subukan mong sanayin ang mga ito!
          </Text>
          {(readingStats?.mostCommonMiscueWords ?? []).map((w, i) => {
            const maxCount = readingStats?.mostCommonMiscueWords[0]?.count ?? 1;
            return (
              <View key={i} style={S.wordDetailRow}>
                <View style={[S.wordRank, { backgroundColor: i < 3 ? C.red : C.greenLight }]}>
                  <Text style={[S.wordRankText, { color: i < 3 ? C.white : C.greenDeep }]}>#{i + 1}</Text>
                </View>
                <Text style={S.wordDetailWord}>"{w.word}"</Text>
                <View style={S.wordDetailBarBg}>
                  <View
                    style={[
                      S.wordDetailBar,
                      { width: `${(w.count / maxCount) * 100}%`, backgroundColor: i < 3 ? C.red : C.orange },
                    ]}
                  />
                </View>
                <Text style={S.wordDetailCount}>{w.count}×</Text>
              </View>
            );
          })}
        </View>
      </DetailModal>

      <LogoutModal visible={logoutVisible} onCancel={() => setLogoutVisible(false)} onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  bg:           { flex: 1, backgroundColor: C.bg },
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
  menuIcon: { width: 22, height: 22, tintColor: C.ink },
  loadingBg:    { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  loadingCard:  { backgroundColor: C.white, borderRadius: Radii.lg, padding: 32, alignItems: 'center', width: SCREEN_WIDTH * 0.8 },

  loadingTitle: { fontSize: 18, fontWeight: '700', color: C.greenDeep, marginBottom: 4 },
  errorText:    { fontSize: 15, color: C.red, textAlign: 'center', marginVertical: 12 },
  retryBtn:     { backgroundColor: C.green, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  retryText:    { color: C.white, fontWeight: '700', fontSize: 15 },

  heroCard: {
    backgroundColor: C.white, marginHorizontal: 16, marginTop: 8,
    borderRadius: Radii.lg, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16,
    ...Shadows.cardLift,
  },
  heroAvatarWrap: { position: 'relative', marginBottom: 10 },
  heroAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: C.green },
  heroName: { fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 6 },
  heroSub:  { fontSize: 13, color: C.slate, marginTop: 2 },

  ringContainer: { alignItems: 'center', marginTop: 14 },
  ringOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 7, justifyContent: 'center', alignItems: 'center' },
  ringInner: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  ringValue: { fontSize: 18, fontWeight: '800' },
  ringUnit:  { fontSize: 9, color: C.slate },
  ringLabel: { marginTop: 6, fontSize: 12, fontWeight: '700' },

  section: {
    backgroundColor: C.white, marginHorizontal: 16, marginTop: 10,
    borderRadius: Radii.lg, padding: 14,
    ...Shadows.card,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle:     { fontSize: 16, fontWeight: '800', color: C.ink },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeMore:          { fontSize: 12, color: C.green, fontWeight: '600' },

  infoRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  infoGrid:     { gap: 10 },
  infoItem:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.greenPale, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  infoIconBox:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoTextBox:  { flex: 1 },
  infoPill:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.greenPale, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flex: 1 },
  infoPillInput: { fontSize: 15, fontWeight: '700', color: C.ink, flex: 1 },

  infoPillLabel: { fontSize: 11, color: C.slate, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoPillValue: { fontSize: 15, fontWeight: '700', color: C.ink, marginTop: 1 },

  editBtn:      { marginLeft: 'auto', backgroundColor: C.greenPale, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  editBtnText:  { fontSize: 13, fontWeight: '700', color: C.green },
  editForm:     { gap: 12, marginTop: 4 },
  editFieldGroup: { gap: 4 },
  editFieldLabel: { fontSize: 12, fontWeight: '700', color: C.slate, marginLeft: 4 },
  editInput:    {
    height: 37, backgroundColor: C.greenPale, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 14, fontWeight: '600', color: C.ink,
    borderWidth: 1.5, borderColor: C.greenLight,
  },
  saveBtn:      {
    backgroundColor: C.green, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginTop: 6,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnText:  { fontSize: 16, fontWeight: '800', color: C.white },

  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: {
    width: (SCREEN_WIDTH - 68 - 10) / 2, backgroundColor: C.greenPale,
    borderRadius: 18, padding: 16, alignItems: 'center', borderTopWidth: 4,
  },

  statTileValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statTileLabel: { fontSize: 14, color: C.inkLight, textAlign: 'center' },
  statTileTap:   { fontSize: 10, color: C.slate, marginTop: 6 },

  genderBtn: {
    flex: 1, height: 37, borderRadius: 12, backgroundColor: C.greenPale,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.greenLight,
  },
  genderBtnActive: {
    backgroundColor: C.green, borderColor: C.green,
  },
  genderBtnText: { fontSize: 15, fontWeight: '700', color: C.slate },
  genderBtnTextActive: { color: C.white },

  trendRow:       { flexDirection: 'row', gap: 10, marginBottom: 12 },
  trendPill:      { flex: 1, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', backgroundColor: C.white },
  trendPillLabel: { fontSize: 13, color: C.slate, marginBottom: 2 },
  trendPillVal:   { fontSize: 16, fontWeight: '700' },
  trendPillDelta: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  miniChart:   { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 6 },
  miniBarCol:  { alignItems: 'center', flex: 1 },
  miniBarVal:  { fontSize: 9, color: C.inkLight, marginBottom: 2 },
  miniBar:     { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  miniBarDate: { fontSize: 8, color: C.slate, marginTop: 3 },
  chartLabel:  { fontSize: 12, color: C.inkLight, fontWeight: '600', marginBottom: 6 },

  wordChips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordChip:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  wordChipText:  { fontSize: 13, fontWeight: '700', color: C.ink },
  wordChipCount: { fontSize: 11, color: C.ink, opacity: 0.7 },

  refreshBtn: {
    backgroundColor: C.green, marginHorizontal: 16, marginTop: 16, paddingVertical: 16, borderRadius: 20, alignItems: 'center',
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  refreshText: { color: C.white, fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(27,46,35,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, maxHeight: '85%',
  },
  modalHandle:    { width: 40, height: 5, borderRadius: 3, backgroundColor: C.mint, alignSelf: 'center', marginBottom: 14 },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalIconWrap: { marginRight: 10 },
  modalTitle:     { flex: 1, fontSize: 20, fontWeight: '800', color: C.ink },
  modalClose:     { padding: 6, backgroundColor: C.greenPale, borderRadius: 20 },
  modalCloseText: { fontSize: 14, color: C.inkLight, fontWeight: '700' },
  modalBody:      { paddingBottom: 20 },
  modalFormula:   { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 8 },
  formulaBox:     { backgroundColor: C.greenPale, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: C.green },
  formulaText:    { fontSize: 14, color: C.inkLight, fontStyle: 'italic' },
  modalDesc:      { fontSize: 14, color: C.inkLight, lineHeight: 21, marginBottom: 16 },
  modalSub:       { fontSize: 14, fontWeight: '700', color: C.ink, marginTop: 16, marginBottom: 8 },
  modalStatRow:   { flexDirection: 'row', gap: 12, marginBottom: 16 },
  modalStat:      { flex: 1, borderRadius: 14, borderWidth: 2, padding: 14, alignItems: 'center', backgroundColor: C.greenPale },
  modalStatVal:   { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  modalStatLabel: { fontSize: 12, color: C.slate },

  gradeGuide:      { backgroundColor: C.greenPale, borderRadius: 14, padding: 14, marginTop: 16 },
  gradeGuideTitle: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 10 },
  gradeRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingLeft: 12, borderLeftWidth: 4, marginBottom: 6, backgroundColor: C.white, borderRadius: 8 },
  gradeRange:      { flex: 1, fontSize: 13, color: C.ink },
  gradeLabel:      { fontSize: 13, fontWeight: '700' },

  miscueTypeCard:  { borderLeftWidth: 5, paddingLeft: 14, paddingVertical: 12, marginBottom: 12, backgroundColor: C.greenPale, borderRadius: 12 },
  miscueTypeName:  { fontSize: 16, fontWeight: '800' },
  miscueTypeEng:   { fontSize: 13, color: C.slate },
  miscueTypeDesc:  { fontSize: 13, color: C.inkLight },
  topBadge:        { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  topBadgeText:    { color: C.white, fontSize: 11, fontWeight: '700' },

  passageRow:      { marginBottom: 16 },
  passageTitle:    { fontSize: 14, fontWeight: '700', color: C.ink, flex: 1, marginRight: 8 },
  passageAcc:      { fontSize: 14, fontWeight: '800' },
  passageBarBg:    { height: 10, backgroundColor: C.greenLight, borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  passageBar:      { height: 10, borderRadius: 5 },
  passageAttempts: { fontSize: 11, color: C.slate },

  wordDetailRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  wordRank:        { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  wordRankText:    { fontSize: 12, fontWeight: '800' },
  wordDetailWord:  { fontSize: 14, fontWeight: '700', color: C.ink, width: 90 },
  wordDetailBarBg: { flex: 1, height: 10, backgroundColor: C.greenLight, borderRadius: 5, overflow: 'hidden' },
  wordDetailBar:   { height: 10, borderRadius: 5 },
  wordDetailCount: { fontSize: 13, fontWeight: '700', color: C.slate, width: 28, textAlign: 'right' },

  // ────────────────────────────────────────────────────────────────────────────────────
});
