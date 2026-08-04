import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import ActionSheetModal from '../../Components/GlobalUse/Modal/ActionSheetModal';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { getCurrentUser, getUserProfile, updateFacultyProfile } from '../../Controller/AuthenticationController';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import { Icon } from '../../Components/GlobalUse/Icon';
import { sh, sf, sw } from '../../Utils/responsive';
import { FacultyColors } from '../../Utilities/Theme';
import Svg, { Text as SvgText } from 'react-native-svg';

// ─── Palette (aligned with Student profile) ──────────────────────────────────
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

const headerStyles = StyleSheet.create({
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40,
    fontFamily: 'Nunito-Bold',
    color: C.card,
    lineHeight: 28,
    marginLeft: -2,
    paddingBottom: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(16),
    paddingVertical: sh(14),
  },
  aboutText: {
    fontSize: sf(15),
    fontFamily: 'Nunito-Bold',
    color: FacultyColors.slate,
    marginLeft: sw(12),
  },
  dropdownDivider: {
    height: 1,
    marginHorizontal: sw(12),
    backgroundColor: '#E3F0E7',
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
  const translateVal = useRef(
    new Animated.Value(
      direction === 'up' ? 30 : direction === 'down' ? -30 : direction === 'left' ? 30 : -30
    )
  ).current;
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
  const transform = isHorizontal ? [{ translateX: translateVal }] : [{ translateY: translateVal }];

  return <Animated.View style={{ transform, opacity }}>{children}</Animated.View>;
}

export default function FacultyProfile() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [sex, setSex] = useState('');
  const [profileData, setProfileData] = useState<UserDocument | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const { handleBackStep, handleLogout, handleNextStep } = useNavigationHelper();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const user = getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.uid);
        setProfileData(profile);

        if (profile) {
          setFirstName(profile.firstName || '');
          setMiddleName(profile.middleName || '');
          setLastName(profile.lastName || '');
          setEmail(profile.email || '');
          setSex(profile.sex || '');
        }
      }
    } catch (error) {
      showAlert('Error', 'Could not load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !sex.trim()) {
      showAlert('Validation Error', 'First Name, Last Name, Email, and Sex are required.');
      return;
    }

    setIsSaving(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await updateFacultyProfile(user.uid, {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          sex: sex.trim(),
          profileImageUrl: newProfileImage || profileData?.profileImageUrl,
        });
        
        const updatedProfile = await getUserProfile(user.uid);
        showAlert('Success', 'Profile updated successfully!');
        fetchProfileData();
        setNewProfileImage(null);
        setIsEditing(false);
      }
    } catch (error: any) {
      showAlert('Update Failed', error.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewProfileImage(null);
    fetchProfileData();
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      showAlert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets?.[0]?.base64) {
      const base64Image = `data:${response.assets[0].type || 'image/jpeg'};base64,${response.assets[0].base64}`;
      setNewProfileImage(base64Image);
    }
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.5, maxWidth: 300, maxHeight: 300, includeBase64: true, saveToPhotos: true },
      handleImageResponse
    );
    setActionSheetVisible(false);
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.5, maxWidth: 300, maxHeight: 300, includeBase64: true },
      handleImageResponse
    );
    setActionSheetVisible(false);
  };

  const toggleMenu = () => setMenuVisible(v => !v);
  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };
  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };
  const cancelLogout = () => setLogoutVisible(false);

  return (
    <SafeAreaView style={S.container}>
      <BubbleBackground />

      {/* HEADER */}
      <View style={S.headerWrapper}>
        <View style={upperNav.header}>
          <TouchableOpacity
            style={headerStyles.backBtn}
            onPress={() => handleBackStep()}
            activeOpacity={0.7}
          >
            <Text style={headerStyles.backArrowText}>‹</Text>
          </TouchableOpacity>

          <Svg height={60} width={200}>
            <SvgText
              x={100}
              y={35}
              fontSize={30}
              fontFamily="Andika-Bold"
              textAnchor="middle"
              fill="none"
              stroke={C.primaryLight}
              strokeWidth={8}
              strokeLinejoin="round"
            >
              My Profile
            </SvgText>
            <SvgText
              x={100}
              y={35}
              fontSize={30}
              fontFamily="Andika-Bold"
              textAnchor="middle"
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
              style={headerStyles.aboutRow}
              activeOpacity={0.75}
            >
              <Icon name="info" size={sw(20)} color={FacultyColors.slate} filled />
              <Text style={headerStyles.aboutText}>About</Text>
            </TouchableOpacity>
            <View style={headerStyles.dropdownDivider} />
            <TouchableOpacity onPress={handleLogoutPress} style={upperNav.logoutButton}>
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        {menuVisible && (
          <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        {isLoading ? (
          <View style={S.loadingContainer}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={S.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            {/* ── Avatar Card ─────────────────────────────────────────────── */}
            <FadeSlideIn delay={60}>
              <View style={S.avatarCard}>
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  disabled={!isEditing} 
                  onPress={() => setActionSheetVisible(true)}
                  style={S.avatarRing}
                >
                  <Image
                    source={
                      newProfileImage 
                        ? { uri: newProfileImage }
                        : profileData?.profileImageUrl
                          ? { uri: profileData.profileImageUrl }
                          : profileData?.sex === 'male'
                          ? require('../../../assets/images/Male-profile.png')
                          : require('../../../assets/images/Female-profile.png')
                    }
                    style={S.avatarImage}
                  />
                  {isEditing && (
                    <View style={{
                      position: 'absolute', bottom: 0, right: 0,
                      backgroundColor: C.primary, width: 32, height: 32, borderRadius: 16,
                      justifyContent: 'center', alignItems: 'center',
                      borderWidth: 2, borderColor: '#FFF'
                    }}>
                      <Text style={{ fontSize: 16 }}>📷</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={S.studentName}>
                  {profileData?.firstName} {profileData?.lastName}
                </Text>
                <View style={S.roleBadge}>
                  <Text style={S.roleBadgeText}>Faculty</Text>
                </View>
              </View>
            </FadeSlideIn>

            {/* ── Basic Information ───────────────────────────────────────── */}
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
                    <FormField
                      label="Email Address"
                      value={email}
                      onChange={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <FormField label="Sex (male / female)" value={sex} onChange={setSex} autoCapitalize="none" />

                    <View style={S.actionRow}>
                      <TouchableOpacity style={S.cancelButton} onPress={handleCancel} disabled={isSaving}>
                        <Text style={S.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={S.saveButton} onPress={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Text style={S.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={S.infoGrid}>
                    <InfoItem label="First Name" value={profileData?.firstName || 'N/A'} delay={220} />
                    <InfoItem label="Middle Name" value={profileData?.middleName || 'N/A'} delay={260} />
                    <InfoItem label="Last Name" value={profileData?.lastName || 'N/A'} delay={300} />
                    <InfoItem label="Email" value={profileData?.email || 'N/A'} delay={340} />
                    <InfoItem
                      label="Sex"
                      value={
                        profileData?.sex === 'male'
                          ? 'Male'
                          : profileData?.sex === 'female'
                          ? 'Female'
                          : 'N/A'
                      }
                      delay={380}
                    />
                  </View>
                )}
              </View>
            </FadeSlideIn>
          </>
        )}

        <View style={{ height: sh(24) }} />
      </ScrollView>

      <LogoutModal visible={logoutVisible} onCancel={cancelLogout} onConfirm={confirmLogout} />

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <ActionSheetModal
        visible={actionSheetVisible}
        title="Update Profile Picture"
        options={[
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Gallery', onPress: openGallery },
          { text: 'Cancel', onPress: () => setActionSheetVisible(false), isCancel: true }
        ]}
        onClose={() => setActionSheetVisible(false)}
      />
    </SafeAreaView>
  );
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

// ─── FormField ───────────────────────────────────────────────────────────────
const FormField = ({
  label,
  value,
  onChange,
  optional = false,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
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
      keyboardType={keyboardType}
      placeholderTextColor={C.slate}
    />
  </View>
);

// ─── InfoItem ───────────────────────────────────────────────────────────────
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

// ─── Styles ─────────────────────────────────────────────────────────────────
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
    fontFamily: 'Andika-Regular',
    color: C.inkLight,
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
    fontFamily: 'Andika-Bold',
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
    fontFamily: 'Andika-Bold',
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
  sectionTitle: {
    fontSize: sf(18),
    fontFamily: 'Andika-Bold',
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
    fontFamily: 'Andika-Bold',
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
    fontFamily: 'Andika-Regular',
    color: C.inkLight,
  },
  infoValue: {
    fontSize: sf(15),
    fontFamily: 'Andika-Bold',
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
    fontFamily: 'Andika-Regular',
    color: C.inkLight,
    marginBottom: sh(6),
  },
  optionalText: {
    fontSize: sf(12),
    fontFamily: 'Andika-Regular',
    color: C.slate,
  },
  textInput: {
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: sw(12),
    paddingHorizontal: sw(14),
    paddingVertical: sh(10),
    fontSize: sf(15),
    fontFamily: 'Andika-Regular',
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
    fontFamily: 'Andika-Bold',
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
    fontFamily: 'Andika-Bold',
  },
});
