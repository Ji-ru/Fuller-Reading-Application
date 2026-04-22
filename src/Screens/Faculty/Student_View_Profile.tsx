import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';

import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import bubbles from '../../UI_Designs/BubblesDesign';
import { useNavigationHelper, RootStackParamList } from '../../Controller/NavigationController';
import { useStudentReadingStats } from '../../Hooks/use_ReadingStudentStats';
import { FacultyColors as F, Radii, Shadows } from '../../Utilities/Theme';
import { 
  BarChartIcon, 
  BookOpenIcon, 
  HistoryIcon, 
  TargetIcon, 
  UserProfileIcon, 
  ZapIcon,
  TrendUpIcon,
  RefreshIcon,
  ClipboardListIcon,
  StarIcon
} from '../../Components/GlobalUse/Icons';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { AssessmentController } from '../../Controller/AssessmentController';
import { getUserProfile } from '../../Controller/AuthenticationController';
import { MiscueReportController } from '../../Controller/MiscueReportController';

const { width: SW } = Dimensions.get('window');
const alphabetData = readingMaterialData?.Alphabet || [];

type RouteParams = RouteProp<RootStackParamList, 'StudentViewProfile'>;

interface ProgressData {
  date: string;
  accuracy: number;
  wpm: number;
  passageTitle: string;
}

