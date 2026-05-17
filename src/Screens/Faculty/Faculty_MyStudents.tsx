import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ReportController } from '../../Controller/ReportController';
import bubbles from '../../UI_Designs/BubblesDesign';
import { RootStackParamList } from '../../Controller/NavigationController';
import { useRoute, RouteProp } from '@react-navigation/native';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { UsersIcon, SearchIcon, ChevronRightIcon, BookOpenIcon, HistoryIcon } from '../../Components/GlobalUse/Icons';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';

const { width: SW } = Dimensions.get('window');

type MyStudentsRouteProp = RouteProp<RootStackParamList, 'MyStudents'>;

export default function MyStudents() {
  const route = useRoute<MyStudentsRouteProp>();
  const { classId, className, classCode, acadYear } = route.params;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UserDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<UserDocument[]>([]);
  const [studentTrends, setStudentTrends] = useState<Record<string, { label: string, color: string }>>({});

  const { handleBackStep, handleStudentViewStats } = useNavigationHelper();

  const fetchFacultyStudents = useCallback(async () => {
    try {
      setLoading(true);
      const studentList = await getFacultyClasses_Student.getStudentsInClass(classCode);
      setStudents(studentList);
      setFilteredStudents(studentList);

      // Fetch trends dynamically based on assessment data
      const studentIds = studentList.map(s => s.uid);
      const allResults = await ReportController._getAllResultsForStudents(studentIds);

      const resultsByStudent: Record<string, any[]> = {};
      allResults.forEach(r => {
        if (!resultsByStudent[r.studentId]) resultsByStudent[r.studentId] = [];
        resultsByStudent[r.studentId].push(r);
      });

      const trends: Record<string, { label: string, color: string }> = {};
      for (const uid of studentIds) {
        const sResults = resultsByStudent[uid] || [];
        const scores = sResults
          .sort((a, b) => {
            const ta = a.completedAt?.toDate?.() || new Date(0);
            const tb = b.completedAt?.toDate?.() || new Date(0);
            return ta.getTime() - tb.getTime();
          })
          .map(r => r.percentage);

        const trendRaw = ReportController._calculateTrend(scores);
        if (sResults.length === 0) {
          trends[uid] = { label: 'Nagsisimula', color: F.primaryDeep };
        } else if (trendRaw === 'improving') {
          trends[uid] = { label: 'Umuunlad', color: '#1a9985' };
        } else if (trendRaw === 'needs_practice') {
          trends[uid] = { label: 'Kailangan Magsanay', color: F.red };
        } else {
          trends[uid] = { label: 'Matatag', color: F.primary };
        }
      }
      setStudentTrends(trends);

    } catch (error: any) {
      console.log('Fetch students error:', error);
    } finally {
      setLoading(false);
    }
  }, [classCode]);

  useEffect(() => {
    fetchFacultyStudents();
  }, [fetchFacultyStudents]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.firstName} ${student.middleName ?? ''} ${student.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const renderStudentItem = ({ item, index }: { item: UserDocument; index: number }) => {
    const trend = studentTrends[item.uid];
    const readingLevel = (item as any).studentData?.reading_Level || 'beginner';

    return (
      <BounceIn delay={index * 50}>
        <TouchableOpacity
          style={S.studentCard}
          activeOpacity={0.75}
          onPress={() =>
            handleStudentViewStats({
              studentId: item.uid,
              studentName: `${item.firstName} ${item.lastName}`,
              readingLevel,
            })
          }
        >
          <View style={S.cardMain}>
            <View style={S.avatarBox}>
              <Text style={S.avatarText}>
                {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={S.studentInfo}>
              <Text style={S.studentName} numberOfLines={1}>
                {item.firstName} {item.lastName}
              </Text>
              {trend && (
                <View style={[S.trendPill, { backgroundColor: trend.color + '18' }]}>
                  <View style={[S.trendDot, { backgroundColor: trend.color }]} />
                  <Text style={[S.trendText, { color: trend.color }]}>{trend.label}</Text>
                </View>
              )}
            </View>
            <ChevronRightIcon size={18} color={F.slate} />
          </View>
        </TouchableOpacity>
      </BounceIn>
    );
  };

  return (
    <SafeAreaView style={S.safeArea}>
      <View style={S.container}>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

        {/* HEADER */}
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={handleBackStep}>
            <View style={S.backArrow} />
          </TouchableOpacity>
          <Image
            style={S.logo}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={S.loadingBox}>
            <LoadingDots />
            <Text style={S.loadingText}>Kinukuha ang listahan ng mga mag-aaral...</Text>
          </View>
        ) : (
          <View style={S.content}>
            <FlatList
              data={filteredStudents}
              renderItem={renderStudentItem}
              keyExtractor={item => item.uid}
              ListHeaderComponent={
                <BounceIn delay={100}>
                  <View style={S.heroCard}>
                    <View style={S.heroLeft}>
                      <Text style={S.heroLabel}>Class Records</Text>
                      <Text style={S.heroTitle} numberOfLines={2}>{className}</Text>
                      <View style={S.heroCodeBox}>
                        <Text style={S.heroCodeLabel}>Class Code:</Text>
                        <Text style={S.heroCodeVal}>{classCode}</Text>
                      </View>
                    </View>
                    <UsersIcon size={48} color={F.primaryLight} />
                  </View>

                  {/* SEARCH */}
                  <View style={S.searchBox}>
                    <SearchIcon size={20} color={F.slate} />
                    <TextInput
                      style={S.searchInput}
                      placeholder="Maghanap ng pangalan..."
                      placeholderTextColor="#999"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>

                  <View style={S.listHeaderRow}>
                    <Text style={S.listLabel}>MGA MAG-AARAL ({filteredStudents.length})</Text>
                    <Text style={S.yearText}>{acadYear}</Text>
                  </View>
                </BounceIn>
              }
              contentContainerStyle={S.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={S.emptyBox}>
                  <UsersIcon size={64} color={F.slate} />
                  <Text style={S.emptyTitle}>Walang nahanap</Text>
                  <Text style={S.emptySub}>Subukan ang ibang pangalan o hintaying{'\n'}mag-enroll ang mga estudyante.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: F.bg },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, marginBottom: 10
  },
  logo: { width: 100, height: 90 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  backArrow: {
    width: 12, height: 12, borderLeftWidth: 3, borderTopWidth: 3,
    borderColor: F.primaryDeep, transform: [{ rotate: '-45deg' }],
    marginLeft: 4
  },

  content: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  heroCard: {
    backgroundColor: F.primaryDeep, borderRadius: Radii.xl, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20, ...Shadows.cardLift
  },
  heroLeft: { flex: 1, marginRight: 16 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4, fontFamily: 'Andika-Regular' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white, marginBottom: 12, fontFamily: 'Andika-Bold' },
  heroCodeBox: { flexDirection: 'row', alignItems: 'center', opacity: 0.9 },
  heroCodeLabel: { fontSize: 12, color: F.white, fontWeight: '600', fontFamily: 'Andika-Regular' },
  heroCodeVal: { fontSize: 13, color: F.white, fontWeight: '900', marginLeft: 6, textTransform: 'uppercase', fontFamily: 'Andika-Bold' },

  searchBox: {
    backgroundColor: F.white, borderRadius: Radii.lg, paddingHorizontal: 16,
    height: 56, flexDirection: 'row', alignItems: 'center', marginBottom: 24, ...Shadows.card
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: F.ink, fontWeight: '600', fontFamily: 'Andika-Regular' },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  listLabel: { fontSize: 13, fontWeight: '800', color: F.slate, letterSpacing: 1, fontFamily: 'Andika-Bold' },
  yearText: { fontSize: 12, fontWeight: '700', color: F.primaryDeep, backgroundColor: F.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontFamily: 'Andika-Regular' },

  studentCard: {
    backgroundColor: F.white, borderRadius: Radii.xl, padding: 16, marginBottom: 12, ...Shadows.card
  },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 18, fontWeight: '900', color: F.primaryDeep, fontFamily: 'Andika-Bold' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 17, fontWeight: '800', color: F.ink, marginBottom: 4, fontFamily: 'Andika-Bold' },
  levelBadge: { backgroundColor: F.primary + '10', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  levelText: { fontSize: 11, fontWeight: '700', color: F.primaryDeep, textTransform: 'capitalize', fontFamily: 'Andika-Regular' },

  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Andika-Bold',
  },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: F.slate, fontWeight: '600', fontFamily: 'Andika-Regular' },

  emptyBox: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginTop: 16, fontFamily: 'Andika-Bold' },
  emptySub: { fontSize: 14, color: F.slate, textAlign: 'center', marginTop: 8, fontFamily: 'Andika-Regular' },
});
