import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import {
  getUserProfile,
  getCurrentUser,
  getClassByCode,
} from '../../Controller/AuthenticationController';
import { updateStudentBasicInfo } from '../../Controller/AuthenticationController';
import { getAuth } from '@react-native-firebase/auth';
import { UserDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { sw, sh, sf } from '../../Utils/responsive';

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

export default function Profile() {
  const auth = getAuth();

  // ── State ───────────────────────────────────────────────────────────────────
  const [menuVisible,   setMenuVisible]   = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [profileData,   setProfileData]   = useState<UserDocument | null>(null);
  const [classData,     setClassData]     = useState<ClassDocument | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  // Edit states
  const [isEditing,   setIsEditing]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [firstName,   setFirstName]   = useState('');
  const [middleName,  setMiddleName]  = useState('');
  const [lastName,    setLastName]    = useState('');
  const [sex,         setSex]         = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const { handleLogout, handleBackStep } = useNavigationHelper();

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
        setFirstName(profile.firstName   || '');
        setMiddleName(profile.middleName  || '');
        setLastName(profile.lastName    || '');
        setSex(profile.sex          || '');
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
      beginner:     'Beginner',
      intermediate: 'Intermediate',
      advanced:     'Advanced',
      expert:       'Expert',
    };
    return levels[level || 'beginner'] || 'Beginner';
  };

  // ── Event handlers ──────────────────────────────────────────────────────────
  const toggleMenu       = () => setMenuVisible(v => !v);
  const handleLogoutPress = () => { setMenuVisible(false); setLogoutVisible(true); };
  const confirmLogout    = async () => { setLogoutVisible(false); await handleLogout(); };
  const cancelLogout     = () => setLogoutVisible(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !sex.trim()) {
      Alert.alert('Validation Error', 'First Name, Last Name, and Sex are required.');
      return;
    }
    setIsSaving(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await updateStudentBasicInfo(user.uid, {
          firstName:   firstName.trim(),
          middleName:  middleName.trim(),
          lastName:    lastName.trim(),
          sex:         sex.trim(),
          dateOfBirth: dateOfBirth.trim(),
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
        fetchProfileData();
      }
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setFirstName(profileData.firstName   || '');
      setMiddleName(profileData.middleName  || '');
      setLastName(profileData.lastName    || '');
      setSex(profileData.sex          || '');
      setDateOfBirth(profileData.studentData?.dateOfBirth || '');
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <BubbleBackground />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={upperNav.header}>
              <TouchableOpacity style={upperNav.touchable} onPress={() => handleBackStep()}>
                <Image
                  style={upperNav.backButtonIcon}
                  source={require('../../../assets/icons/BackButton-icon.png')}
                />
              </TouchableOpacity>
              <Image
                style={upperNav.ciscLogo}
                source={require('../../../assets/images/cisckids.png')}
              />
              <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
                <Image style={upperNav.menuIcon} source={require('../../../assets/icons/Menu-icon.png')} />
              </TouchableOpacity>
            </View>

            {menuVisible && (
              <View style={upperNav.dropdownMenu}>
                <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutButton}>
                  <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
                  <Text style={upperNav.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
            {menuVisible && (
              <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
            )}
          </View>

          {/* PROFILE HEADER */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profileData?.profileImageUrl
                    ? { uri: profileData.profileImageUrl }
                    : profileData?.sex === 'male'
                      ? require('../../../assets/images/Male-profile.png')
                      : require('../../../assets/images/Female-profile.png')
                }
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.studentName}>
              {profileData?.firstName} {profileData?.lastName}
            </Text>
            <Text style={styles.studentRole}>Student</Text>
          </View>

          {/* BASIC INFORMATION */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Basic Information</Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButtonTextPrimary}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput style={styles.textInput} value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Middle Name <Text style={styles.optionalText}>(Optional)</Text>
                  </Text>
                  <TextInput style={styles.textInput} value={middleName} onChangeText={setMiddleName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput style={styles.textInput} value={lastName} onChangeText={setLastName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Birthdate (YYYY-MM-DD)</Text>
                  <TextInput style={styles.textInput} value={dateOfBirth} onChangeText={setDateOfBirth} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sex (male/female)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={sex}
                    onChangeText={setSex}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isSaving}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                    {isSaving
                      ? <ActivityIndicator color="#ffffff" size="small" />
                      : <Text style={styles.saveButtonText}>Save</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoGrid}>
                <InfoItem label="First Name"  value={profileData?.firstName  || 'N/A'} />
                <InfoItem label="Middle Name" value={profileData?.middleName || 'N/A'} />
                <InfoItem label="Last Name"   value={profileData?.lastName   || 'N/A'} />
                <InfoItem
                  label="Birthdate"
                  value={formatDateOfBirth(profileData?.studentData?.dateOfBirth)}
                />
                <InfoItem
                  label="Sex"
                  value={
                    profileData?.sex === 'male'   ? 'Male'   :
                    profileData?.sex === 'female' ? 'Female' : 'N/A'
                  }
                />
              </View>
            )}
          </View>

          {/* ACADEMIC INFORMATION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.infoGrid}>
              <InfoItem
                label="Grade Level"
                value={`Grade ${profileData?.studentData?.gradeLevel || 'N/A'}`}
              />
              <InfoItem
                label="Class"
                value={classData?.className || 'Not assigned'}
              />
              <InfoItem
                label="Reading Level"
                value={getReadingLevelLabel(profileData?.studentData?.reading_Level)}
              />
            </View>
          </View>

        </View>
      </ScrollView>

      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

// ─── InfoItem ─────────────────────────────────────────────────────────────────
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f8fafc' },
  innerContainer:   { flexGrow: 1, paddingBottom: sh(24) },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText:      { marginTop: sh(12), fontSize: sf(16), color: '#64748b' },
  errorText:        { fontSize: sf(16), color: '#ef4444', textAlign: 'center', marginBottom: sh(16), paddingHorizontal: sw(32) },
  retryButton:      { backgroundColor: '#3b82f6', paddingHorizontal: sw(24), paddingVertical: sh(12), borderRadius: sw(8) },
  retryButtonText:  { color: 'white', fontSize: sf(16), fontWeight: '600' },
  header:           { position: 'relative', zIndex: 100 },
  logoutButton:     { flexDirection: 'row', alignItems: 'center', padding: sw(16), borderRadius: sw(12) },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: sh(24),
    backgroundColor: 'white',
    marginHorizontal: sw(16),
    marginTop: sh(16),
    borderRadius: sw(16),
    elevation: 4,
  },
  profileImageContainer: {
    width: sw(100), height: sw(100), borderRadius: sw(50),
    backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center',
    marginBottom: sh(12), borderWidth: 3, borderColor: '#3b82f6',
  },
  profileImage:  { width: sw(94), height: sw(94), borderRadius: sw(47) },
  studentName:   { fontSize: sf(24), fontWeight: 'bold', color: '#1e293b', marginBottom: sh(4) },
  studentRole:   { fontSize: sf(16), color: '#64748b' },

  section: {
    backgroundColor: 'white',
    marginHorizontal: sw(16),
    marginTop: sh(16),
    padding: sw(20),
    borderRadius: sw(16),
    elevation: 4,
  },
  sectionHeaderRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sh(16) },
  sectionTitle:          { fontSize: sf(20), fontWeight: 'bold', color: '#1e293b', marginBottom: sh(16) },
  editButtonTextPrimary: { fontSize: sf(14), color: '#3b82f6', fontWeight: '600' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoItem: { width: '48%', marginBottom: sh(16) },
  infoLabel: { fontSize: sf(14), color: '#64748b', marginBottom: sh(4) },
  infoValue: { fontSize: sf(16), fontWeight: '600', color: '#1e293b' },

  formContainer: { marginTop: sh(8) },
  inputGroup:    { marginBottom: sh(14) },
  inputLabel:    { fontSize: sf(14), color: '#475569', marginBottom: sh(6), fontWeight: '500' },
  optionalText:  { fontSize: sf(12), color: '#94a3b8', fontWeight: '400' },
  textInput: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: sw(8),
    paddingHorizontal: sw(12), paddingVertical: sh(10),
    fontSize: sf(15), color: '#1e293b', backgroundColor: '#f8fafc',
  },
  actionRow:         { flexDirection: 'row', justifyContent: 'flex-end', gap: sw(12), marginTop: sh(8) },
  cancelButton:      { paddingHorizontal: sw(16), paddingVertical: sh(10), borderRadius: sw(8), borderWidth: 1, borderColor: '#e2e8f0' },
  cancelButtonText:  { fontSize: sf(14), color: '#64748b', fontWeight: '500' },
  saveButton:        { paddingHorizontal: sw(20), paddingVertical: sh(10), borderRadius: sw(8), backgroundColor: '#3b82f6', minWidth: sw(80), alignItems: 'center' },
  saveButtonText:    { fontSize: sf(14), color: 'white', fontWeight: '600' },
});