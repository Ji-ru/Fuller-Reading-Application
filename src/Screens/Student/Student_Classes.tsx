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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon } from '../../Components/GlobalUse/Icons';
import { getCurrentUser, getUserProfile, getClassByCode, joinClass } from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';

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
  const [joiningCode, setJoiningCode] = useState('');
  const [joining, setJoining] = useState(false);
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
          setClassData(cls);
        }
      } catch (e) {
        console.error('Failed to fetch class:', e);
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
    console.log('Leave class pressed');
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

      await joinClass(user.uid, joiningCode.trim().toUpperCase());
      Alert.alert('Tagumpay!', 'Matagumpay kang nakasali sa klase.');
      
      // Refresh class data
      const cls = await getClassByCode(joiningCode.trim().toUpperCase());
      setClassData(cls);
    } catch (e: any) {
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
              
              <View style={S.joinCard}>
                <Text style={S.joinLabel}>Class Code</Text>
                <TextInput
                  style={S.joinInput}
                  placeholder="I-type ang Class Code rito"
                  value={joiningCode}
                  onChangeText={setJoiningCode}
                  autoCapitalize="characters"
                  maxLength={6}
                />
                <TouchableOpacity 
                  style={[S.joinBtn, joining && { opacity: 0.7 }]} 
                  onPress={handleJoinClass}
                  disabled={joining}
                >
                  {joining ? (
                    <ActivityIndicator color={C.white} />
                  ) : (
                    <Text style={S.joinBtnText}>Sumali na!</Text>
                  )}
                </TouchableOpacity>
                <Text style={S.joinHint}>Hingin ang Class Code sa iyong guro.</Text>
              </View>
            </View>
          </BounceIn>
        )}
      </View>

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
    alignItems: 'center',
  },
  joinLabel: {
    fontSize: 14,
    fontFamily: 'Andika-Bold',
    color: C.slate,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  joinInput: {
    width: '100%',
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.slate + '20',
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
});
