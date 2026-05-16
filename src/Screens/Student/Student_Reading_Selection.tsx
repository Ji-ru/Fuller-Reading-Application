import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import { StudentColors as C, Radii, Shadows, ACCENT_COLORS as LETTER_COLORS } from '../../Utilities/Theme';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { 
  CheckCircleIcon, 
  BookOpenIcon, 
  QuoteIcon, 
  LockIcon 
} from '../../Components/GlobalUse/Icons';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import { useNavigationHelper } from '../../Controller/NavigationController';
import auth from '@react-native-firebase/auth';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { Alphabet, Contrasts, Passage, Word } from '../../Interfaces/passage';
import bubbles from '../../UI_Designs/BubblesDesign';

const { width: SW } = Dimensions.get('window');

// ─── Color Palette for Lessons (Shades of Blue) ────────────────────────────────
const BLUE_SHADES = [
  '#3d71d9', // Brand Royal Blue
  '#2a50a1', // Deep Blue
  '#154360', // Darkest Blue
  '#5989e5', // Lighter Royal
  '#2a82be', // Sky Deep
  '#1f618d', // Professional Slate Blue
];

// ─── Jumping Dots Loading ───────────────────────────────────────────────────
function DotsLoading() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -10, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,   duration: 400, useNativeDriver: true }),
          Animated.delay(800 - delay),
        ])
      );
    };
    Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ]).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 20 }}>
      <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3d71d9', transform: [{ translateY: dot1 }] }} />
      <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#5989e5', transform: [{ translateY: dot2 }] }} />
      <Animated.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3d71d9' + '40', transform: [{ translateY: dot3 }] }} />
    </View>
  );
}

