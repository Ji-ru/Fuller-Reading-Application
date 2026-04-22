
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { AssessmentController } from '../../Controller/AssessmentController';
import { ActivityDocument, ActivityResultDocument } from '../../Interfaces/dataInterfaces';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { 
  ClipboardListIcon, 
  ChevronRightIcon, 
  CheckCircleIcon, 
  BackArrowIcon,
  StarIcon 
} from '../../Components/GlobalUse/Icons';
import { getUserProfile } from '../../Controller/AuthenticationController';
import auth from '@react-native-firebase/auth';
import bubbles from '../../UI_Designs/BubblesDesign';
import { BounceIn } from '../../Components/GlobalUse/Animations';

export default function StudentAssessments() {
  const { handleBackStep, handleAssessmentNext } = useNavigationHelper();
  const [activities, setActivities] = useState<ActivityDocument[]>([]);
  const [results, setResults] = useState<Record<string, ActivityResultDocument>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCompleted: 0, totalPending: 0, avgAccuracy: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const profile = await getUserProfile(user.uid);
      const classCode = profile?.studentData?.classCode;

      if (classCode) {
        const actList = await AssessmentController.getStudentActivities(classCode);
        
        // Sort newest first locally to ensure order regardless of Firestore index status
        const sorted = [...actList].sort((a, b) => {
          const tA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
          const tB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
          return tB - tA;
        });
        
        setActivities(sorted);

        // Fetch results for these activities
        const resultsMap: Record<string, ActivityResultDocument> = {};
        for (const act of actList) {
          const res = await AssessmentController.getStudentResult(act.activityId);
          if (res) resultsMap[act.activityId] = res;
        }
        setResults(resultsMap);

        // Calculate stats
        const resultValues = Object.values(resultsMap);
        const totalCompleted = resultValues.length;
        const totalPending = actList.length - totalCompleted;
        const avgAccuracy = totalCompleted > 0 
          ? Math.round(resultValues.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalCompleted)
          : 0;
        setStats({ totalCompleted, totalPending, avgAccuracy });
      }
    } catch (error) {
      console.error('Student fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivityItem = (activity: ActivityDocument, index: number) => {
    const result = results[activity.activityId];
    const isCompleted = !!result;
    const { handleAssessmentReview } = useNavigationHelper();

    return (
      <BounceIn key={activity.activityId} delay={index * 36}>
        <TouchableOpacity 
          style={[S.card, isCompleted && S.cardCompleted]}
          onPress={() => isCompleted ? handleAssessmentReview(result) : handleAssessmentNext(activity.activityId)}
          activeOpacity={0.8}
        >
          <View style={S.cardIconBox}>
             <ClipboardListIcon size={24} color={isCompleted ? C.green : C.teal} />
          </View>
          
          <View style={S.cardContent}>
            <Text style={S.cardTitle}>{activity.title}</Text>
            <Text style={S.cardSubtitle}>Aralin {activity.aralinIndex + 1} • {activity.cardLimit} Cards</Text>
            
            {isCompleted && (
              <View style={S.scoreBadge}>
                <StarIcon size={12} color={C.yellow} />
                <Text style={S.scoreText}>Score: {result.score}/{result.totalItems}</Text>
              </View>
            )}
          </View>

          <View style={S.cardRight}>
            {isCompleted ? (
              <CheckCircleIcon size={24} color={C.green} />
            ) : (
              <ChevronRightIcon size={20} color={C.teal} />
            )}
          </View>
        </TouchableOpacity>
      </BounceIn>
    );
  };

  return (
    <SafeAreaView style={S.root}>
      {/* Bubbles Background */}
      <View style={bubbles.bubblesContainer} pointerEvents="none">
        <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
        <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
        <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
      </View>

      <View style={S.header}>
        <TouchableOpacity onPress={handleBackStep} style={S.backBtn} activeOpacity={0.7}>
          <BackArrowIcon color={C.ink} />
        </TouchableOpacity>
        <Image
          style={S.headerLogo}
          source={require('../../../assets/images/cisckids copy.png')}
          resizeMode="contain"
        />
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        <BounceIn delay={48}>
          <View style={S.heroBanner}>
            {/* Decorative background shapes */}
            <View style={[S.heroCircle, { backgroundColor: C.teal + '12', top: -30, right: -40, width: 140, height: 140 }]} />
            <View style={[S.heroCircle, { backgroundColor: C.teal + '06', bottom: -20, left: -20, width: 90, height: 90 }]} />
            
            <View style={S.heroText}>
              <Text style={S.heroSub}>Gawin ang iyong</Text>
              <Text style={S.heroTitle}>PAGSUSULIT</Text>
              <View style={S.heroLine} />
            </View>
            <Image style={S.heroImage} source={require('../../../assets/images/Abc-Reading2.png')} />

          </View>
        </BounceIn>

        <BounceIn delay={90}>
          <View style={S.statsGrid}>
            <View style={[S.statsCard, { backgroundColor: C.green }]}>
              <CheckCircleIcon size={22} color={C.white} />
              <View style={S.statsDetails}>
                <Text style={[S.statsVal, { color: C.white }]}>
                  {stats.totalCompleted} / {activities.length}
                </Text>
                <Text style={[S.statsLab, { color: 'rgba(255,255,255,0.8)' }]}>Natapos</Text>
              </View>
            </View>

            <View style={[S.statsCard, { backgroundColor: C.coral }]}>
              <StarIcon size={22} color={C.white} />
              <View style={S.statsDetails}>
                <Text style={[S.statsVal, { color: C.white }]}>{stats.avgAccuracy}%</Text>
                <Text style={[S.statsLab, { color: 'rgba(255,255,255,0.8)' }]}>Galing</Text>
              </View>
            </View>
          </View>
        </BounceIn>


        {loading ? (
          <ActivityIndicator size="large" color={C.teal} style={{ marginTop: 40 }} />
        ) : activities.length === 0 ? (
          <View style={S.emptyBox}>
            <Text style={S.emptyTitle}>Walang Quiz</Text>
            <Text style={S.emptyDesc}>Wala ka pang nakatalagang quiz para sa klase mo.</Text>
          </View>
        ) : (
          activities.map((a, i) => renderActivityItem(a, i))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle
  },
  headerLogo: {
    width: 100,
    height: 90,
  },
  
  scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 100 },
  
  // ── Hero Banner ────────────────────────────────────────────────────────
  heroBanner: {
    backgroundColor: C.white, borderRadius: Radii.xl,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20,
    ...Shadows.cardLift, overflow: 'hidden',
    marginBottom: 20,
    position: 'relative'
  },
  heroCircle: { position: 'absolute', borderRadius: 999, zIndex: 1 },
  heroText:  { flex: 1, zIndex: 2 },
  heroSub:   { fontSize: 13, color: C.slate, fontWeight: '700', marginBottom: 2, opacity: 0.7 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.coral, lineHeight: 32 },
  heroLine:  { height: 4, width: 40, backgroundColor: C.coral, marginTop: 8, borderRadius: 2 },
  heroImage: { width: 95, height: 95, resizeMode: 'contain', zIndex: 2 },


  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statsCard: {
    flex: 1, backgroundColor: C.white, borderRadius: Radii.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', ...Shadows.subtle
  },
  statsDetails: { marginLeft: 12 },
  statsVal: { fontSize: 22, fontWeight: '900', color: C.ink },
  statsLab: { fontSize: 11, color: C.slate, fontWeight: '700', textTransform: 'uppercase' },

  card: {
    backgroundColor: C.white, borderRadius: Radii.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12, ...Shadows.card
  },
  cardCompleted: { opacity: 0.8 },
  cardIconBox: {
    width: 50, height: 50, borderRadius: 15, backgroundColor: C.coral + '12',
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: C.ink, marginBottom: 2 },
  cardSubtitle: { fontSize: 14, color: C.slate, fontWeight: '600' },
  cardRight: { marginLeft: 8 },

  scoreBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 6,
    backgroundColor: C.yellow + '15', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
  },
  scoreText: { fontSize: 11, fontWeight: '800', color: C.yellowDark, marginLeft: 4 },


  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.slate },
  emptyDesc: { fontSize: 14, color: C.slate, textAlign: 'center', marginTop: 8, opacity: 0.7 },
});
