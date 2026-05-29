import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import {
  useMiscueAnalystics,
  useOverallAverageWPMandAccuracy,
  useTopMiscueIdentifier,
} from '../../../Hooks/use_ReadingStudentStats';
import { AverageWPMandAccuracy, FilterOptions, MiscuePercentage } from '../../../Interfaces/miscue';
import { FacultyColors as F, Radii, Shadows } from '../../../Utilities/Theme';
import { TrophyIcon, BookOpenIcon, UsersIcon, HistoryIcon, ChevronRightIcon } from '../../GlobalUse/Icons';
import { BounceIn } from '../../GlobalUse/Animations';
import { DUMMY_MISCUE_DATA, DUMMY_TOP_MISCUE } from '../../../Utilities/DummyPerformanceData';

interface MiscueData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface CommonWord {
  word: string;
  errorExample: string;
  errorCount: number;
  dominantMiscueType?: string;
   studentCount?: number;
}

interface TopMiscuedPassage {
  title: string;
  averageAccuracy: number;
  attempts: number;
  totalMiscues: number;
}

interface MiscueAnalyticsProps {
  facultyId?: string | null;
  classId?: string;
}

const MiscueAnalytics: React.FC<MiscueAnalyticsProps> = ({
  facultyId = null,
  classId,
}) => {
  const [filter, setFilter] = useState<FilterOptions>(
    classId ? { type: 'class', classId } : { type: 'overall' }
  );

  useEffect(() => {
    setFilter(classId ? { type: 'class', classId } : { type: 'overall' });
  }, [classId]);

  const { miscueData: hookMiscueData, loading: miscueLoading, error: miscueError } = useMiscueAnalystics(facultyId, filter);
  const { topMiscue, loading: topMiscueLoading, error: topMiscueError } = useTopMiscueIdentifier(facultyId, filter);
  const { averages: hookAverages, loading: averagesLoading, error: averagesError } = useOverallAverageWPMandAccuracy(facultyId, filter);

  const miscueData = hookMiscueData && hookMiscueData.length > 0 ? hookMiscueData : DUMMY_MISCUE_DATA;
  const averages = hookAverages || { averageAccuracy: 0, averageWPM: 0, totalReports: 0, totalStudents: 0 };
  
  const displayTopMiscue = topMiscue && topMiscue.length > 0 ? topMiscue : DUMMY_TOP_MISCUE;

  const isLoading = (miscueLoading || topMiscueLoading || averagesLoading);
  const hasError = miscueError || topMiscueError || averagesError;

  // We bypass the full loading screen if we have dummy data to show
  const showDummy = !hookMiscueData || hookMiscueData.length === 0;

  const totalMiscues = miscueData.reduce((sum, item) => sum + (item.count || 0), 0);
  
  let passage: TopMiscuedPassage | null = null;
  let commonWords: CommonWord[] = [];

  if (displayTopMiscue && displayTopMiscue.length > 0 && displayTopMiscue[0]) {
    const data = displayTopMiscue[0];
    if (data.topMiscuedPassage && data.topMiscuedPassage.length > 0) passage = data.topMiscuedPassage[0];
    if (data.commonMiscueWords) commonWords = data.commonMiscueWords.slice(0, 5);
  }

  const radius = 60;
  const stroke = 14;
  const center = radius + stroke;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = -90;

  return (
    <View style={S.container}>
      {/* ANALYSIS GRID */}
      {/* DONUT CHART */}
      <View style={[S.card, { marginBottom: 16 }]}>
         <Text style={S.cardTitle}>Miscue Breakdown</Text>
         <View style={S.chartContainer}>
            <Svg width={center * 2} height={center * 2}>
               <G rotation={0} originX={center} originY={center}>
                  {totalMiscues === 0 ? (
                     <Circle cx={center} cy={center} r={radius} stroke="#eef2f6" strokeWidth={stroke} fill="none" />
                  ) : (
                     miscueData.map((item, index) => {
                        const percentage = totalMiscues > 0 ? (item.count / totalMiscues) * 100 : 0;
                        const strokeDashoffset = circumference - (circumference * percentage) / 100;
                        const rotation = currentAngle;
                        currentAngle += (percentage / 100) * 360;
                        return (
                           <Circle
                              key={index}
                              cx={center}
                              cy={center}
                              r={radius}
                              stroke={item.color}
                              strokeWidth={stroke}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              transform={`rotate(${rotation}, ${center}, ${center})`}
                              fill="none"
                           />
                        );
                     })
                  )}
               </G>
            </Svg>
            <View style={S.chartOverlay}>
               <Text style={S.chartTotal}>{totalMiscues}</Text>
               <Text style={S.chartTotalLabel}>Miscues</Text>
            </View>
         </View>
         <View style={S.legend}>
            {miscueData.map((item, i) => (
               <View key={i} style={S.legendItem}>
                  <View style={[S.dot, { backgroundColor: item.color }]} />
                  <Text style={S.legendText}>{item.type}</Text>
                  <Text style={S.legendVal}>{Math.round(item.percentage)}%</Text>
               </View>
            ))}
         </View>
      </View>

{/* COMMON WORDS LIST */}
       <View style={[S.card, { marginBottom: 12, maxHeight: 200 }]}>
          <View style={S.cardHeader}>
             <Text style={S.cardTitle}>Frequent Miscued Words</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
          {commonWords.length > 0 ? (
             commonWords.map((word, idx) => (
                <View key={idx} style={[S.wordRow, idx === commonWords.length - 1 && { borderBottomWidth: 0 }]}>
                   <View style={S.wordLeft}>
                      <Text style={S.wordText}>{word.word}</Text>
                      <Text style={S.wordSub}>Commonly: "{word.errorExample}"</Text>
                   </View>
                   <View style={S.wordRight}>
                      <View style={[S.typeTag, { backgroundColor: word.dominantMiscueType === 'Substitution' ? '#FF272615' : '#FF941A15' }]}>
                         <Text style={[S.typeTagText, { color: word.dominantMiscueType === 'Substitution' ? '#FF2726' : '#FF941A' }]}>
                            {word.dominantMiscueType}
                         </Text>
                      </View>
                      {Number.isFinite(word.studentCount) && (word.studentCount || 0) > 0 && (
                         <View style={S.studentChip}>
                            <Text style={S.studentChipText}>
                               👥 {word.studentCount} {word.studentCount === 1 ? 'student' : 'students'}
                            </Text>
                         </View>
                      )}
                      <Text style={S.wordCount}>{word.errorCount}x</Text>
                   </View>
                </View>
             ))
          ) : (
             <View style={S.emptyBoxFull}>
                <Text style={S.emptyText}>No miscued words found.</Text>
             </View>
          )}
          </ScrollView>
       </View>

       {/* FREQUENT PASSAGES LIST */}
       <View style={[S.card, { maxHeight: 200 }]}>
          <Text style={S.cardTitle}>Frequent Miscued Passages</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
          {displayTopMiscue && displayTopMiscue[0]?.topMiscuedPassage?.length > 0 ? (
             displayTopMiscue[0].topMiscuedPassage.slice(0, 4).map((p: any, idx: number) => (
                <View key={idx} style={[S.wordRow, idx === 3 && { borderBottomWidth: 0 }]}>
                   <View style={S.wordLeft}>
                      <Text style={S.wordText} numberOfLines={1}>{p.title}</Text>
                      <Text style={S.wordSub}>{p.attempts} attempts</Text>
                   </View>
                   <View style={S.wordRight}>
                      <Text style={[S.wordCount, { color: p.averageAccuracy < 80 ? F.red : F.primaryDeep }]}>
                         {p.averageAccuracy}% Acr.
                      </Text>
                   </View>
                </View>
             ))
          ) : (
             <View style={S.emptyBoxFull}>
                <Text style={S.emptyText}>No miscued passages found.</Text>
             </View>
          )}
          </ScrollView>
       </View>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  loadingBox: { height: 300, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: F.slate, fontWeight: '600' },

  statsCard: {
     backgroundColor: F.white, borderRadius: Radii.xl, padding: 20,
     flexDirection: 'row', alignItems: 'center', marginBottom: 16,
     ...Shadows.card
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statVal: { fontSize: 18, fontWeight: '900', color: F.ink },
  statLabel: { fontSize: 10, color: F.slate, fontWeight: '700', textTransform: 'uppercase' },
  statDivider: { width: 1, height: 40, backgroundColor: '#f1f1f1' },

  analyticsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, ...Shadows.card },
  cardTitle: { fontSize: 15, fontWeight: '900', color: F.ink, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  chartContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  chartOverlay: { position: 'absolute', alignItems: 'center' },
  chartTotal: { fontSize: 24, fontWeight: '900', color: F.ink },
  chartTotalLabel: { fontSize: 10, color: F.slate, fontWeight: '700', textTransform: 'uppercase' },

  legend: { marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { flex: 1, fontSize: 12, color: F.slate, fontWeight: '600' },
  legendVal: { fontSize: 12, color: F.ink, fontWeight: '800' },

  passageIconArea: { flexDirection: 'row', alignItems: 'center' },
  wordRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  wordLeft: { flex: 1 },
  wordText: { fontSize: 15, fontWeight: '800', color: F.ink },
  wordSub: { fontSize: 12, color: F.slate, fontStyle: 'italic', marginTop: 2 },
  wordRight: { alignItems: 'flex-end' },
   studentChip: {
      backgroundColor: F.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginTop: 6,
   },
   studentChipText: { fontSize: 9, fontWeight: '800', color: F.primary },
  wordCount: { fontSize: 13, fontWeight: '900', color: F.ink, marginTop: 4 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeTagText: { fontSize: 9, fontWeight: '900' },

  emptyBoxFull: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: F.slate, textAlign: 'center', fontStyle: 'italic' },
});

export default MiscueAnalytics;
