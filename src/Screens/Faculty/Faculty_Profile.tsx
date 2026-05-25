import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import facultyProfile from '../../UI_Designs/FacultyProfile';
import facultyDashboard from '../../UI_Designs/FacultyDashboardStyles';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { getCurrentUser, getUserProfile, updateFacultyProfile } from '../../Controller/AuthenticationController';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import { Icon } from '../../Components/GlobalUse/Icon';
import { sw } from '../../Utils/responsive';
import { FacultyColors } from '../../Utilities/Theme';

export default function FacultyProfile() {
  // ========================================================================
  // STATE MANAGEMENT 
  // ========================================================================

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

  // Profile States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [sex, setSex] = useState('');
  const [profileData, setProfileData] = useState<UserDocument | null>(null);
  // ========================================================================
  // HOOKS  
  // ========================================================================

  const { handleBackStep, handleLogout, handleNextStep } = useNavigationHelper();

  useEffect(() => {
    fetchProfileData();
  }, []);

  // ========================================================================
  // DATA FETCHING & UPDATING
  // ========================================================================

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
      Alert.alert('Validation Error', 'First Name, Last Name, Email, and Sex are required.');
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
        });
        setIsEditing(false);
        showAlert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      showAlert('Update Failed', error.message || 'An error occurred while updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData(); // Reset to original values
  };

  // ========================================================================
  // EVENT HANDLERS   
  // ========================================================================

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  return (
    <SafeAreaView style={facultyProfile.container}>
      <View style={facultyProfile.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

        {/* HEADER */}
        <View style={facultyDashboard.header}>
          <Text style={facultyDashboard.headerLogo}>CISC KIDS</Text>
          <TouchableOpacity
            style={facultyDashboard.menuBtn}
            onPress={() => setMenuVisible(v => !v)}
            activeOpacity={0.7}
          >
            <MenuBars />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLL CONTENT */}
        <ScrollView
          contentContainerStyle={facultyProfile.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={facultyProfile.titleGroup}>
            <Text style={facultyProfile.screenTitle}>My Profile</Text>
          </View>

          {isLoading ? (
            <View style={facultyProfile.loadingContainer}>
              <ActivityIndicator size="large" color="#3B7FC9" />
            </View>
          ) : (
            <View style={facultyProfile.profileCard}>

              {/* Floating Avatar */}
              <View style={facultyProfile.avatarContainer}>
                <Image
                  source={
                    profileData?.profileImageUrl
                      ? { uri: profileData.profileImageUrl } : profileData?.sex === 'male' ?
                        require('../../../assets/images/Male-profile.png') : require('../../../assets/images/Female-profile.png')
                  }
                  style={facultyProfile.avatarIcon}
                />
              </View>

              {/* FIRST NAME */}
              <View style={facultyProfile.inputGroup}>
                <Text style={facultyProfile.label}>First Name</Text>
                <TextInput
                  style={[
                    facultyProfile.textInput,
                    !isEditing && facultyProfile.textInputDisabled,
                  ]}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={isEditing}
                />
              </View>

              {/* MIDDLE NAME (OPTIONAL) */}
              <View style={facultyProfile.inputGroup}>
                <Text style={facultyProfile.label}>Middle Name</Text>
                <TextInput
                  style={[
                    facultyProfile.textInput,
                    !isEditing && facultyProfile.textInputDisabled,
                  ]}
                  value={middleName}
                  onChangeText={setMiddleName}
                  editable={isEditing}
                  placeholder={isEditing ? 'Optional' : ''}
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              {/* LAST NAME */}
              <View style={facultyProfile.inputGroup}>
                <Text style={facultyProfile.label}>Last Name</Text>
                <TextInput
                  style={[
                    facultyProfile.textInput,
                    !isEditing && facultyProfile.textInputDisabled,
                  ]}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={isEditing}
                />
              </View>

              {/* EMAIL */}
              <View style={facultyProfile.inputGroup}>
                <Text style={facultyProfile.label}>Email Address</Text>
                <TextInput
                  style={[
                    facultyProfile.textInput,
                    !isEditing && facultyProfile.textInputDisabled,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  editable={isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* SEX */}
              <View style={facultyProfile.inputGroup}>
                <Text style={facultyProfile.label}>Sex</Text>
                <TextInput
                  style={[
                    facultyProfile.textInput,
                    !isEditing && facultyProfile.textInputDisabled,
                  ]}
                  value={sex}
                  onChangeText={setSex}
                  editable={isEditing}
                  autoCapitalize="none"
                />
              </View>

              {/* ACTION BUTTONS */}
              {isEditing ? (
                <View style={facultyProfile.actionRow}>
                  <TouchableOpacity
                    style={facultyProfile.cancelButton}
                    onPress={handleCancel}
                    disabled={isSaving}
                  >
                    <Text style={facultyProfile.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={facultyProfile.saveButton}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={facultyProfile.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={facultyProfile.actionRow}>
                  <TouchableOpacity
                    style={facultyProfile.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={facultyProfile.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          )}
        </ScrollView>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject as any}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
            <View style={facultyDashboard.dropdown}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); handleNextStep('About'); }}
                style={facultyDashboard.dropdownItem}
                activeOpacity={0.75}
              >
                <Icon name="info" size={sw(20)} color={FacultyColors.slate} filled />
                <Text style={facultyDashboard.dropdownTextAbout}>About</Text>
              </TouchableOpacity>
              <View style={facultyDashboard.dropdownDivider} />
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); setLogoutVisible(true); }}
                style={facultyDashboard.dropdownItem}
                activeOpacity={0.75}
              >
                <Image
                  source={require('../../../assets/icons/Logout-icon.png')}
                  style={facultyDashboard.dropdownIcon}
                />
                <Text style={facultyDashboard.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Hamburger icon ───────────────────────────────────────────────────────────
function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#1B2B22' }} />
    </View>
  );
}
