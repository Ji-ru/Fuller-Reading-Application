
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { AssessmentController } from '../../Controller/AssessmentController';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
import { useAudioRecording } from '../../Controller/AudioRecordingController';
import { transcribeAudio as transcribeAudioAPI } from '../../../api';
import { ActivityDocument } from '../../Interfaces/dataInterfaces';
import { ReadingMaterial, Alphabet, Passage } from '../../Interfaces/passage';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';
import { PassageDisplay } from '../../Components/Student/Reading/TextDisplay';
import { RecordingControls } from '../../Components/Student/Reading/RecordingControls';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import bubbles from '../../UI_Designs/BubblesDesign';
import readingStyles from '../../UI_Designs/ReadingActivityStyles';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { StarIcon, TrophyIcon, CheckCircleIcon } from '../../Components/GlobalUse/Icons';

const { width } = Dimensions.get('window');

const alphabetData = readingMaterialData?.Alphabet || [];
const passagesData = readingMaterialData?.Passages || [];
const wordsData = readingMaterialData?.Words || [];

export default function StudentAssessmentActivity() {
  const route = useRoute<any>();
  const { activityId } = route.params;
  const { handleBackStep, handleAssessmentReview } = useNavigationHelper();


  const [activity, setActivity] = useState<ActivityDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState<{ contentId: string, isCorrect: boolean, type: 'alphabet' | 'word' | 'passage' }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Interaction State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [miscues, setMiscues] = useState<any[]>([]);

  const {
    isRecording,
    hasPermission,
    recordTime,
    startRecording,
    stopRecording,
  } = useAudioRecording();

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const act = await AssessmentController.getActivity(activityId);
      if (act) {
        setActivity(act);
        prepareDeck(act);
      } else {
        Alert.alert('Error', 'Activity not found');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const prepareDeck = (act: ActivityDocument) => {
    let allItems: any[] = [];

    act.items.forEach(item => {
      if (item.type === 'alphabet') {
        const found = alphabetData.find(a => a.letter === item.contentId);
        if (found) allItems.push({ ...found, type: 'alphabet' });
      } else if (item.type === 'word') {
        // We need a word object structure for PassageDisplay
        allItems.push({
          type: 'word',
          letter: '', // Doesn't matter for display
          contrasts: [{ words: [item.contentId] }]
        });
      } else if (item.type === 'passage') {
        const found = passagesData.find(p => p.title === item.contentId);
        if (found) allItems.push({ ...found, type: 'passage' });
      }
    });

    // If allItems is empty, we can't build a deck
    if (allItems.length === 0) {
      setDeck([]);
      return;
    }

    // Shuffle
    let shuffled = [...allItems].sort(() => Math.random() - 0.5);

    // If deck size < cardLimit, repeat items randomly
    while (shuffled.length < act.cardLimit && allItems.length > 0) {
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      shuffled.push(randomItem);
    }


    // Limit to exactly cardLimit
    setDeck(shuffled.slice(0, act.cardLimit));
  };

  const currentCard = deck[currentCardIndex];

  const handleAudioProcessing = async (audioFile: string) => {
    setIsTranscribing(true);
    try {
      const transcription = await transcribeAudioAPI(audioFile);
      setSpokenText(transcription);

      let correct = false;
      let calculatedMiscues: any[] = [];
      if (currentCard.type === 'alphabet') {
        const res = MiscueAnalysisService.checkAlphabetPhonemeAccuracy(currentCard.letter, transcription);
        correct = res.isCorrect;
      } else if (currentCard.type === 'word') {
        const target = currentCard.contrasts[0].words[0];
        const res = MiscueAnalysisService.checkWordAccuracy(target, transcription);
        correct = res.isCorrect;
      } else if (currentCard.type === 'passage') {
        const accuracy = parseFloat(MiscueAnalysisService.calculateAccuracy(currentCard.text, transcription));
        correct = accuracy >= 85; // v3 threshold
        calculatedMiscues = MiscueAnalysisService.detectMiscues(currentCard.text, transcription);
        setMiscues(calculatedMiscues);
      }

      setIsCorrect(correct);
      if (correct) setScore(prev => prev + 1);

      const responseObj: any = {
        contentId: currentCard.type === 'passage' ? (currentCard.title || 'Talata') : currentCard.type === 'alphabet' ? currentCard.letter : (currentCard.contrasts?.[0]?.words?.[0] || 'Salita'),
        isCorrect: correct,
        type: currentCard.type,
      };

      if (currentCard.type === 'passage') {
        responseObj.miscues = calculatedMiscues.map(m => ({
          type: m.type || null,
          expected: m.expected || null,
          spoken: m.spoken || null,
          position: m.position || 0
        }));
      }

      const nextResponses = [
        ...responses,
        responseObj
      ];
      setResponses(nextResponses);

      setIsProcessed(true);

      // Manually advance via button now


    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const advanceCard = (currentResponses: any[]) => {
    if (currentCardIndex < deck.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setSpokenText('');
      setIsCorrect(null);
      setIsProcessed(false);
      setMiscues([]);
    } else {
      finishQuiz(currentResponses);
    }
  };

  const finishQuiz = async (finalResponses: any[]) => {
    setIsFinished(true);
    try {
      await AssessmentController.submitResult(activityId, score, deck.length, finalResponses);
    } catch (e) {
      console.error('Submit result error:', e);
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      await handleAudioProcessing(audioFile);
    } else {
      const targetText = currentCard.type === 'alphabet' ? currentCard.letter
        : currentCard.type === 'word' ? currentCard.contrasts[0].words[0]
          : ''; // For passage, target is text
      await startRecording(targetText);
    }
  };

  if (loading || !deck.length) return <View style={S.loading}><ActivityIndicator size="large" color={C.teal} /></View>;


  if (isFinished) {
    return (
      <SafeAreaView style={S.root}>
        <View style={S.center}>
          <BounceIn>
            <View style={S.resultCard}>
              <View style={S.resultHeader}>
                <TrophyIcon size={50} color={C.yellow} />
              </View>

              <Text style={S.resultTitle}>Nagawa mo!</Text>
              <Text style={S.resultSub}>Natapos mo ang iyong assessment.</Text>

              <View style={S.scoreBadgeRow}>
                <View style={S.scoreMainBox}>
                  <Text style={S.scoreBig}>{score}</Text>
                  <View style={S.scoreDivider} />
                  <Text style={S.scoreTotal}>{deck.length}</Text>
                </View>
                <Text style={S.scoreLabel}>Tamang Sagot</Text>
              </View>

              <View style={S.starsRow}>
                <StarIcon size={24} color={score > 0 ? C.yellow : C.slate + '20'} />
                <StarIcon size={32} color={score / deck.length >= 0.7 ? C.yellow : C.slate + '20'} style={{ marginTop: -10 }} />
                <StarIcon size={24} color={score / deck.length === 1 ? C.yellow : C.slate + '20'} />
              </View>

              <TouchableOpacity style={S.finishBtn} onPress={handleBackStep} activeOpacity={0.8}>
                <Text style={S.finishBtnText}>Bumalik sa Listahan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={S.reviewBtn}
                onPress={() => {
                  handleAssessmentReview({
                    activityId,
                    score,
                    totalItems: deck.length,
                    percentage: Math.round((score / deck.length) * 100),
                    responses: responses,
                    completedAt: new Date().toISOString()
                  } as any);
                }}
                activeOpacity={0.8}
              >
                <Text style={S.reviewBtnText}>Tingnan ang Review</Text>
              </TouchableOpacity>
            </View>
          </BounceIn>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.root}>
      <BounceIn delay={60}>
        <View style={S.headerRow}>
          <TouchableOpacity onPress={handleBackStep} style={S.backBtn}>
            <View style={S.backArrow} />
          </TouchableOpacity>

          <Image
            source={require('../../../assets/images/cisckids copy.png')}
            style={S.logo}
            resizeMode="contain"
          />

          <View style={S.headerRight}>
            <Text style={S.progressPerc}>{Math.round(((currentCardIndex) / deck.length) * 100)}%</Text>
          </View>
        </View>
      </BounceIn>

      <View style={S.content}>
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopRight, { backgroundColor: C.mint }]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1, { opacity: 0.1 }]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6, { backgroundColor: C.teal }]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4, { opacity: 0.1 }]} />
        </View>

        <BounceIn key={currentCardIndex} delay={120}>
          <View style={S.stage}>
            {currentCard?.type === 'passage' ? (
              <View>
                <View style={readingStyles.passageContainer}>
                  <View style={readingStyles.clipContainer}>
                    <View style={[readingStyles.circleDecor, { backgroundColor: 'rgba(26,122,69,0.05)', top: -20, right: -20, width: 90, height: 90 }]} />
                  </View>
                  <ScrollView
                    style={readingStyles.passageScroll}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={readingStyles.textContainer}>
                      {(() => {
                        if (!isProcessed) {
                          return currentCard.text.split('\n').map((line: string, index: number) => (
                            <Text key={index} style={readingStyles.textLine}>{line}</Text>
                          ));
                        }

                        let absoluteWordIndex = 0;
                        return currentCard.text.split('\n').map((line: string, lineIndex: number) => {
                          const words = line.split(' ');
                          const renderedWords = words.map((word, wordIndex) => {
                            if (word === '') {
                              return <Text key={`space-${wordIndex}`}>{' '}</Text>;
                            }

                            const cleanWord = word.replace(/[^a-zA-ZñÑ0-9]/g, '');
                            let color = C.green; // Default to correct

                            if (cleanWord.length > 0) {
                              const miscue = miscues.find(m => m.position === absoluteWordIndex);
                              if (miscue) {
                                if (miscue.type === 'substitution' || miscue.type === 'repetition') {
                                  color = C.coral;
                                } else if (miscue.type === 'omission') {
                                  color = '#f39c12'; // orange
                                }
                              }
                              absoluteWordIndex++;
                            }

                            return (
                              <Text key={`word-${wordIndex}`} style={{ color }}>
                                {word}{wordIndex < words.length - 1 ? ' ' : ''}
                              </Text>
                            );
                          });

                          return (
                            <Text key={`line-${lineIndex}`} style={readingStyles.textLine}>
                              {renderedWords}
                            </Text>
                          );
                        });
                      })()}
                    </View>
                  </ScrollView>
                </View>
              </View>
            ) : (
              <PassageDisplay
                material={currentCard}
                type={currentCard?.type}
                spokenText={spokenText}
                isRecording={isRecording}
                isCompleted={isProcessed}
                isCorrect={isCorrect ?? true}
              />
            )}
          </View>
        </BounceIn>

        <View style={S.statusReserved}>
          {(isTranscribing || isRecording) && (
            <View style={S.miniStatus}>
              {isTranscribing ? <ActivityIndicator size="small" color={C.teal} /> : <View style={S.redDot} />}
              <Text style={S.miniStatusText}>{isTranscribing ? 'Pinoproseso...' : 'Nakikinig...'}</Text>
            </View>
          )}

          {isProcessed && (
            <BounceIn style={S.feedbackBox}>
              <View style={[S.feedbackIconBox, { backgroundColor: isCorrect ? C.green + '15' : C.coral + '15' }]}>
                {isCorrect ? (
                  <CheckCircleIcon size={32} color={C.green} />
                ) : (
                  <View style={S.maliCircle}><Text style={S.maliX}>✕</Text></View>
                )}
              </View>
              <Text style={[S.feedbackText, isCorrect ? S.correctLabel : S.wrongLabel]}>
                {isCorrect ? 'Napakahusay!' : 'Subukan Muli'}
              </Text>
            </BounceIn>
          )}

          {isProcessed && miscues.length > 0 && (
            <BounceIn delay={200} style={S.miscueReportContainer}>
              <Text style={S.miscueReportTitle}>Mga Uri ng Pagkakamali</Text>
              <View style={S.miscueTypesRow}>
                {(() => {
                  const typeCounts = {
                    omission: miscues.filter(m => m.type === 'omission').length,
                    substitution: miscues.filter(m => m.type === 'substitution').length,
                    insertion: miscues.filter(m => m.type === 'insertion').length,
                    repetition: miscues.filter(m => m.type === 'repetition').length,
                  };
                  return [
                    { type: 'omission', fil: 'Kaligtaan', color: C.orange, count: typeCounts.omission },
                    { type: 'substitution', fil: 'Pagpapalit', color: C.red, count: typeCounts.substitution },
                    { type: 'insertion', fil: 'Pagsingit', color: C.yellow, count: typeCounts.insertion },
                    { type: 'repetition', fil: 'Pag-uulit', color: C.teal, count: typeCounts.repetition },
                  ].map((m) => (
                    m.count > 0 ? (
                      <View key={m.type} style={[S.miscueTypeChip, { backgroundColor: m.color + '20', borderColor: m.color }]}>
                        <Text style={[S.miscueTypeChipText, { color: m.color }]}>
                          {m.fil} ({m.count})
                        </Text>
                      </View>
                    ) : null
                  ));
                })()}
              </View>
            </BounceIn>
          )}
        </View>
      </View>

      {/* Stable Footer Controls - Lifted to match Practice */}
      <View style={S.footer}>
        {!isProcessed ? (
          <RecordingControls
            isRecording={isRecording}
            isLoading={isTranscribing}
            hasPermission={hasPermission}
            onRecordToggle={handleRecordToggle}
          />
        ) : (
          <TouchableOpacity
            style={S.nextBtn}
            onPress={() => advanceCard(responses)}
            activeOpacity={0.8}
          >
            <Text style={S.nextBtnText}>
              {currentCardIndex < deck.length - 1 ? 'Susunod' : 'Tapusin'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
}



const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle
  },
  backArrow: {
    width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5,
    borderColor: C.ink, transform: [{ rotate: '-45deg' }]
  },
  logo: {
    width: 100,
    height: 90,
  },
  headerRight: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    ...Shadows.subtle
  },

  content: { flex: 1, justifyContent: 'flex-start', marginTop: 40, gap: 24 },
  stage: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },

  feedbackBox: { alignItems: 'center' },
  feedbackIconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  maliCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.coral, justifyContent: 'center', alignItems: 'center' },
  maliX: { color: C.white, fontSize: 16, fontWeight: '900' },
  feedbackText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  correctLabel: { color: C.green },
  wrongLabel: { color: C.coral },

  statusReserved: { height: 80, justifyContent: 'flex-start', alignItems: 'center', width: '100%' },
  miniStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  miniStatusText: { fontSize: 13, fontWeight: '700', color: C.slate, opacity: 0.8 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.coral },

  resultCard: {
    backgroundColor: C.white, borderRadius: 34, padding: 32,
    alignItems: 'center', width: '100%', ...Shadows.cardLift,
    paddingTop: 50,
  },
  resultHeader: {
    position: 'absolute', top: -30, width: 80, height: 80,
    borderRadius: 40, backgroundColor: C.white, justifyContent: 'center',
    alignItems: 'center', ...Shadows.cardLift
  },
  resultTitle: { fontSize: 28, fontWeight: '900', color: C.greenDeep, marginBottom: 8 },
  resultSub: { fontSize: 16, color: C.slate, fontWeight: '600', marginBottom: 30 },

  scoreBadgeRow: { alignItems: 'center', marginVertical: 20 },
  scoreMainBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.teal + '08',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24,
    borderWidth: 1, borderColor: C.teal + '20'
  },
  scoreBig: { fontSize: 44, fontWeight: '900', color: C.teal },
  scoreDivider: { width: 2, height: 30, backgroundColor: C.teal + '30', marginHorizontal: 15 },
  scoreTotal: { fontSize: 30, fontWeight: '800', color: C.slate },
  scoreLabel: { fontSize: 14, fontWeight: '800', color: C.slate, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },

  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 40, alignItems: 'center' },

  finishBtn: {
    backgroundColor: C.teal, paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 20, ...Shadows.button, width: '100%'
  },
  finishBtnText: { color: C.white, fontWeight: '900', fontSize: 16, textAlign: 'center' },

  reviewBtn: {
    marginTop: 12, paddingVertical: 14, width: '100%', alignItems: 'center'
  },
  reviewBtnText: { color: C.teal, fontWeight: '800', fontSize: 15 },

  nextBtn: {
    backgroundColor: C.teal,
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 20,
    ...Shadows.button,
    minWidth: 200,
    alignItems: 'center'
  },
  nextBtnText: {
    color: C.white,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5
  },

  miscueReportContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  miscueReportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.inkLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miscueTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  miscueTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  miscueTypeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

