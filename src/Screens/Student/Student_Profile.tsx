import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import {
  getUserProfile,
  getCurrentUser,
  getClassByCode,
  updateStudentBasicInfo,
} from '../../Controller/AuthenticationController';
import { getAuth } from '@react-native-firebase/auth';
import { UserDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { sw, sh, sf } from '../../Utils/responsive';
import Svg, { Text as SvgText } from 'react-native-svg';

// ─── Palette (aligned with Reading Selection blue/cyan theme) ─────────────────
const C = {
  bg: '#F1FBF4',
  primary: '#008443',
  primaryDark: '#006a35',
  primaryDeep: '#005028',
  primaryLight: '#c0e8f2',
  tabBg: '#c0e8f2',
  accent: '#2ca96a',
  card: '#FFFFFF',
  ink: '#1F2937',
  inkLight: '#6B7280',
  slate: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F3F8FF',
  coral: '#e74c3c',
  green: '#2CA96A',
  orange: '#FF7043',
};

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

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  menuBtn: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.card, lineHeight: 28, marginLeft: -2, paddingBottom: 2
  },
});

// ─── FadeSlideIn ──────────────────────────────────────────────────────────────
function FadeSlideIn({
  children,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const translateVal = useRef(new Animated.Value(
    direction === 'up' ? 30 : direction === 'down' ? -30 : direction === 'left' ? 30 : -30
  )).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateVal, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const isHorizontal = direction === 'left' || direction === 'right';
  const transform = isHorizontal
    ? [{ translateX: translateVal }]
    : [{ translateY: translateVal }];

  return (
    <Animated.View style={{ transform, opacity }}>
      {children}
    </Animated.View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const auth = getAuth();

  // ── State ───────────────────────────────────────────────────────────────────
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [profileData, setProfileData] = useState<UserDocument | null>(null);
  const [classData, setClassData] = useState<ClassDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // ── Custom Alert State ──────────────────────────────────────────────────────
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message });
    setAlertVisible(true);
  };

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const { handleLogout, handleBackStep, handleNextStep } = useNavigationHelper();

  useEffect(() => { fetchProfileData(); }, []);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      if (!currentUser) { setError('No user logged in'); return; }

      const profile = await getUserProfile(currentUser.uid);
      setProfileData(profile);

      if (profile) {
        setFirstName(profile.firstName || '');
        setMiddleName(profile.middleName || '');
        setLastName(profile.lastName || '');
        setSex(profile.sex || '');
        setDateOfBirth(profile.studentData?.dateOfBirth || '');
      }

      if (profile?.studentData?.classCode) {
        const classInfo = await getClassByCode(profile.studentData.classCode);
        setClassData(classInfo);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // ── Utilities ───────────────────────────────────────────────────────────────
  const formatDateOfBirth = (dateString?: string) => dateString || 'Not set';

  const getReadingLevelLabel = (level?: string) => {
    const levels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return levels[level || 'beginner'] || 'Beginner';
  };

  // ── Event handlers ──────────────────────────────────────────────────────────
  const toggleMenu = () => setMenuVisible(v => !v);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout = () => setLogoutVisible(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !sex.trim()) {
      showAlert('Validation Error', 'First Name, Last Name, and Sex are required.');
      return;
    }
    setIsSaving(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await updateStudentBasicInfo(user.uid, {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          sex: sex.trim(),
          dateOfBirth: dateOfBirth.trim(),
        });
        setIsEditing(false);
        showAlert('Success', 'Profile updated successfully!');
        fetchProfileData();
      }
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setMiddleName(profileData.middleName || '');
      setLastName(profileData.lastName || '');
      setSex(profileData.sex || '');
      setDateOfBirth(profileData.studentData?.dateOfBirth || '');
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={S.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={S.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={S.loadingContainer}>
        <Text style={S.errorText}>{error}</Text>
        <TouchableOpacity style={S.retryButton} onPress={fetchProfileData}>
          <Text style={S.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.container}>
      <BubbleBackground />

      {/* HEADER */}
      <View style={S.headerWrapper}>
        <View style={upperNav.header}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={() => handleBackStep()} activeOpacity={0.7}>
            <Text style={headerStyles.backArrowText}>‹</Text>
          </TouchableOpacity>

          <Svg height={60} width={200}>
            <SvgText
              x={100} y={35} fontSize={23}
              fontFamily="Nunito-Black" textAnchor="middle"
              fill="none" stroke={C.primaryLight}
              strokeWidth={8} strokeLinejoin="round"
            >
              My Profile
            </SvgText>
            <SvgText
              x={100} y={35} fontSize={23}
              fontFamily="Nunito-Black" textAnchor="middle"
              fill={C.primary}
            >
              My Profile
            </SvgText>
          </Svg>

          <TouchableOpacity style={headerStyles.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
            <MenuBars />
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                handleNextStep('About');
              }}
              style={upperNav.logoutButton}
            >
              <Text style={upperNav.logoutText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogoutPress} style={upperNav.logoutButton}>
              <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        {menuVisible && (
          <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
      >
        {/* ── Avatar Card ──────────────────────────────────────────────── */}
        <FadeSlideIn delay={60}>
          <View style={S.avatarCard}>
            <View style={S.avatarRing}>
              <Image
                source={
                  profileData?.profileImageUrl
                    ? { uri: profileData.profileImageUrl }
                    : profileData?.sex === 'male'
                      ? require('../../../assets/images/Male-profile.png')
                      : require('../../../assets/images/Female-profile.png')
                }
                style={S.avatarImage}
              />
            </View>
            <Text style={S.studentName}>
              {profileData?.firstName} {profileData?.lastName}
            </Text>
            <View style={S.roleBadge}>
              <Text style={S.roleBadgeText}>Student</Text>
            </View>
          </View>
        </FadeSlideIn>

        {/* ── Basic Information ─────────────────────────────────────────── */}
        <FadeSlideIn delay={180}>
          <View style={S.section}>
            <View style={S.sectionHeaderRow}>
              <View style={S.sectionTitleRow}>
                <Text style={S.sectionTitle}>Basic Information</Text>
              </View>
              {!isEditing && (
                <TouchableOpacity style={S.editPill} onPress={() => setIsEditing(true)}>
                  <Text style={S.editPillText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View style={S.formContainer}>
                <FormField label="First Name" value={firstName} onChange={setFirstName} />
                <FormField label="Middle Name" value={middleName} onChange={setMiddleName} optional />
                <FormField label="Last Name" value={lastName} onChange={setLastName} />
                <FormField label="Birthdate (YYYY-MM-DD)" value={dateOfBirth} onChange={setDateOfBirth} />
                <FormField label="Sex (male / female)" value={sex} onChange={setSex} autoCapitalize="none" />

                <View style={S.actionRow}>
                  <TouchableOpacity style={S.cancelButton} onPress={handleCancel} disabled={isSaving}>
                    <Text style={S.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.saveButton} onPress={handleSave} disabled={isSaving}>
                    {isSaving
                      ? <ActivityIndicator color="#ffffff" size="small" />
                      : <Text style={S.saveButtonText}>Save</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={S.infoGrid}>
                <InfoItem label="First Name" value={profileData?.firstName || 'N/A'} delay={220} />
                <InfoItem label="Middle Name" value={profileData?.middleName || 'N/A'} delay={260} />
                <InfoItem label="Last Name" value={profileData?.lastName || 'N/A'} delay={300} />
                <InfoItem
                  label="Birthdate"
                  value={formatDateOfBirth(profileData?.studentData?.dateOfBirth)}
                  delay={340}
                />
                <InfoItem
                  label="Sex"
                  value={
                    profileData?.sex === 'male' ? 'Male' :
                      profileData?.sex === 'female' ? 'Female' : 'N/A'
                  }
                  delay={380}
                />
              </View>
            )}
          </View>
        </FadeSlideIn>

        {/* ── Academic Information ──────────────────────────────────────── */}
        <FadeSlideIn delay={300}>
          <View style={S.section}>
            <View style={S.sectionTitleRow}>
              <Text style={S.sectionTitle}>Academic Information</Text>
            </View>
            <View style={S.infoGrid}>
              <InfoItem
                label="Grade Level"
                value={`Grade ${profileData?.studentData?.gradeLevel || 'N/A'}`}
                delay={360}
              />
              <InfoItem
                label="Class"
                value={classData?.className || 'Not assigned'}
                delay={400}
              />
              <InfoItem
                label="Reading Level"
                value={getReadingLevelLabel(profileData?.studentData?.reading_Level)}
                delay={440}
              />
            </View>
          </View>
        </FadeSlideIn>

        {/* bottom spacer */}
        <View style={{ height: sh(24) }} />
      </ScrollView>

      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      <AlertModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
const FormField = ({
  label,
  value,
  onChange,
  optional = false,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) => (
  <View style={S.inputGroup}>
    <Text style={S.inputLabel}>
      {label}
      {optional && <Text style={S.optionalText}> (Optional)</Text>}
    </Text>
    <TextInput
      style={S.textInput}
      value={value}
      onChangeText={onChange}
      autoCapitalize={autoCapitalize}
      placeholderTextColor={C.slate}
    />
  </View>
);

// ─── InfoItem (with per-item animation) ───────────────────────────────────────
const InfoItem = ({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) => (
  <FadeSlideIn delay={delay} direction="left">
    <View style={S.infoItem}>
      <Text style={S.infoLabel}>{label}</Text>
      <Text style={S.infoValue}>{value}</Text>
    </View>
  </FadeSlideIn>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: {
    flex: 1,
    padding: sh(4),
    paddingTop: sh(15),
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: sw(16),
    paddingBottom: sh(24),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  loadingText: {
    marginTop: sh(12),
    fontSize: sf(16),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  errorText: {
    fontSize: sf(16),
    fontFamily: 'Nunito-Medium',
    color: C.coral,
    textAlign: 'center',
    marginBottom: sh(16),
    paddingHorizontal: sw(32),
  },
  retryButton: {
    backgroundColor: C.primary,
    paddingHorizontal: sw(24),
    paddingVertical: sh(12),
    borderRadius: sw(20),
  },
  retryButtonText: {
    color: C.card,
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
  },

  // Header
  headerWrapper: {
    position: 'relative',
    zIndex: 100,
    paddingTop: sh(4),
    paddingHorizontal: sw(5),
  },

  // Avatar card
  avatarCard: {
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: sw(20),
    paddingVertical: sh(28),
    paddingHorizontal: sw(20),
    marginTop: sh(12),
    borderWidth: 3,
    borderColor: '#2ca96a',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.1,
    shadowRadius: sw(10),
  },
  avatarRing: {
    width: sw(110),
    height: sw(110),
    borderRadius: sw(55),
    borderWidth: 4,
    borderColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    marginBottom: sh(14),
  },
  avatarImage: {
    width: sw(96),
    height: sw(96),
    borderRadius: sw(48),
  },
  studentName: {
    fontSize: sf(24),
    fontFamily: 'Nunito-Black',
    color: C.ink,
    marginBottom: sh(6),
  },
  roleBadge: {
    backgroundColor: C.tabBg,
    paddingHorizontal: sw(16),
    paddingVertical: sh(4),
    borderRadius: sw(12),
  },
  roleBadgeText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },

  // Section card
  section: {
    backgroundColor: C.card,
    marginTop: sh(16),
    borderRadius: sw(16),
    padding: sw(18),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.08,
    shadowRadius: sw(8),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sw(8),
    marginBottom: sh(12),
  },
  sectionIcon: {
    fontSize: sf(20),
  },
  sectionTitle: {
    fontSize: sf(18),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },

  // Edit pill
  editPill: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: sw(14),
    paddingVertical: sh(5),
    borderRadius: sw(12),
  },
  editPillText: {
    fontSize: sf(13),
    fontFamily: 'Nunito-Bold',
    color: C.primary,
  },

  // Info grid
  infoGrid: {
    gap: sh(4),
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    paddingHorizontal: sw(14),
    paddingVertical: sh(12),
    borderRadius: sw(12),
    marginBottom: sh(6),
  },
  infoLabel: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
  },
  infoValue: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
  },

  // Form
  formContainer: {
    marginTop: sh(4),
  },
  inputGroup: {
    marginBottom: sh(14),
  },
  inputLabel: {
    fontSize: sf(14),
    fontFamily: 'Nunito-Medium',
    color: C.inkLight,
    marginBottom: sh(6),
  },
  optionalText: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Regular',
    color: C.slate,
  },
  textInput: {
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: sw(12),
    paddingHorizontal: sw(14),
    paddingVertical: sh(10),
    fontSize: sf(15),
    fontFamily: 'Nunito-Medium',
    color: C.ink,
    backgroundColor: C.inputBg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: sw(12),
    marginTop: sh(8),
  },
  cancelButton: {
    paddingVertical: sh(10),
    paddingHorizontal: sw(20),
    borderRadius: sw(20),
    borderWidth: 2,
    borderColor: C.orange,
    backgroundColor: C.card,
  },
  cancelButtonText: {
    color: C.orange,
    fontFamily: 'Nunito-Bold',
    fontSize: sf(14),
  },
  saveButton: {
    paddingVertical: sh(10),
    paddingHorizontal: sw(24),
    borderRadius: sw(20),
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: sw(80),
    elevation: 4,
    shadowColor: '#2ca96a',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.3,
    shadowRadius: sw(6),
  },
  saveButtonText: {
    fontSize: sf(14),
    color: C.card,
    fontFamily: 'Nunito-Bold',
  },
});