// ─── Header Icons ────────────────────────────────────────────────────────────
function BackArrow({ color = C.ink }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const alphabetData: Alphabet[] = readingMaterialData?.Alphabet || [];
const passages: Passage[] = readingMaterialData?.Passages || [];
const wordsData: Word[] = readingMaterialData?.Words || [];

// ─── Word Card (grid version) ──────────────────────────────────────────────────
function WordCard({ 
  item, 
  index, 
  isMastered,
  accent,
  onPress 
}: { 
  item: string; 
  index: number; 
  isMastered: boolean;
  accent: string;
  onPress: (w: string) => void 
}) {
  const scale = useRef(new Animated.Value(1)).current;
  
  const cardWidth = (SW - 32 - 12) / 2; // 32 margins, 12 gap between two cards

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }),
    ]).start();
    onPress(item);
  };

  return (
    <BounceIn delay={index * 18}>
      <TouchableOpacity onPress={press} activeOpacity={0.85} style={{ marginBottom: 12 }}>
        <Animated.View style={[S.wordGridCard, { width: cardWidth, backgroundColor: accent, transform: [{ scale }] }]}>
          {/* Decorative shapes */}
          <View style={[S.heroCircle, { backgroundColor: 'rgba(255,255,255,0.15)', top: -10, right: -10, width: 40, height: 40 }]} />
          <View style={[S.heroCircle, { backgroundColor: 'rgba(255,255,255,0.08)', bottom: -5, left: -5, width: 30, height: 30 }]} />
          
          <View style={S.wordGridCardBody}>
             <Text 
               style={[S.wordGridText, { color: C.white }]} 
               numberOfLines={2} 
               adjustsFontSizeToFit 
               minimumFontScale={0.7}
             >
               {item}
             </Text>

             {isMastered && (
               <View style={[S.wordGridMastery, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                 <CheckCircleIcon size={14} color={C.white} />
               </View>
             )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Passage Card (modernized) ───────────────────────────────────────────────
function PassageCard({
  item,
  index,
  isMastered,
  accent,
  onPress,
}: {
  item: Passage;
  index: number;
  isMastered: boolean;
  accent: string;
  onPress: (p: Passage) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 7 }),
    ]).start();
    onPress(item);
  };

  return (
    <BounceIn delay={index * 36}>
      <TouchableOpacity onPress={press} activeOpacity={0.85}>
        <Animated.View style={[S.passageCard, { backgroundColor: accent, transform: [{ scale }], overflow: 'hidden' }]}>
          {/* Decorative shapes to match Hero */}
          <View style={[S.heroCircle, { backgroundColor: 'rgba(255,255,255,0.15)', top: -20, right: -20, width: 80, height: 80 }]} />
          <View style={[S.heroCircle, { backgroundColor: 'rgba(255,255,255,0.08)', bottom: -15, left: -15, width: 50, height: 50 }]} />

          <View style={S.passageCardInner}>
            <View style={{ flex: 1, paddingVertical: 4 }}>
              <Text style={[S.passageCardTitle, { color: C.white }]} numberOfLines={2}>{item.title}</Text>
              {!!item.author && <Text style={[S.passageCardAuthor, { color: 'rgba(255,255,255,0.7)' }]}>ni {item.author}</Text>}
            </View>
            <View style={[S.passageGoBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              {isMastered && (
                <CheckCircleIcon size={20} color={C.white} />
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </BounceIn>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PageSelectionScreen() {
  const { handleLogout, handleBackStep: navBackStep, handleReadingNext } = useNavigationHelper();

  const [logoutVisible, setLogoutVisible] = useState(false);

  const [selectedAralin, setSelectedAralin] = useState<number | null>(null);
  const [completedAlpha, setCompletedAlpha] = useState<Set<string>>(new Set());
  const [completedWordsMap, setCompletedWordsMap] = useState<Record<string, Set<string>>>({});
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lockModalVisible, setLockModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMastery = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const { completedAlpha: alpha, completedWords: words, completedPassages: passages } = 
            await MiscueReportController.getStudentDetailedCompletion(user.uid);
          if (isMounted) {
            setCompletedAlpha(alpha);
            setCompletedWordsMap(words);
            setCompletedPassages(passages);
          }
        }
      } catch (err) {
        console.error('Failed to fetch mastery:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMastery();
    return () => { isMounted = false; };
  }, []);

  const getTotalWordsForLetter = (letter: string) => {
    const subset = wordsData.filter(w => w.letter === letter);
    const allWords = subset.flatMap(w => w.contrasts.flatMap(c => c.words));
    const letterLower = letter.toLowerCase();
    const uniqueWords = Array.from(new Set(allWords)).filter(
      word => word.trim().toLowerCase() !== letterLower
    );
    return uniqueWords.length;
  };

  const handleCustomBack = () => {
    if (selectedAralin !== null) {
      setSelectedAralin(null);
    } else {
      navBackStep();
    }
  };

  const isLessonMastered = (idx: number) => {
    if (idx < 0) return true;
    const item = alphabetData[idx];
    if (!item) return false;
    const letter = item.letter;
    const isAlphaDone = completedAlpha.has(letter);
    const totalWords = getTotalWordsForLetter(letter);
    const completedWordsCount = completedWordsMap[letter]?.size || 0;
    return isAlphaDone && (totalWords === 0 || completedWordsCount >= totalWords);
  };

  const handleLessonSelect = (index: number) => {
    setSelectedAralin(index);
  };

  const handleAlphabetSelect = (alphabet: Alphabet) => {
    const items = [alphabet];
    handleReadingNext(alphabet, 'alphabet', items, 0);
  };

  const handleWordSelect = (wordText: string) => {
    if (!currentLetterInfo) return;
    
    const allAralinWords: Word[] = [];
    currentWordsData.forEach(w => {
      w.contrasts.forEach(c => {
        c.words.forEach(word => {
          if (word.trim().toLowerCase() !== currentLetterInfo.letter.toLowerCase()) {
            allAralinWords.push({
              letter: w.letter,
              contrasts: [{ ...c, words: [word] }]
            });
          }
        });
      });
    });

    const index = allAralinWords.findIndex(w => 
      w.contrasts[0].words[0].trim().toLowerCase() === wordText.trim().toLowerCase()
    );

    if (index !== -1) {
      handleReadingNext(allAralinWords[index], 'word', allAralinWords, index);
    }
  };

  const handlePassageSelect = (passage: Passage) => {
    const index = currentPassages.findIndex(p => p.title === passage.title);
    handleReadingNext(passage, 'passage', currentPassages, index);
  };

  const currentLetterInfo = selectedAralin !== null ? alphabetData[selectedAralin] : null;
  const currentWordsData = currentLetterInfo ? wordsData.filter(w => w.letter === currentLetterInfo.letter) : [];
  const currentPassages = currentLetterInfo ? passages.filter(p => p.aralin === (selectedAralin ?? 0) + 1) : [];

  const prepareWordsData = useMemo(() => {
    if (!currentLetterInfo) return [];
    const letterLower = currentLetterInfo.letter.toLowerCase();
    return currentWordsData.map((w: Word) => {
      const allWords = w.contrasts.flatMap((c: Contrasts) => c.words);
      const filtered = Array.from(new Set(allWords)).filter(
        word => word.trim().toLowerCase() !== letterLower,
      );
      return { title: w.letter, data: filtered };
    }).filter(sec => sec.data.length > 0);
  }, [currentWordsData, currentLetterInfo]);

  const lessonAccent = selectedAralin !== null ? BLUE_SHADES[selectedAralin % BLUE_SHADES.length] : C.green;

  const aralinProgress = useMemo(() => {
    if (selectedAralin === null || !currentLetterInfo) return 0;
    
    const letter = currentLetterInfo.letter;
    const isAlphaDone = completedAlpha.has(letter) ? 1 : 0;
    const wordCount = completedWordsMap[letter]?.size || 0;
    const totalWords = getTotalWordsForLetter(letter);
    const passageCount = currentPassages.filter(p => completedPassages.has(p.title)).length;
    const totalPassages = currentPassages.length;

    const total = 1 + totalWords + totalPassages;
    const masteredCapped = isAlphaDone + Math.min(wordCount, totalWords) + Math.min(passageCount, totalPassages);
    
    return total > 0 ? Math.min(masteredCapped / total, 1) : 0;
  }, [selectedAralin, currentLetterInfo, completedAlpha, completedWordsMap, completedPassages, currentPassages]);

  const progressPercent = Math.min(Math.round(aralinProgress * 100), 100);

  const renderLessonTile = ({ item, index }: { item: Alphabet; index: number }) => {
    const isAlphaDone = completedAlpha.has(item.letter);
    const completedWordsCount = completedWordsMap[item.letter]?.size || 0;
    const totalWordsCount = getTotalWordsForLetter(item.letter);
    
    const isFullyMastered = isAlphaDone && (totalWordsCount === 0 || completedWordsCount >= totalWordsCount);
    const isLocked = false;
    const bg = isLocked ? '#dfe6e9' : BLUE_SHADES[index % BLUE_SHADES.length];

    return (
      <View style={S.lessonTileWrapper}>
        <BounceIn delay={index * 21}>
          <TouchableOpacity
            onPress={() => handleLessonSelect(index)}
            activeOpacity={isLocked ? 1 : 0.8}
            style={[S.lessonTile, { backgroundColor: bg, opacity: isLocked ? 0.7 : 1 }]}
          >
            {!isLocked && (
              <>
                <View style={S.tileShine} />
                <View style={S.tileShine2} />
              </>
            )}

            {isFullyMastered && !isLocked && (
              <View style={S.masteredBadge}>
                <CheckCircleIcon size={16} color="#fff" />
              </View>
            )}

            {isLocked && (
              <View style={S.lockWrapper}>
                <LockIcon size={32} color={C.slate} />
              </View>
            )}

            <Text style={[S.tileLetter, { color: isLocked ? C.slate : C.white }]}>{item.letter}</Text>

            <View style={[S.tileIndicator, { backgroundColor: isLocked ? C.slate + '22' : 'rgba(255,255,255,0.25)' }]}>
              <Text style={[S.tileIndicatorText, { color: isLocked ? C.slate : C.white }]}>Aralin {index + 1}</Text>
            </View>
          </TouchableOpacity>
        </BounceIn>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.root} edges={['top', 'bottom']}>
      <View style={S.bg}>
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
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

        <View style={{ zIndex: 100 }}>
          <View style={S.headerBar}>
            <TouchableOpacity style={S.headerMenuBtn} onPress={handleCustomBack} activeOpacity={0.7}>
              <BackArrow />
            </TouchableOpacity>
            <Image style={S.headerLogo} source={require('../../../assets/images/cisckids copy.png')} resizeMode="contain" />
            <View style={{ width: 44 }} />
          </View>
        </View>

        <View style={S.contentArea}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <DotsLoading />
              <Text style={{ fontSize: 16, color: C.inkLight, fontWeight: '600', marginTop: 10 }}>Ang mga Aralin...</Text>
            </View>
          ) : selectedAralin === null ? (
            <>
              <BounceIn delay={24}>
                <View style={S.heroBanner}>
                  {/* Decorative background shapes */}
                  <View style={[S.heroCircle, { backgroundColor: C.green + '12', top: -30, right: -40, width: 140, height: 140 }]} />
                  <View style={[S.heroCircle, { backgroundColor: C.green + '06', bottom: -20, left: -20, width: 90, height: 90 }]} />
                  
                  <View style={S.heroText}>
                    <Text style={S.heroSub}>Nabuksan na</Text>
                    <Text style={S.heroTitle}>MGA ARALIN</Text>
                    <View style={S.heroLine} />
                  </View>
                  <Image style={S.heroImage} source={require('../../../assets/images/Abc-Reading.png')} />
                </View>
              </BounceIn>

              <FlatList
                data={alphabetData}
                renderItem={renderLessonTile}
                keyExtractor={item => item.letter}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
              />
            </>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={{ paddingHorizontal: 4, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.slate }}>Lesson Progress</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: lessonAccent }}>{progressPercent}%</Text>
                </View>
                <View style={{ height: 6, backgroundColor: C.greenLight + '30', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: lessonAccent, borderRadius: 3 }} />
                </View>
              </View>

              <FlatList
                data={[]}
                renderItem={() => null}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 48 }}
                ListHeaderComponent={
                  <View>
                    <BounceIn delay={24}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => currentLetterInfo && handleAlphabetSelect(currentLetterInfo)}
                        style={[S.lessonHeroCard, { backgroundColor: lessonAccent }]}
                      >
                        <View style={[S.heroCircle, { backgroundColor: 'rgba(255,255,255,0.10)', top: -20, right: -20, width: 100, height: 100 }]} />
                        <View style={[S.heroCircle, { backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -10, width: 80, height: 80 }]} />

                        <View style={S.lessonHeroInner}>
                          <View style={{ flex: 1 }}>
                            <Text style={S.lessonHeroLetter}>
                              {currentLetterInfo?.letter}
                            </Text>
                            <Text style={S.lessonHeroTapHint}>I-tap para bigkasin</Text>
                          </View>
                          
                          <View style={S.lessonHeroLetterBig}>
                            {currentLetterInfo && completedAlpha.has(currentLetterInfo.letter) && (
                               <CheckCircleIcon size={48} color={C.white} />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </BounceIn>

                    {prepareWordsData.length > 0 && (
                      <BounceIn delay={60}>
                        <View style={S.sectionWrap}>
                          <View style={S.sectionHeaderRow}>
                            <View style={[S.wordBubble, { backgroundColor: lessonAccent + '15', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }]}>
                               <QuoteIcon size={16} color={lessonAccent} />
                            </View>
                            <Text style={S.sectionTitle}>Mga Salita</Text>
                            <View style={S.sectionLine} />
                          </View>
                          
                          <View style={S.wordGridContainer}>
                            {prepareWordsData[0].data.map((wordText, i) => (
                              <WordCard
                                key={`${wordText}-${i}`}
                                item={wordText}
                                index={i}
                                isMastered={currentLetterInfo ? !!completedWordsMap[currentLetterInfo.letter]?.has(wordText) : false}
                                accent={lessonAccent}
                                onPress={(w) => handleWordSelect(w)}
                              />
                            ))}
                          </View>
                        </View>
                      </BounceIn>
                    )}

                    {currentPassages.length > 0 && (
                      <BounceIn delay={84}>
                        <View style={S.sectionWrap}>
                          <View style={S.sectionHeaderRow}>
                            <View style={[S.passageEmojiBubble, { backgroundColor: lessonAccent + '15', width: 32, height: 32 }]}>
                               <BookOpenIcon size={16} color={lessonAccent} />
                            </View>
                            <Text style={S.sectionTitle}>Mga Talata</Text>
                            <View style={S.sectionLine} />
                          </View>
                          {currentPassages.map((p, i) => (
                            <PassageCard
                              key={`passage-${i}`}
                              item={p}
                              index={i}
                              isMastered={completedPassages.has(p.title)}
                              accent={lessonAccent}
                              onPress={handlePassageSelect}
                            />
                          ))}
                        </View>
                      </BounceIn>
                    )}
                  </View>
                }
              />
            </View>
          )}
        </View>
      </View>

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => { setLogoutVisible(false); await handleLogout(); }}
      />

      <LockedLessonModal
        visible={lockModalVisible}
        onClose={() => setLockModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Locked Modal ────────────────────────────────────────────────────────────
function LockedLessonModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={S.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View style={[S.lockModalContent, { opacity: fade, transform: [{ translateY: slide }] }]}>
           <View style={S.lockModalIconBox}>
             <LockIcon size={48} color={C.green} />
           </View>
           
           <Text style={S.lockModalTitle}>Naka-lock ang Aralin</Text>
           <Text style={S.lockModalDesc}>
             Kailangan mo munang tapusin ang nakaraang Aralin bago mo ito mabuksan.
           </Text>
           
           <TouchableOpacity 
             style={S.lockModalBtn} 
             onPress={onClose} 
             activeOpacity={0.8}
           >
             <Text style={S.lockModalBtnText}>Naintindihan ko</Text>
           </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1, backgroundColor: C.bg },
  headerBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    zIndex: 100 
  },
  headerLogo: { width: 100, height: 90 },

  headerMenuBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center', ...Shadows.subtle,
  },

  // ── Hero Banner ────────────────────────────────────────────────────────
  heroBanner: {
    backgroundColor: C.white, borderRadius: Radii.xl,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20,
    ...Shadows.cardLift, overflow: 'hidden',
    marginBottom: 10,
    position: 'relative'
  },
  heroText:  { flex: 1, zIndex: 2 },
  heroSub:   { fontSize: 13, color: C.slate, fontWeight: '700', marginBottom: 2, opacity: 0.7 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.greenDeep, lineHeight: 32 },
  heroLine:  { height: 4, width: 40, backgroundColor: C.green, marginTop: 8, borderRadius: 2 },
  heroHint:  { fontSize: 12, color: C.slate, marginTop: 6 },
  heroImage: { width: 95, height: 95, resizeMode: 'contain', zIndex: 2 },

  contentArea: { flex: 1, marginHorizontal: 16, marginTop: 0 },


  // ── Lesson Grid Tiles ──────────────────────────────────────────────────
  lessonTileWrapper: { width: (SW - 48) / 3, marginBottom: 14 },
  lessonTile: {
    width: '100%',
    aspectRatio: 0.95,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  tileShine: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  tileShine2: {
    position: 'absolute',
    top: 14,
    right: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  tileLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: C.white,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tileIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  tileIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  masteredBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockWrapper: {
    position: 'absolute', top: '25%', alignSelf: 'center', opacity: 0.5,
  },

  // ── Lesson Detail – Hero Card ──────────────────────────────────────────
  lessonHeroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadows.cardLift,
  },
  heroCircle: { position: 'absolute', borderRadius: 999 },
  lessonHeroInner: { flexDirection: 'row', alignItems: 'center' },
  lessonHeroLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  lessonHeroLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: C.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    lineHeight: 56,
  },
  lessonHeroTapHint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.70)',
    marginTop: 6,
  },
  lessonHeroLetterBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  lessonHeroLetterShadow: {
    fontSize: 42,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.35)',
  },

  // ── Section Wrapper ────────────────────────────────────────────────────
  sectionWrap: { marginBottom: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: 0.3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.greenLight,
    marginLeft: 6,
  },

  // ── Word Cards ─────────────────────────────────────────────────────────
  wordCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 10,
    ...Shadows.card,
    overflow: 'hidden',
  },
  wordAccentLine: { height: 3, width: '100%' },
  wordCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  wordBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCardText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: 0.2,
  },
  wordGoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordGoBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },

  // ── Passage Cards ──────────────────────────────────────────────────────
  passageCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    marginBottom: 16,
    ...Shadows.cardLift,
    overflow: 'hidden',
  },
  passageCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  passageEmojiBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passageCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
    lineHeight: 26,
  },
  passageCardAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: C.slate,
    marginTop: 4,
  },
  passageGoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── (kept for backwards compat, used by AlphabetTile inside detail) ─
  alphaTile: {
    width: (SW - 60) / 3,
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  alphaTileShine: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  alphaTileLetter: {
    fontSize: 34,
    fontWeight: '900',
    color: C.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // ── Word Grid Layout ───────────────────────────────────────────────────
  wordGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  wordGridCard: {
    borderRadius: 20,
    aspectRatio: 1.8,
    ...Shadows.cardLift,
    position: 'relative',
    overflow: 'hidden',
  },

  wordGridCardBody: {
    padding: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordGridText: {
    fontSize: 24,
    fontWeight: '900',
    color: C.ink,
    textAlign: 'center',
  },
  wordGridMastery: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Legacy / kept for sub-components ───────────────────────────────────
  sublabel: { fontSize: 16, fontWeight: '800', color: C.inkLight },

  // ── Lock Modal Styles ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockModalContent: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    ...Shadows.cardLift,
  },
  lockModalIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.green + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  lockModalDesc: {
    fontSize: 15,
    color: C.slate,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  lockModalBtn: {
    width: '100%',
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadows.card,
  },
  lockModalBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },
});

