
import auth from '@react-native-firebase/auth';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FacultySideMenu from '../../Components/Faculty/NavigationBar/FacultySideMenu';
import {
  BurgerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  FilterIcon,
  TrashIcon,
  BookOpenIcon,
  EditIcon
} from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import ConfirmationModal from '../../Components/GlobalUse/ConfirmationModal';
import { AssessmentController } from '../../Controller/AssessmentController';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { getFacultyClasses_Student } from '../../Hooks/use_FacultyClasses_Students';
import { ActivityDocument, ActivityResultDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { LoadingDots } from '../../Components/GlobalUse/LoadingDots';
import bubbles from '../../UI_Designs/BubblesDesign';
import { FacultyColors as F, ACCENT_COLORS as L, Radii, Shadows } from '../../Utilities/Theme';
import { getUserProfile } from '../../Controller/AuthenticationController';

export default function FacultyAssessments() {
  const [activities, setActivities] = useState<(ActivityDocument & { completedCount?: number })[]>([]);
  const [classes, setClasses] = useState<ClassDocument[]>([]);
  const [selectedClassCode, setSelectedClassCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [previewActivity, setPreviewActivity] = useState<ActivityDocument | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState<'preview' | 'results'>('results');
  const [activityResults, setActivityResults] = useState<(ActivityResultDocument & { studentName?: string })[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  
  // DELETE STATE
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  
  const scrollRef = useRef<ScrollView>(null);
  
  const { handleLogout, handleNextStep } = useNavigationHelper();
  const route = useRoute();

  // DRAG DISMISS LOGIC
  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const resetPan = useCallback(() => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [panY]);

  const closeWithAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: 1000,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setPreviewActivity(null);
    });
  }, [panY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture if swiping down significantly
        return Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeWithAnimation();
        } else {
          resetPan();
        }
      },
    })
  ).current;

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [selectedClassCode])
  );

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) return;

      const [actList, classList] = await Promise.all([
        AssessmentController.getFacultyActivities(selectedClassCode || undefined),
        getFacultyClasses_Student.getFacultyClasses(user.uid)
      ]);

      // Fetch completion counts for each activity
      const activitiesWithStats = await Promise.all(actList.map(async (act) => {
        try {
          const results = await AssessmentController.getActivityResults(act.activityId);
          // Ensure unique students
          const uniqueStudents = new Set(results.map(r => r.studentId));
          return { ...act, completedCount: uniqueStudents.size };
        } catch (subError) {
          console.warn(`Failed to fetch results for activity ${act.activityId}:`, subError);
          return { ...act, completedCount: 0 };
        }
      }));

      setActivities(activitiesWithStats);
      setClasses(classList);
    } catch (error) {
      console.error('Fetch assessments error:', error);
      // Try to at least show the activities list if it was fetched
      try {
        const fallbackActs = await AssessmentController.getFacultyActivities(selectedClassCode || undefined);
        setActivities(fallbackActs);
      } catch (fallbackError) {
        console.error('Total fetch failure:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSelect = (code: string | null) => {
    setSelectedClassCode(code);
    setFilterVisible(false);
    // The useFocusEffect will trigger fetchInitialData since selectedClassCode changed
  };

  const handleDelete = (id: string) => {
    setActivityToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      await AssessmentController.deleteActivity(activityToDelete);
      setActivities(prev => prev.filter(a => a.activityId !== activityToDelete));
      setDeleteModalVisible(false);
      setActivityToDelete(null);
    }
  };

  const nextPreview = () => {
    if (previewActivity && currentPreviewIndex < previewActivity.items.length - 1) {
      setCurrentPreviewIndex(prev => prev + 1);
    }
  };

  const prevPreview = () => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(prev => prev - 1);
    }
  };

  const handleOpenPreview = async (activity: ActivityDocument) => {
    panY.setValue(1000);
    backdropOpacity.setValue(0);
    setCurrentPreviewIndex(0);
    setPreviewTab('results'); // Default to results to show progress first
    setActivityResults([]);
    setPreviewActivity(activity);

    Animated.parallel([
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Fetch results
    setResultsLoading(true);
    try {
      const results = await AssessmentController.getActivityResults(activity.activityId);
      const resultsWithNames = await Promise.all(results.map(async (res) => {
        try {
          const profile = await getUserProfile(res.studentId);
          if (profile) {
            const name = `${profile.firstName} ${profile.lastName}`.trim();
            return { ...res, studentName: name || 'Unknown Student' };
          }
          return { ...res, studentName: 'Unknown Student' };
        } catch (e) {
          return { ...res, studentName: 'Unknown Student' };
        }
      }));
      setActivityResults(resultsWithNames);
    } catch (error) {
       console.error("Results fetch error:", error);
    } finally {
      setResultsLoading(false);
    }
  };

  const currentItems = previewActivity?.items || [];

  const renderAnalyticsSummary = () => {
    if (activityResults.length === 0) return null;

    const studentWordAverages: Record<string, Record<string, { correct: number, total: number }>> = {};
    const passageMistakes: Record<string, number> = {};

    activityResults.forEach(res => {
      const sId = res.studentId;
      if (!studentWordAverages[sId]) studentWordAverages[sId] = {};

      res.responses?.forEach(resp => {
        if (resp.type === 'alphabet' || resp.type === 'word') {
          const key = `${resp.type}_${resp.contentId}`;
          if (!studentWordAverages[sId][key]) studentWordAverages[sId][key] = { correct: 0, total: 0 };
          studentWordAverages[sId][key].total += 1;
          if (resp.isCorrect) studentWordAverages[sId][key].correct += 1;
        } else if (resp.type === 'passage' && resp.miscues) {
          resp.miscues.forEach((miscue: any) => {
            if (miscue.type === 'substitution' || miscue.type === 'omission') {
              const ew: string = miscue.expected?.toLowerCase() || '';
              if (ew) {
                 passageMistakes[ew] = (passageMistakes[ew] || 0) + 1;
              }
            }
          });
        }
      });
    });

    const alphabetStats: Record<string, { studentsPassed: number, totalStudents: number }> = {};
    const wordStats: Record<string, { studentsPassed: number, totalStudents: number }> = {};

    Object.values(studentWordAverages).forEach(studentStats => {
      Object.entries(studentStats).forEach(([key, stats]) => {
        const isAlphabet = key.startsWith('alphabet_');
        const contentId = key.replace(/^(alphabet|word)_/, '');
        
        const targetStats = isAlphabet ? alphabetStats : wordStats;
        if (!targetStats[contentId]) targetStats[contentId] = { studentsPassed: 0, totalStudents: 0 };
        
        targetStats[contentId].totalStudents += 1;
        
        // Mastery threshold: 50% or more
        if ((stats.correct / stats.total) >= 0.5) {
          targetStats[contentId].studentsPassed += 1;
        }
      });
    });

    const hasAlphabetStats = Object.keys(alphabetStats).length > 0;
    const hasWordStats = Object.keys(wordStats).length > 0;
    const hasPassageStats = Object.keys(passageMistakes).length > 0;

    if (!hasAlphabetStats && !hasWordStats && !hasPassageStats) return null;

    const topMistakes = Object.entries(passageMistakes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // top 5

    return (
      <View style={S.analyticsContainer}>
        <Text style={S.analyticsHeader}>Analytics Summary</Text>
        
        {hasAlphabetStats && (
          <View style={S.analyticsBlock}>
            <Text style={S.analyticsSubheader}>Tunog ng mga Titik</Text>
            {Object.entries(alphabetStats).map(([letter, stats]) => (
              <View key={letter} style={S.statRow}>
                <Text style={S.statLabel}>"{letter}"</Text>
                <Text style={[S.statValue, { color: (stats.studentsPassed/stats.totalStudents) >= 0.8 ? F.primary : F.orange }]}>{stats.studentsPassed}/{stats.totalStudents} estudyante</Text>
              </View>
            ))}
          </View>
        )}

        {hasWordStats && (
          <View style={S.analyticsBlock}>
            <Text style={S.analyticsSubheader}>Mga Salita</Text>
            {Object.entries(wordStats).map(([word, stats]) => (
              <View key={word} style={S.statRow}>
                <Text style={S.statLabel}>"{word}"</Text>
                <Text style={[S.statValue, { color: (stats.studentsPassed/stats.totalStudents) >= 0.8 ? F.primary : F.orange }]}>{stats.studentsPassed}/{stats.totalStudents} estudyante</Text>
              </View>
            ))}
          </View>
        )}

        {hasPassageStats && topMistakes.length > 0 && (
          <View style={S.analyticsBlock}>
            <Text style={S.analyticsSubheader}>Most Common Passage Mistakes</Text>
            {topMistakes.map(([word, count]) => (
              <View key={word} style={S.statRow}>
                <Text style={S.statLabel}>"{word}"</Text>
                <Text style={[S.statValue, { color: F.red }]}>{count} mistake{count !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderActivityCard = ({ item: activity, index }: { item: (ActivityDocument & { completedCount?: number }), index: number }) => {
    const targetClass = classes.find(c => c.classCode === activity.classCode);
    const totalStudents = targetClass?.studentIds?.length || 0;
    const completedCount = activity.completedCount || 0;

    return (
      <TouchableOpacity
        style={S.card}
        onPress={() => handleOpenPreview(activity)}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={S.cardContent}>
          <View style={S.cardHeader}>
            <View style={S.cardIconBox}>
              <ClipboardListIcon size={20} color={F.primary} />
            </View>
            <View style={S.cardTitleArea}>
              <Text style={S.cardTitle}>{activity.title}</Text>
              <Text style={S.cardMeta}>
                Aralin {activity.aralinIndex + 1} • {activity.items?.length || 0} materials
              </Text>
            </View>
            <View style={[S.percentBadge, { backgroundColor: (completedCount/Math.max(1, totalStudents)) >= 1 ? F.primary + '15' : F.slate + '10' }]}>
               <Text style={[S.percentText, { color: (completedCount/Math.max(1, totalStudents)) >= 1 ? F.primary : F.slate }]}>
                 {completedCount}/{totalStudents}
               </Text>
            </View>
          </View>
          
          <View style={S.cardFooter}>
            <View style={S.codeBadge}>
              <Text style={S.codeLabel}>Target Class:</Text>
              <Text style={S.codeVal}>{activity.classCode}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(activity.activityId)}
              style={S.actionBtn}
            >
              <TrashIcon size={18} color={F.red} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={S.root}>
      {/* Bubbles Background */}
      <View style={[bubbles.bubblesContainer, { zIndex: -1 }]} pointerEvents="none">
        <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
      </View>

      <View style={S.container}>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        </View>

        {/* HEADER */}
        <View style={S.headerRow}>
          <TouchableOpacity style={S.menuBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
            <BurgerIcon size={24} color={F.ink} />
          </TouchableOpacity>
          <Image
            style={S.logo}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={S.loadingContainer}>
            <LoadingDots />
          </View>
        ) : (
          <View style={S.content}>
            <FlatList
              data={activities}
              renderItem={renderActivityCard}
              keyExtractor={(item, index) => item.activityId || index.toString()}
              ListHeaderComponent={
                <BounceIn delay={100}>
                  <View style={S.heroBanner}>
                    <View>
                      <Text style={S.heroSub}>Pamamahala ng Pagsusulit</Text>
                      <Text style={S.heroTitle}>Mga Pagsusulit</Text>
                    </View>
                    <ClipboardListIcon size={48} color={F.primaryLight} />
                  </View>

                  <TouchableOpacity 
                    style={S.createBtn} 
                    onPress={() => handleNextStep('FacultyCreateAssessment')}
                  >
                    <View style={S.createIconBox}>
                      <Text style={{ color: F.white, fontSize: 24, fontWeight: 'bold' }}>+</Text>
                    </View>
                    <Text style={S.createBtnText}>Gumawa ng Bagong Assessment</Text>
                  </TouchableOpacity>

                  <Text style={S.listLabel}>FILTER BY CLASS</Text>
                  <TouchableOpacity 
                    style={S.dropdownTrigger}
                    onPress={() => setFilterVisible(true)}
                  >
                    <View style={S.dropdownLeft}>
                      <View style={S.filterIconBox}>
                        <FilterIcon size={18} color={F.primary} />
                      </View>
                      <Text style={S.dropdownValue}>
                        {selectedClassCode 
                          ? classes.find(c => c.classCode === selectedClassCode)?.className || selectedClassCode
                          : 'Lahat ng Klase'}
                      </Text>
                    </View>
                    <ChevronRightIcon size={18} color={F.slate} style={{ transform: [{ rotate: '90deg' }] }} />
                  </TouchableOpacity>

                  <Text style={S.listLabel}>MGA PAGSUSULIT ({activities.length})</Text>
                </BounceIn>
              }
              contentContainerStyle={S.scrollContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={S.emptyState}>
                  <ClipboardListIcon size={64} color={F.slate + '40'} />
                  <Text style={S.emptyTitle}>Walang nahanap</Text>
                  <Text style={S.emptyDesc}>Subukan ang ibang filter o gumawa ng bagong assessment.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      <FacultySideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogout}
        currentRoute="FacultyAssessments"
      />

      {/* Preview Modal */}
      <Modal
        visible={!!previewActivity}
        animationType="none"
        transparent={true}
        onRequestClose={closeWithAnimation}
      >
        <View style={S.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeWithAnimation}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity }
              ]}
            />
          </TouchableWithoutFeedback>

            <Animated.View
              style={[
                S.modalContainer,
                { transform: [{ translateY: panY }] }
              ]}
              {...panResponder.panHandlers}
            >
              <View style={S.draggableHeader}>
              <View style={S.dismissHandle} />
              {previewActivity && (
                <View style={S.headerContent}>

                  
                  <View style={S.tabBar}>
                    <TouchableOpacity 
                      style={[S.tab, previewTab === 'results' && S.tabActive]} 
                      onPress={() => setPreviewTab('results')}
                    >
                      <Text style={[S.tabText, previewTab === 'results' && S.tabTextActive]}>Results</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[S.tab, previewTab === 'preview' && S.tabActive]} 
                      onPress={() => setPreviewTab('preview')}
                    >
                      <Text style={[S.tabText, previewTab === 'preview' && S.tabTextActive]}>Preview</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {previewActivity && previewTab === 'preview' && (
              <ScrollView style={S.modalScroll}>
                <View style={S.deckWrapper}>
                  <TouchableOpacity
                    style={[S.scrollArrow, currentPreviewIndex === 0 && { opacity: 0.3 }]}
                    onPress={prevPreview}
                    disabled={currentPreviewIndex === 0}
                  >
                    <ChevronLeftIcon size={24} color={F.slate} />
                  </TouchableOpacity>

                  <View style={S.previewCardContainer}>
                    {(() => {
                      const items = previewActivity.items || [];
                      const item = items[currentPreviewIndex];
                      if (!item) return null;

                      const arIndex = previewActivity.aralinIndex || 0;
                      const accent = L[(arIndex + currentPreviewIndex) % L.length];
                      return (
                        <View style={S.largePreviewCard}>
                          <View style={S.miniCardTop}>
                            <View style={[S.miniCardType, { backgroundColor: accent + '15' }]}>
                              <Text style={[S.miniCardTypeText, { color: accent }]}>{item.type === 'alphabet' ? 'TUNOG' : item.type === 'word' ? 'SALITA' : 'TALATA'}</Text>
                            </View>
                          </View>

                          <View style={S.largeCardBody}>
                            <Text
                              style={[S.largeCardText, { color: F.inkDeep }, item.type === 'passage' && { fontSize: 18, lineHeight: 24 }]}
                              numberOfLines={item.type === 'passage' ? 10 : 1}
                            >
                              {item.contentId}
                            </Text>
                          </View>

                          <View style={S.cardCounterBox}>
                             <Text style={S.cardCounterText}>({currentPreviewIndex + 1} of {currentItems.length})</Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>

                  <TouchableOpacity
                    style={[S.scrollArrow, currentPreviewIndex === currentItems.length - 1 && { opacity: 0.3 }]}
                    onPress={nextPreview}
                    disabled={currentPreviewIndex === currentItems.length - 1}
                  >
                    <ChevronRightIcon size={24} color={F.slate} />
                  </TouchableOpacity>
                </View>

                <View style={S.paginationDots}>
                  {currentItems.slice(0, 10).map((_, i) => (
                    <View key={i} style={[S.dot, currentPreviewIndex === i && S.dotActive]} />
                  ))}
                  {currentItems.length > 10 && <Text style={S.moreDots}>...</Text>}
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}

            {previewActivity && previewTab === 'results' && (
              <View style={S.resultsContainer}>
                {resultsLoading ? (
                  <View style={S.loadingArea}>
                    <LoadingDots size={8} />
                    <Text style={S.loadingText}>Fetching results...</Text>
                  </View>
                ) : activityResults.length === 0 ? (
                  <View style={S.emptyResults}>
                     <Text style={S.emptyResultsText}>Wala pang sumasagot sa assessment na ito.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={activityResults}
                    keyExtractor={(item, index) => item.resultId || index.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    ListHeaderComponent={renderAnalyticsSummary}
                    renderItem={({ item }) => (
                      <View style={S.resultItem}>
                        <View style={S.resultInfo}>
                          <Text style={S.resultName}>{item.studentName}</Text>
                          <Text style={S.resultDate}>Completed {new Date(item.completedAt?.seconds * 1000).toLocaleDateString()}</Text>
                        </View>
                        <View style={S.resultScoreBox}>
                           <Text style={[S.resultScore, { color: item.percentage >= 80 ? F.primary : item.percentage >= 50 ? F.orange : F.red }]}>
                             {item.score}/{item.totalItems}
                           </Text>
                           <Text style={S.resultPercent}>{item.percentage}%</Text>
                        </View>
                      </View>
                    )}
                  />
                )}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={deleteModalVisible}
        type="danger"
        title="Burahin ang Assessment?"
        message="Sigurado ka ba na gusto mong burahin ang pagsusulit na ito? Hindi na ito mababawi."
        confirmText="Burahin"
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
      />

      {/* Class Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableOpacity 
          style={S.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setFilterVisible(false)}
        >
          <View style={[S.modalContainer, { height: 'auto', maxHeight: '60%' }]}>
            <View style={S.dismissHandle} />
            <Text style={S.modalTitle}>Pumili ng Klase</Text>
            
            <ScrollView style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                style={[S.filterOption, !selectedClassCode && S.filterOptionActive]}
                onPress={() => handleFilterSelect(null)}
              >
                <Text style={[S.filterOptionText, !selectedClassCode && S.filterOptionTextActive]}>Lahat ng Klase</Text>
                {!selectedClassCode && <View style={S.activeDot} />}
              </TouchableOpacity>

              {classes.map((cl) => (
                <TouchableOpacity
                  key={cl.classId}
                  style={[S.filterOption, selectedClassCode === cl.classCode && S.filterOptionActive]}
                  onPress={() => handleFilterSelect(cl.classCode)}
                >
                  <View>
                    <Text style={[S.filterOptionText, selectedClassCode === cl.classCode && S.filterOptionTextActive]}>
                      {cl.className}
                    </Text>
                    <Text style={S.filterOptionSub}>{cl.classCode} • Grade {cl.gradeLevel}</Text>
                  </View>
                  {selectedClassCode === cl.classCode && <View style={S.activeDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ height: 30 }} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: F.bg },
  container: { flex: 1 },
  headerRow: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 
  },
  logo: { width: 100, height: 90 },
  menuBtn: { 
    width: 44, height: 44, borderRadius: 14, backgroundColor: F.white, 
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle 
  },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  heroBanner: { 
    backgroundColor: F.primaryDeep, borderRadius: Radii.xl, padding: 24, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    marginBottom: 20, ...Shadows.cardLift 
  },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4, fontFamily: 'Andika-Regular' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: F.white, fontFamily: 'Andika-Bold' },
  
  createBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: F.white, 
    borderRadius: Radii.lg, padding: 16, marginBottom: 24, ...Shadows.card 
  },
  createIconBox: { 
    width: 40, height: 40, borderRadius: 12, backgroundColor: F.primary, 
    justifyContent: 'center', alignItems: 'center', marginRight: 16 
  },
  createBtnText: { fontSize: 15, fontWeight: '800', color: F.ink, fontFamily: 'Andika-Bold' },
  
  listLabel: { 
    fontSize: 13, fontWeight: '800', color: F.slate, letterSpacing: 1, 
    marginBottom: 16, textTransform: 'uppercase', fontFamily: 'Andika-Bold'
  },
  
  filterBar: { 
    flexDirection: 'row', marginBottom: 24, backgroundColor: F.white + '80', 
    padding: 4, borderRadius: 16 
  },
  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: F.white, borderRadius: Radii.lg, padding: 16, marginBottom: 24,
    ...Shadows.card
  },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center' },
  filterIconBox: { 
    width: 32, height: 32, borderRadius: 8, backgroundColor: F.primary + '15', 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  dropdownValue: { fontSize: 15, fontWeight: '700', color: F.ink, fontFamily: 'Andika-Bold' },
  
  filterOption: {
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  filterOptionActive: { borderBottomColor: F.primary + '20' },
  filterOptionText: { fontSize: 16, fontWeight: '600', color: F.ink, fontFamily: 'Andika-Regular' },
  filterOptionTextActive: { color: F.primary, fontWeight: '800', fontFamily: 'Andika-Bold' },
  filterOptionSub: { fontSize: 12, color: F.slate, marginTop: 2, fontFamily: 'Andika-Regular' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: F.primary },
  modalTitle: { fontSize: 20, fontWeight: '900', color: F.ink, textAlign: 'center', marginVertical: 20, fontFamily: 'Andika-Bold' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { backgroundColor: F.white, borderRadius: Radii.xl, padding: 20, marginBottom: 16, ...Shadows.card },
  cardContent: {},
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: F.primary + '15', justifyContent: 'center', alignItems: 'center' },
  cardTitleArea: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: F.ink, fontFamily: 'Andika-Bold' },
  cardMeta: { fontSize: 12, color: F.slate, marginTop: 2, fontWeight: '600', fontFamily: 'Andika-Regular' },
  
  cardFooter: { 
    marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f1f1',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  codeBadge: { flexDirection: 'row', alignItems: 'center' },
  codeLabel: { fontSize: 12, color: F.slate, fontWeight: '600', fontFamily: 'Andika-Regular' },
  codeVal: { fontSize: 13, fontWeight: '800', color: F.primaryDeep, marginLeft: 6, textTransform: 'uppercase', fontFamily: 'Andika-Bold' },
  actionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...Shadows.subtle },
  
  emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: F.ink, marginTop: 16, fontFamily: 'Andika-Bold' },
  emptyDesc: { fontSize: 14, color: F.slate, textAlign: 'center', marginTop: 8, fontFamily: 'Andika-Regular' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { 
    backgroundColor: F.white, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    height: '75%', 
    overflow: 'hidden' 
  },
  draggableHeader: { alignItems: 'center', paddingTop: 12, paddingBottom: 0, backgroundColor: F.white },
  headerContent: { width: '100%', paddingHorizontal: 20, paddingTop: 15 },
  dismissHandle: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#e0e0e0', marginBottom: 5 },
  modalScroll: { flex: 1, paddingHorizontal: 20 },
  
  previewTitle: { fontSize: 24, fontWeight: '900', color: F.ink, marginBottom: 12, textAlign: 'center', fontFamily: 'Andika-Bold' },
  tabBar: { flexDirection: 'row', backgroundColor: F.slate + '10', borderRadius: 12, padding: 4, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: F.white, ...Shadows.subtle },
  tabText: { fontSize: 13, fontWeight: '700', color: F.slate, fontFamily: 'Andika-Regular' },
  tabTextActive: { color: F.primaryDeep, fontWeight: '800', fontFamily: 'Andika-Bold' },
  
  resultsContainer: { flex: 1 },
  loadingArea: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 13, color: F.slate, marginTop: 10, fontWeight: '600', fontFamily: 'Andika-Regular' },
  resultItem: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: F.white, padding: 16, borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#f0f0f0'
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '800', color: F.inkDeep, fontFamily: 'Andika-Bold' },
  resultDate: { fontSize: 12, color: F.slate, marginTop: 2, fontFamily: 'Andika-Regular' },
  resultScoreBox: { alignItems: 'flex-end' },
  resultScore: { fontSize: 17, fontWeight: '900', fontFamily: 'Andika-Bold' },
  resultPercent: { fontSize: 11, fontWeight: '700', color: F.slate, marginTop: 2, fontFamily: 'Andika-Regular' },
  emptyResults: { padding: 40, alignItems: 'center' },
  emptyResultsText: { fontSize: 14, color: F.slate, fontStyle: 'italic', textAlign: 'center', fontFamily: 'Andika-Regular' },
  
  analyticsContainer: { backgroundColor: F.primary + '05', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: F.primary + '20' },
  analyticsHeader: { fontSize: 16, fontWeight: '800', color: F.inkDeep, marginBottom: 12, fontFamily: 'Andika-Bold' },
  analyticsBlock: { marginBottom: 12 },
  analyticsSubheader: { fontSize: 12, fontWeight: '800', color: F.slate, marginBottom: 8, textTransform: 'uppercase', fontFamily: 'Andika-Bold' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  statLabel: { fontSize: 14, fontWeight: '700', color: F.ink, fontStyle: 'italic', fontFamily: 'Andika-Regular' },
  statValue: { fontSize: 13, fontWeight: '800', fontFamily: 'Andika-Bold' },
  
  previewCardContainer: { flex: 1, marginVertical: 20, alignItems: 'center', justifyContent: 'center' },
  largePreviewCard: {
    width: '90%', height: 230, borderRadius: Radii.xl, padding: 10,
    backgroundColor: F.white, 
    borderWidth: 1, borderColor: '#e8f5e9',
    ...Shadows.card, overflow: 'hidden', position: 'relative',
    justifyContent: 'center', alignSelf: 'center'
  },
  largeCardBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  largeCardText: { fontSize: 44, fontWeight: '900', textAlign: 'center', fontFamily: 'Andika-Bold' },
  
  miniCardTop: { position: 'absolute', top: 12, left: 14, zIndex: 10 },
  miniCardType: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniCardTypeText: { fontSize: 9, fontWeight: '800', color: F.white, letterSpacing: 0.5, fontFamily: 'Andika-Bold' },
  
  cardCounterBox: { position: 'absolute', bottom: 12, right: 14, backgroundColor: F.slate + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardCounterText: { fontSize: 10, fontWeight: '800', color: F.slate, letterSpacing: 0.5, fontFamily: 'Andika-Bold' },
  
  tileShine: { position: 'absolute', top: 5, right: 6, width: 15, height: 15, borderRadius: 7.5, backgroundColor: 'rgba(255,255,255,0.25)' },
  tileShine2: { position: 'absolute', top: 12, right: 18, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  
  deckWrapper: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 10, justifyContent: 'center' },
  scrollArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: F.white, justifyContent: 'center', alignItems: 'center', ...Shadows.card, zIndex: 10 },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#eee', marginHorizontal: 3 },
  dotActive: { backgroundColor: F.primary, width: 14 },
  moreDots: { fontSize: 10, color: F.slate, marginLeft: 2, fontFamily: 'Andika-Regular' },
});
