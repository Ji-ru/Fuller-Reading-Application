import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon } from '../../Components/GlobalUse/Icons';
import { getCurrentUser, getUserProfile, getClassByCode, requestToJoinClass, validateClassCode, leaveClass, getStudentRequestStatus } from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
// Import Firebase auth functions for password verification
import { EmailAuthProvider, reauthenticateWithCredential } from '@react-native-firebase/auth';

function BackArrow({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

export default function Student_Classes() {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassDocument | null>(null);
  const [firstName, setFirstName] = useState('Mag-aaral');
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leavePasswordModalVisible, setLeavePasswordModalVisible] = useState(false);
  const [leavePassword, setLeavePassword] = useState('');
  const [joiningCode, setJoiningCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [classCodeValidation, setClassCodeValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [validatingClassCode, setValidatingClassCode] = useState(false);
  const [joinRequestStatus, setJoinRequestStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const { handleBackStep } = useNavigationHelper();

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;

        const profile = await getUserProfile(user.uid);
        if (profile?.firstName) {
          setFirstName(profile.firstName);
        }

        const classCode = profile?.studentData?.classCode;
        if (classCode) {
          const cls = await getClassByCode(classCode);
          // Only set classData if student is actually enrolled (not just pending)
          if (cls && cls.studentIds && cls.studentIds.includes(user.uid)) {
            setClassData(cls);
          } else {
            // Student has classCode but not enrolled - check for pending status
            const status = await getStudentRequestStatus(user.uid, cls?.classId || '');
            if (status.status === 'pending' && cls) {
              setJoinRequestStatus('pending');
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch class');
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, []);

  const handleLeaveClass = () => {
    setLeaveModalVisible(true);
  };

  const confirmLeaveClass = () => {
    setLeaveModalVisible(false);
    setLeavePasswordModalVisible(true);
    setLeavePassword(''); // Clear password field
  };

  const confirmPasswordLeave = async () => {
    if (!leavePassword.trim()) {
      Alert.alert('Error', 'Pakilagay ang iyong password');
      return;
    }

    setLeavePasswordModalVisible(false);

    try {
      const user = getCurrentUser();
      if (!user || !classData) return;

      // Verify password before leaving class
      const credential = EmailAuthProvider.credential(user.email, leavePassword);
      await reauthenticateWithCredential(user, credential);

      // Leave the class using the controller function
      await leaveClass(user.uid, classData.classId);

      // Reset state
      setClassData(null);
      setFirstName('Mag-aaral');
      setLeavePassword('');

      Alert.alert('Tagumpay!', 'Naiwan ka na sa klase.');
    } catch (e: any) {
      // Password verification failed
      if (e.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Maling password. Pakisubukan muli.');
        // Show password modal again for retry
        setLeavePasswordModalVisible(true);
      } else {
        console.error('Leave class error:', e.message);
        Alert.alert('Error', e.message || 'Hindi makaiwan sa klase.');
        setLeavePasswordModalVisible(true); // Show password modal again
      }
    }
  };

  const handleValidateClassCode = async () => {
    if (!joiningCode.trim()) {
      setClassCodeValidation({ valid: false, message: 'Pakilagay ang class code' });
      return;
    }

    setValidatingClassCode(true);
    try {
      const result = await validateClassCode(joiningCode.trim().toUpperCase());
      setClassCodeValidation(result);
    } catch (error: any) {
      setClassCodeValidation({ valid: false, message: 'Hindi tama ang class code' });
    } finally {
      setValidatingClassCode(false);
    }
  };

  const handleJoinClass = async () => {
    if (!joiningCode.trim()) {
      Alert.alert('Error', 'Pakilagay ang class code.');
      return;
    }

    try {
      setJoining(true);
      const user = getCurrentUser();
      if (!user) return;

      // Save code to temp variable before any state changes
      const codeToJoin = joiningCode.trim().toUpperCase();

      // Step 1: Request to join the class (pending approval)
      console.log('Requesting to join class with code:', codeToJoin);
      const result = await requestToJoinClass(user.uid, codeToJoin);
      console.log('Join request result:', result);

      if (result.status === 'pending') {
        // Set pending status
        setJoinRequestStatus('pending');
        setJoiningCode('');
        setClassCodeValidation(null);
        Alert.alert('Nakapag-request!', 'Nakapag-request ka na ng pagkakasali sa klase. Hiintayin ang approval ng guro.');
      } else {
        // Step 2: Fetch and display class data
        console.log('Fetching class data...');
        const cls = await getClassByCode(codeToJoin);
        if (!cls) {
          throw new Error('Hindi makikita ang class information. Sigurado ba ang code?');
        }
        console.log('Class data loaded:', cls.className);
        setClassData(cls);

        // Step 3: Clear input and validation only after everything succeeds
        setJoiningCode('');
        setClassCodeValidation(null);

        // Show success message
        Alert.alert('Tagumpay!', `Nagsali ka sa ${cls.className}!`);
      }
    } catch (e: any) {
      console.error('Join class error:', e.message);
      Alert.alert('Error', e.message || 'Hindi nakasali sa klase.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={S.bg}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingDots color={C.green} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.slate, marginTop: 10 }}>Naglo-load ang klase...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.bg}>
      {/* Header */}
      <View style={S.headerBar}>
        <TouchableOpacity onPress={handleBackStep} style={S.backBtn} activeOpacity={0.7}>
          <BackArrow />
        </TouchableOpacity>
        <Image style={S.headerLogo} source={require('../../../assets/images/cisckids copy.png')} resizeMode="contain" />
        <View style={{ width: 44 }} />
      </View>

      {/* Main Content */}
      <View style={S.scrollContent}>
        {/* Hero Section */}
        <BounceIn delay={30}>
          <View style={S.heroCard}>
            <Text style={S.heroTitle}>Klase ni {firstName}</Text>
            <Text style={S.heroSub}>
              Baitang {classData?.gradeLevel ?? '—'} • {classData?.className ?? 'Walang klase'}
            </Text>
          </View>
        </BounceIn>

        {classData ? (
          <>
            {/* Class Information Section */}
            <BounceIn delay={72}>
              <View style={S.section}>
                <View style={S.sectionTitleRow}>
                  <BookOpenIcon size={16} color={C.green} />
                  <Text style={S.sectionTitle}>Impormasyon ng Klase</Text>
                </View>

                <View style={S.infoCard}>
                  <View style={S.infoRow}>
                    <Text style={S.infoLabel}>Antas ng Baitang</Text>
                    <Text style={S.infoValue}>{classData?.gradeLevel ? `Baitang ${classData.gradeLevel}` : 'N/A'}</Text>
                  </View>

                  <View style={S.infoRow}>
                    <Text style={S.infoLabel}>Akademikong Taon</Text>
                    <Text style={S.infoValue}>{classData?.acadYear || 'N/A'}</Text>
                  </View>

                  <View style={S.infoRow}>
                    <Text style={S.infoLabel}>Kaklase</Text>
                    <Text style={S.infoValue}>{classData?.studentIds?.length || 0} mag-aaral</Text>
                  </View>
                </View>
              </View>
            </BounceIn>

            {/* Class Code Section */}
            <BounceIn delay={108}>
              <View style={S.section}>
                <View style={S.sectionTitleRow}>
                  <BookOpenIcon size={16} color={C.green} />
                  <Text style={S.sectionTitle}>Code ng Klase</Text>
                </View>

                <View style={S.codeCard}>
                  <Text style={S.codeValue}>{classData?.classCode || ''}</Text>
                  <Text style={S.codeHint}>Ibahagi ito sa iba pang mga kaklase.</Text>
                </View>
              </View>
            </BounceIn>

            {/* Leave Class Button */}
            <BounceIn delay={144}>
              <TouchableOpacity style={S.leaveBtn} onPress={handleLeaveClass} activeOpacity={0.8}>
                <Text style={S.leaveBtnText}>Umalis sa Klase</Text>
              </TouchableOpacity>
            </BounceIn>
          </>
        ) : (
          <BounceIn delay={72}>
            <View style={S.section}>
              <View style={S.sectionTitleRow}>
                <BookOpenIcon size={16} color={C.green} />
                <Text style={S.sectionTitle}>Sumali sa Klase</Text>
              </View>

              {joinRequestStatus === 'pending' ? (
                <View style={S.pendingCard}>
                  <Text style={S.pendingTitle}>Nakapag-request na!</Text>
                  <Text style={S.pendingMessage}>
                    Nakapag-request ka na ng pagkakasali sa klase.
                    Hiintayin ang approval ng iyong guro.
                  </Text>
                  <View style={S.pendingBadge}>
                    <Text style={S.pendingBadgeText}>Pending Approval</Text>
                  </View>
                </View>
              ) : (
                <View style={S.joinCard}>
                  <Text style={S.joinLabel}>Code ng Klase</Text>

                  <View style={S.joinInputRow}>
                    <TextInput
                      style={[S.joinInput, { flex: 2 }]}
                      placeholder="Ilagay ang code"
                      value={joiningCode}
                      onChangeText={(text) => {
                        setJoiningCode(text);
                        setClassCodeValidation(null);
                      }}
                      autoCapitalize="characters"
                      maxLength={6}
                      editable={!validatingClassCode}
                    />
                    <TouchableOpacity
                      style={[S.verifyBtn, validatingClassCode && { opacity: 0.6 }]}
                      onPress={handleValidateClassCode}
                      disabled={validatingClassCode}
                      activeOpacity={0.7}
                    >
                      {validatingClassCode ? (
                        <ActivityIndicator size="small" color={C.white} />
                      ) : (
                        <Text style={S.verifyBtnText}>E-verify</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {classCodeValidation && (
                    <Text style={[
                      S.validationMessage,
                      { color: classCodeValidation.valid ? '#27ae60' : '#e74c3c' }
                    ]}>
                      {classCodeValidation.valid ? '✓ ' : '✗ '}{classCodeValidation.message}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[S.joinBtn, joining && { opacity: 0.7 }]}
                    onPress={handleJoinClass}
                    disabled={joining || !joiningCode.trim()}
                  >
                    {joining ? (
                      <ActivityIndicator color={C.white} />
                    ) : (
                      <Text style={S.joinBtnText}>Sumali na!</Text>
                    )}
                  </TouchableOpacity>
                  <Text style={S.joinHint}>Hingin ang Class Code sa iyong guro.</Text>
                </View>
              )}
            </View>
          </BounceIn>
        )}
      </View>

      {/*
        <ConfirmationModal
          visible={leaveModalVisible}
          onCancel={() => setLeaveModalVisible(false)}
          onConfirm={confirmLeaveClass}
          title="Umalis sa Klase?"
          message="Sigurado ka bang gusto mong umalis sa klaseng ito?"
          cancelText="Bumalik"
          confirmText="Umalis"
          type="danger"
        />
        */}
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={leaveModalVisible}
        onCancel={() => setLeaveModalVisible(false)}
        onConfirm={confirmLeaveClass}
        title="Umalis sa Klase?"
        message="Sigurado ka bang gusto mong umalis sa klaseng ito?"
        cancelText="Bumalik"
        confirmText="Umalis"
        type="danger"
      />
      {/* Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={leavePasswordModalVisible}
        onRequestClose={() => setLeavePasswordModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={S.modalContainer}>
            {/* DECORATIVE TOP BAR */}
            <View style={S.modalIndicator} />

            {/* ICON BOX */}
            <View style={[S.modalIconBox, { backgroundColor: C.red + '12' }]}>
              <BookOpenIcon size={32} color={C.red} />
            </View>

            {/* TEXT CONTENT */}
            <Text style={S.modalTitle}>Ilagay ang iyong password</Text>
            <Text style={S.modalMessage}>Ilagay ang iyong password upang magtagumpay na umalis</Text>

            {/* PASSWORD INPUT */}
            <TextInput
              style={S.modalInput}
              placeholder="Password"
              placeholderTextColor={C.slate}
              secureTextEntry={true}
              value={leavePassword}
              onChangeText={setLeavePassword}
              autoCapitalize="none"
            />

            {/* BUTTONS */}
            <View style={S.modalButtonRow}>
              <TouchableOpacity style={S.modalCancelBtn} onPress={() => setLeavePasswordModalVisible(false)} activeOpacity={0.6}>
                <Text style={S.modalCancelBtnText}>Bumalik</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.modalConfirmBtn, { backgroundColor: C.red }]}
                onPress={confirmPasswordLeave}
                activeOpacity={0.8}
              >
                <Text style={S.modalConfirmBtnText}>Umalis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  headerLogo: { width: 100, height: 90 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Andika-Bold',
    color: C.slate,
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  heroCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 20,
    marginBottom: 16,
    ...Shadows.cardLift,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'Andika-Regular',
    color: C.slate,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    color: C.ink,
  },

  infoCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 14,
    ...Shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.slate + '10',
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: C.slate,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: C.ink,
  },

  codeCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 14,
    ...Shadows.card,
  },
  codeValue: {
    fontSize: 20,
    fontFamily: 'Andika-Bold',
    color: C.teal,
    marginBottom: 6,
  },
  codeHint: {
    fontSize: 12,
    fontFamily: 'Andika-Regular',
    color: C.slate,
  },

  leaveBtn: {
    backgroundColor: C.coral,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...Shadows.button,
    marginBottom: 30,
  },
  leaveBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: 'Andika-Bold',
  },

  joinCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 20,
    ...Shadows.card,
  },
  pendingCard: {
    backgroundColor: C.white,
    borderRadius: Radii.lg,
    padding: 20,
    ...Shadows.card,
    alignItems: 'center',
  },
  pendingTitle: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    marginBottom: 8,
  },
  pendingMessage: {
    fontSize: 14,
    fontFamily: 'Andika-Regular',
    color: C.slate,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  pendingBadge: {
    backgroundColor: '#f39c12' + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f39c12' + '40',
  },
  pendingBadgeText: {
    fontSize: 13,
    fontFamily: 'Andika-Bold',
    color: '#f39c12',
  },
  joinLabel: {
    fontSize: 14,
    fontFamily: 'Andika-Bold',
    color: C.slate,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  joinInput: {
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: C.slate + '20',
    flex: 2,
  },
  verifyBtn: {
    height: 46,
    borderRadius: 17,
    backgroundColor: C.green,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
    minWidth: 100,
    paddingHorizontal: 20,
  },
  verifyBtnText: {
    fontSize: 14,
    fontFamily: 'Andika-Bold',
    color: C.white,
    paddingHorizontal: 4,
  },
  validationMessage: {
    fontSize: 12,
    fontFamily: 'Andika-Regular',
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  joinBtn: {
    width: '100%',
    backgroundColor: C.green,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...Shadows.button,
    marginBottom: 12,
  },
  joinBtnText: {
    color: C.white,
    fontSize: 16,
    fontFamily: 'Andika-Bold',
  },
  joinHint: {
    fontSize: 12,
    fontFamily: 'Andika-Regular',
    color: C.slate,
    textAlign: 'center',
  },
  // Password Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: C.white,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
    ...Shadows.cardLift
  },
  modalIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#F0F3F6',
    borderRadius: 2,
    marginBottom: 24
  },
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    marginBottom: 10,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: C.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 4
  },
  modalInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: C.slate + '20',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    fontFamily: 'Andika-Regular',
    color: C.ink,
    marginBottom: 24
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.slate,
    borderRadius: 12
  },
  modalCancelBtnText: {
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    color: C.ink
  },
  modalConfirmBtn: {
    flex: 1.6,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
    shadowOpacity: 0.15
  },
  modalConfirmBtnText: {
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    color: C.white,
    letterSpacing: 0.3
  }
});
