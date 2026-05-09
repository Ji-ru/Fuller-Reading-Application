import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { BookOpenIcon } from '../../Components/GlobalUse/Icons';
import { getCurrentUser, getUserProfile, getClassByCode } from '../../Controller/AuthenticationController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { ClassDocument } from '../../Interfaces/dataInterfaces';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

function BackArrow({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

export default function Student_Classes() {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassDocument | null>(null);
  const [firstName, setFirstName] = useState('Mag-aaral');
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
    Alert.alert(
      'Leave Class',
      'Are you sure you want to leave this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => console.log('Leave class pressed') },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={S.bg}>
        <View style={S.headerBar}>
          <TouchableOpacity onPress={handleBackStep} style={S.backBtn} activeOpacity={0.7}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Aking Klase</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color={C.teal} />
          <Text style={S.loadingText}>Naglo-load...</Text>
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
        <Text style={S.headerTitle}>Aking Klase</Text>
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

        {/* Class Information Section */}
        <BounceIn delay={72}>
          <View style={S.section}>
            <View style={S.sectionTitleRow}>
              <BookOpenIcon size={16} color={C.ink} />
              <Text style={S.sectionTitle}>Impormasyon ng Klase</Text>
            </View>
            
            <View style={S.infoCard}>
              <View style={S.infoRow}>
                <Text style={S.infoLabel}>Antas ng Baitang</Text>
                <Text style={S.infoValue}>{classData?.gradeLevel ? `Grade ${classData.gradeLevel}` : 'N/A'}</Text>
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
              <BookOpenIcon size={16} color={C.ink} />
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
            <Text style={S.leaveBtnText}>Leave Class</Text>
          </TouchableOpacity>
        </BounceIn>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    fontWeight: '800',
    color: C.ink,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
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
    fontWeight: '800',
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
    fontWeight: '600',
    color: C.slate,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
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
    fontWeight: '800',
    color: C.teal,
    marginBottom: 6,
  },
  codeHint: {
    fontSize: 12,
    fontWeight: '500',
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
    fontWeight: '800',
  },
});