export default function StudentViewProfile() {
  const route = useRoute<RouteParams>();
  const { studentId, studentName, readingLevel } = route.params;

  const { handleBackStep } = useNavigationHelper();
  const { stats, progress, loading: statsLoading, error, refresh: refreshStats } = useStudentReadingStats(studentId);

  const [aralinDone, setAralinDone] = useState(0);
  const [assessmentsDone, setAssessmentsDone] = useState(0);
  const [assessmentAvg, setAssessmentAvg] = useState(0);
  const [internalLoading, setInternalLoading] = useState(true);

  const topMiscuedPassage = stats?.passagePerformance?.[0];
  const hasProgressData = progress.length > 0;

  useEffect(() => {
    fetchDetailedStats();
  }, [studentId]);

  const fetchDetailedStats = async () => {
    try {
      setInternalLoading(true);
      const [mastered, detailedMastery, profile] = await Promise.all([
        MiscueReportController.getStudentMasteredLessons(studentId),
        MiscueReportController.getStudentDetailedCompletion(studentId),
        getUserProfile(studentId)
      ]);

      // Calculate Aralin Done
      const aralinCount = calculateAralinDone(detailedMastery);
      setAralinDone(aralinCount);

      // Fetch Assessment Stats
      const classCode = profile?.studentData?.classCode;
      if (classCode) {
        const actList = await AssessmentController.getStudentActivities(classCode);
        let completedCount = 0;
        let totalCorrect = 0;
        let totalPossible = 0;

        for (const act of actList) {
          const res = await AssessmentController.getStudentResultForUser(act.activityId, studentId);
          if (res) {
            completedCount++;
            totalCorrect += res.score;
            totalPossible += res.totalItems;
          }
        }
        setAssessmentsDone(completedCount);
        setAssessmentAvg(totalPossible > 0 ? (totalCorrect / totalPossible) * 100 : 0);
      }
    } catch (e) {
      console.log("Error fetching detailed stats:", e);
    } finally {
      setInternalLoading(false);
    }
  };

  const calculateAralinDone = (mastery: any) => {
    if (!mastery || !mastery.completedAlpha || !mastery.completedWords || !mastery.completedPassages) return 0;
    let completedCount = 0;
    
    alphabetData.forEach((aralin, idx) => {
      const letter = aralin.letter;
      const isAlphaDone = mastery.completedAlpha.has(letter) ? 1 : 0;
      const wordCount = mastery.completedWords?.[letter]?.size || 0;
      const totalWords = getTotalWordsForLetter(letter);

      const currentPassages = readingMaterialData?.Passages?.filter((p: any) => p.aralin === idx + 1) || [];
      const passageCount = currentPassages.filter((p: any) => mastery.completedPassages.has(p.title)).length;
      const totalPassages = currentPassages.length;

      const totalPossible = 1 + totalWords + totalPassages;
      const masteredCount = isAlphaDone + Math.min(wordCount, totalWords) + Math.min(passageCount, totalPassages);

      const progressPerc = totalPossible > 0 ? Math.round((masteredCount / totalPossible) * 100) : 0;
      if (progressPerc === 100) completedCount++;
    });
    
    return completedCount;
  };


  const getTotalWordsForLetter = (letter: string) => {
    if (!readingMaterialData?.Words) return 0;
    const subset = readingMaterialData.Words.filter((w: any) => w.letter === letter);
    const allWords = subset.flatMap((w: any) => (w.contrasts || []).flatMap((c: any) => c.words || []));
    const letterLower = letter.toLowerCase();
    const uniqueWords = Array.from(new Set(allWords)).filter(
      (word: any) => word?.trim().toLowerCase() !== letterLower
    );
    return uniqueWords.length;
  };


  const handleRefresh = async () => {
    refreshStats();
    await fetchDetailedStats();
  };

  const loading = statsLoading || internalLoading;

  if (loading) {
    return (
      <SafeAreaView style={S.loadingContainer}>
        <ActivityIndicator size="large" color={F.primary} />
        <Text style={S.loadingText}>Kinukuha ang istatistika...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={S.loadingContainer}>
        <Text style={S.errorText}>{error}</Text>
        <TouchableOpacity style={S.retryBtn} onPress={handleRefresh}>
          <Text style={S.retryBtnText}>Subukan muli</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Charts ─────────────────────────────────────────────────────────────────
  
  const AccuracyChart = ({ data }: { data: ProgressData[] }) => {
    const maxHeight = 120;
    const chartData = data.slice(-10);
    return (
      <View style={S.chartSection}>
        <View style={S.chartHeader}>
          <TargetIcon size={18} color={F.primary} />
          <Text style={S.chartTitle}>Accuracy Over Time</Text>
        </View>
        <View style={S.chartWrapper}>
          <View style={S.yAxis}>
            {['100%', '75%', '50%', '25%', '0%'].map(l => <Text key={l} style={S.yAxisLabel}>{l}</Text>)}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={S.chartBarsRow}>
              {chartData.map((item, index) => {
                const height = (item.accuracy / 100) * maxHeight;
                const isLast = index === chartData.length - 1;
                const barColor = item.accuracy >= 90 ? '#10b981' : item.accuracy >= 75 ? '#f59e0b' : '#ef4444';
                return (
                  <View key={index} style={S.barComp}>
                    <View style={S.barCore}>
                      <Text style={[S.barVal, { color: barColor }]}>{item.accuracy}%</Text>
                      <View style={[S.barFill, { height, backgroundColor: barColor }]} />
                      {!isLast && <View style={[S.connector, { backgroundColor: barColor }]} />}
                    </View>
                    <Text style={S.barLabel}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const WPMChart = ({ data }: { data: ProgressData[] }) => {
    const maxHeight = 100;
    const chartData = data.slice(-10);
    const maxWPM = Math.max(...chartData.map(d => d.wpm), 100);
    return (
      <View style={S.chartSection}>
        <View style={S.chartHeader}>
          <ZapIcon size={18} color={F.primary} />
          <Text style={S.chartTitle}>Words Per Minute Trends</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={S.wpmChartContainer}>
            {chartData.map((item, index) => {
              const height = (item.wpm / maxWPM) * maxHeight;
              return (
                <View key={index} style={S.wpmBarWrapper}>
                  <Text style={S.wpmValue}>{item.wpm}</Text>
                  <View style={[S.wpmBar, { height, backgroundColor: F.primary }]} />
                  <Text style={S.wpmLabel}>{item.date}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const SummarySection = ({ data }: { data: ProgressData[] }) => {
    if (data.length === 0) return null;
    const bestAcc = Math.max(...data.map(d => d.accuracy));
    const avgWPM = Math.round(data.reduce((s, d) => s + d.wpm, 0) / data.length);
    
    const firstAcc = data[0].accuracy;
    const lastAcc = data[data.length - 1].accuracy;
    const accImp = lastAcc - firstAcc;

    return (
      <View style={S.card}>
        <Text style={S.cardTitle}>Performance Summary</Text>
        <View style={S.trendRow}>
          <View style={S.trendItem}>
            <Text style={S.trendVal}>{bestAcc}%</Text>
            <Text style={S.trendLab}>Best Accuracy</Text>
          </View>
          <View style={S.vDivider} />
          <View style={S.trendItem}>
            <Text style={S.trendVal}>{avgWPM}</Text>
            <Text style={S.trendLab}>Average WPM</Text>
          </View>
          <View style={S.vDivider} />
          <View style={S.trendItem}>
            <TrendUpIcon size={20} color={accImp >= 0 ? '#10b981' : '#f43f5e'} />
            <Text style={[S.trendVal, { color: accImp >= 0 ? '#10b981' : '#f43f5e', fontSize: 14 }]}>
              {accImp >= 0 ? `+${accImp}%` : `${accImp}%`}
            </Text>
            <Text style={S.trendLab}>Progress</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.bg}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Bubbles */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

        {/* Header */}
        <View style={S.headerBar}>
          <TouchableOpacity style={S.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
            <View style={S.backArrow} />
          </TouchableOpacity>
          <Image style={S.logo} source={require('../../../assets/images/cisckids copy.png')} resizeMode="contain" />
          <View style={{ width: 44 }} />
        </View>

        {/* Hero */}
        <BounceIn delay={100}>
          <View style={S.heroCard}>
            <View style={S.heroLeft}>
              <Text style={S.heroLabel}>Profil ng Mag-aaral</Text>
              <Text style={S.heroName}>{studentName}</Text>
              <View style={S.heroLevelBadge}>
                <BookOpenIcon size={12} color={F.white} />
                <Text style={S.heroLevelText}>{readingLevel}</Text>
              </View>
            </View>
            <View style={S.heroIconCircle}>
              <UserProfileIcon size={40} color={F.primaryDeep} />
            </View>
          </View>
        </BounceIn>

        {/* Core Stats */}
        <View style={S.content}>
          <BounceIn delay={200}>
            <View style={S.statsGrid}>
              <View style={S.statCard}>
                <View style={[S.statIconBox, { backgroundColor: F.primary + '15' }]}>
                  <BookOpenIcon size={20} color={F.primary} />
                </View>
                <Text style={S.statVal}>{aralinDone}</Text>
                <Text style={S.statLab}>Aralin</Text>
              </View>
              <View style={S.statCard}>
                <View style={[S.statIconBox, { backgroundColor: F.primary + '15' }]}>
                  <ClipboardListIcon size={20} color={F.primary} />
                </View>
                <Text style={S.statVal}>{assessmentsDone}</Text>
                <Text style={S.statLab}>Pagsusulit</Text>
              </View>
              <View style={S.statCard}>
                <View style={[S.statIconBox, { backgroundColor: F.purple + '15' }]}>
                  <StarIcon size={20} color={F.purple} />
                </View>
                <Text style={S.statVal} numberOfLines={1}>{assessmentAvg.toFixed(0)}%</Text>
                <Text style={S.statLab}>Galing</Text>
              </View>
            </View>
          </BounceIn>

          {/* Miscue Details */}
          <BounceIn delay={300}>
            {topMiscuedPassage && (
              <View style={[S.card, { borderLeftWidth: 5, borderLeftColor: '#ef4444' }]}>
                <Text style={S.cardTitle}>Top Miscued Passage</Text>
                <Text style={S.passageTitle}>{topMiscuedPassage.title}</Text>
                <View style={S.pStatsRow}>
                  <Text style={S.pStatText}>Accuracy: <Text style={{ fontWeight: '800' }}>{topMiscuedPassage.accuracy.toFixed(1)}%</Text></Text>
                  <Text style={S.pStatText}>Attempts: <Text style={{ fontWeight: '800' }}>{topMiscuedPassage.attempts}</Text></Text>
                </View>
              </View>
            )}

            {stats?.mostCommonMiscueWords?.length ? (
              <View style={S.card}>
                <Text style={S.cardTitle}>Common Miscue Words</Text>
                <View style={S.wordList}>
                  {stats.mostCommonMiscueWords.map((item, index) => (
                    <View key={index} style={S.wordItem}>
                      <Text style={S.wordTxt}>"{item.word}"</Text>
                      <View style={S.wordCountBadge}>
                        <Text style={S.wordCountTxt}>{item.count}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </BounceIn>

          {/* Progress Charts */}
          {hasProgressData && (
            <BounceIn delay={400}>
              <View style={{ marginTop: 10 }}>
                <AccuracyChart data={progress} />
                <WPMChart data={progress} />
                <SummarySection data={progress} />
              </View>
            </BounceIn>
          )}

          <TouchableOpacity style={S.refreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
            <RefreshIcon size={18} color={F.white} />
            <Text style={S.refreshBtnText}>I-update ang Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: F.bg },
  content: { paddingHorizontal: 16 },
  
  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  logo: { width: 100, height: 90 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  backArrow: {
    width: 12, height: 12, borderLeftWidth: 3, borderTopWidth: 3,
    borderColor: F.primaryDeep, transform: [{ rotate: '-45deg' }], marginLeft: 4
  },

  // Hero
  heroCard: {
    backgroundColor: F.primaryDeep, marginHorizontal: 16, marginTop: 10,
    borderRadius: Radii.xl, padding: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', ...Shadows.cardLift
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  heroName: { fontSize: 24, fontWeight: '900', color: F.white, marginBottom: 12 },
  heroLevelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10
  },
  heroLevelText: { color: F.white, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  heroIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: F.primaryLight, justifyContent: 'center', alignItems: 'center' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: F.white, borderRadius: 20, padding: 16,
    alignItems: 'center', ...Shadows.card
  },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statVal: { fontSize: 18, fontWeight: '900', color: F.ink, marginBottom: 2 },
  statLab: { fontSize: 11, fontWeight: '700', color: F.slate, textTransform: 'uppercase' },

  // Generic Card
  card: {
    backgroundColor: F.white, borderRadius: 24, padding: 20,
    marginBottom: 16, ...Shadows.card
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: F.slate, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  
  // Passage Detail
  passageTitle: { fontSize: 20, fontWeight: '900', color: F.ink, marginBottom: 10 },
  pStatsRow: { flexDirection: 'row', gap: 16 },
  pStatText: { fontSize: 14, color: F.inkLight },

  // Word List
  wordList: { gap: 8 },
  wordItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: F.bg
  },
  wordTxt: { fontSize: 16, fontWeight: '700', color: F.ink, fontStyle: 'italic' },
  wordCountBadge: { backgroundColor: F.primary + '12', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  wordCountTxt: { fontSize: 12, fontWeight: '900', color: F.primaryDeep },

  // Charts
  chartSection: { backgroundColor: F.white, borderRadius: 24, padding: 20, marginBottom: 16, ...Shadows.card },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  chartTitle: { fontSize: 15, fontWeight: '800', color: F.ink },
  chartWrapper: { flexDirection: 'row' },
  yAxis: { justifyContent: 'space-between', paddingRight: 12, height: 120, paddingVertical: 10 },
  yAxisLabel: { fontSize: 10, color: F.slate, fontWeight: '700' },
  chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 140, paddingHorizontal: 10 },
  barComp: { alignItems: 'center', marginHorizontal: 8 },
  barCore: { alignItems: 'center', position: 'relative' },
  barVal: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  barFill: { width: 22, borderTopLeftRadius: 11, borderTopRightRadius: 11, minHeight: 4 },
  connector: { position: 'absolute', top: '60%', right: -12, width: 24, height: 2, opacity: 0.15, zIndex: -1 },
  barLabel: { fontSize: 10, color: F.slate, fontWeight: '700', marginTop: 12 },

  wpmChartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 120, paddingHorizontal: 4 },
  wpmBarWrapper: { alignItems: 'center', marginHorizontal: 10 },
  wpmValue: { fontSize: 12, fontWeight: '900', color: F.primaryDeep, marginBottom: 6 },
  wpmBar: { width: 26, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  wpmLabel: { fontSize: 10, color: F.slate, fontWeight: '700', marginTop: 8 },

  // Summary
  trendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  trendItem: { flex: 1, alignItems: 'center' },
  trendVal: { fontSize: 20, fontWeight: '900', color: F.ink },
  trendLab: { fontSize: 10, fontWeight: '700', color: F.slate, marginTop: 4, textTransform: 'uppercase' },
  vDivider: { width: 1, height: 30, backgroundColor: F.bg },

  // Actions
  refreshBtn: {
    backgroundColor: F.primaryDeep, borderRadius: Radii.lg, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginTop: 10, ...Shadows.button
  },
  refreshBtnText: { color: F.white, fontSize: 16, fontWeight: '800' },

  // Loading/Error
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: F.bg },
  loadingText: { marginTop: 16, color: F.slate, fontWeight: '700', fontSize: 16 },
  errorText: { fontSize: 16, color: F.red, fontWeight: '700', textAlign: 'center', padding: 20 },
  retryBtn: { backgroundColor: F.primary, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, ...Shadows.button },
  retryBtnText: { color: F.white, fontWeight: '800', fontSize: 15 },
});
