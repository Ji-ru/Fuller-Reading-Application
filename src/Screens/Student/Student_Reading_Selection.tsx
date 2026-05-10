import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial_new.json';
import selection from '../../UI_Designs/PassageSelectionStyles';
import { Alphabet, Passage, Word } from '../../Interfaces/passage';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useStudentCompletedAlphabet, useStudentCompletedWord } from '../../Hooks/Student/use_StudentCompletedReading';
import { getAuth } from '@react-native-firebase/auth';
import { WordContext } from '../../Interfaces/dataInterfaces';
import Svg, { Text as SvgText } from 'react-native-svg';
import { getPassageImage } from '../../Utilities/ReadingAssets';

const currentStudentId = getAuth().currentUser?.uid ?? '';
const { width: SW } = Dimensions.get('window');

const C = {
  ink: '#1b2e23',
  white: '#ffffff',
  coral: '#e74c3c',
  green: '#2ca96a',
  darkBlue: '#163F6C',
  slate: '#9CA3AF',
  inkLight: '#6B7280',
};

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  menuBtn: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  aboutIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#909090'},
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2
  },
  dropdown: {
    position: 'absolute', top: 72, right: 20,
    backgroundColor: C.white, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 12, elevation: 10,
    minWidth: 160, zIndex: 1000, paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownIcon: { width: 20, height: 20, marginRight: 12, tintColor: C.coral },
  dropdownText: { fontSize: 15, fontFamily: 'Andika-Bold', color: C.coral },
});

// ─── BounceIn ─────────────────────────────────────────────────────────────────
function BounceIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      {children}
    </Animated.View>
  );
}

// ─── Floating image ───────────────────────────────────────────────────────────
function FloatingImage({ source, style }: { source: any; style: any }) {
  const floatY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.Image
      source={source}
      style={[style, { transform: [{ translateY: floatY }] }]}
      resizeMode="contain"
    />
  );
}

const greetStyles = StyleSheet.create({
  greetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    paddingLeft: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    overflow: 'hidden',
  },
  greetLeft: { flex: 1 },
  greetTime: {
    fontSize: SW * 0.028,
    fontFamily: 'Andika-Bold',
    color: '#3B7FC9',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  greetName: {
    fontSize: SW * 0.075,
    fontFamily: 'Andika-Bold',
    color: C.ink,
    lineHeight: SW * 0.085,
    marginBottom: 4,
  },
  greetSub: {
    fontSize: SW * 0.03,
    fontFamily: 'Andika-Regular',
    color: C.slate,
    lineHeight: SW * 0.04,
    maxWidth: SW * 0.45,
  },
  greetImage: {
    width: SW * 0.25,
    height: SW * 0.25,
    marginRight: 20,
  },
});

// ─── FadeSlideIn ──────────────────────────────────────────────────────────────
function FadeSlideIn({
  children,
  delay = 0,
  direction = 'up',
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  style?: any;
}) {
  const offset = direction === 'up' ? 30 : direction === 'down' ? -30 : direction === 'left' ? 30 : -30;
  const translateVal = useRef(new Animated.Value(offset)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateVal, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const isH = direction === 'left' || direction === 'right';
  return (
    <Animated.View style={[{ transform: [isH ? { translateX: translateVal } : { translateY: translateVal }], opacity }, style]}>
      {children}
    </Animated.View>
  );
}

const alphabetData = readingMaterialData?.Alphabet || [];
const passages = readingMaterialData?.Passages || [];

// New structure: Words[0].chapters[]
const wordsContainer = readingMaterialData?.Words?.[0];
const chapters = wordsContainer?.chapters || [];

// Shared vibrant color palette – used across alphabet tiles, passage cards, etc.
export const READING_COLORS = [
  '#4DC97A', // green
  '#5BC8D6', // teal
  '#4A9EE0', // blue
  '#F5C842', // yellow
  '#F08C3A', // orange
  '#E84E4E', // red
  '#9B59E8', // purple
  '#E84E99', // pink
  '#5BC8D6', // teal
  '#4DC97A', // green
  '#F5C842', // yellow
  '#4A9EE0', // blue
  '#F08C3A', // orange
  '#9B59E8', // purple
  '#E84E4E', // red
  '#E84E99', // pink
  '#4DC97A', // green
  '#F5C842', // yellow
  '#5BC8D6', // teal
  '#E84E4E', // red
  '#4A9EE0', // blue
  '#9B59E8', // purple
  '#F08C3A', // orange
  '#4DC97A', // green
  '#E84E99', // pink
  '#5BC8D6', // teal
];

export default function PageSelectionScreen() {
  const { handleLogout, handleBackStep, handleReadingNext, handleNextStep } = useNavigationHelper();

  const completedAlphabets = useStudentCompletedAlphabet(currentStudentId);
  const isAlphabetCompleted = (letter: string) => completedAlphabets.some(a => a.letter === letter);

  const completedWords = useStudentCompletedWord(currentStudentId);
  const normalize = (value: string) => value.trim().toLowerCase();
  const isWordCompleted = (word: string) => completedWords.some(a => normalize(a.word) === normalize(word));

  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'alphabet' | 'passage' | 'word'>('alphabet');
  const [logoutVisible, setLogoutVisible] = useState(false);

  // New state for chapter selection
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogoout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleAlphabetSelect = (alphabet: Alphabet) => {
    handleReadingNext(alphabet, 'alphabet');
  };

  // Updated word selection – find the lesson containing the word
  const handleWordSelect = (wordText: string, lesson: any, chapter: any) => {
    const wordData: Word = {
      letter: lesson.letter || '?',
      contrasts: [
        {
          phoneme: lesson.title,  // display only
          ipa: '',
          words: [wordText],
        },
      ],
    };

    const wordContext: WordContext = {
      chapterId: Number(chapter.chapter_id),
      chapterTitle: String(chapter.title),
      lessonId: Number(lesson.lesson_id),
      lessonTitle: String(lesson.title),
      targetWord: wordText,
    };

    handleReadingNext(wordData, 'word', wordContext);
  };

  const handleChapterSelect = (chapter: any) => {
    setSelectedChapter(chapter);
  };

  const handleBackToChapters = () => {
    setSelectedChapter(null);
  };

  const handlePassageSelect = (passage: Passage) => {
    handleReadingNext(passage, 'passage');
  };

  // Color palette is defined at module level as READING_COLORS (reusable)

  const renderAlphabetItem = ({ item, index }: { item: Alphabet; index: number }) => {
    const bgColor = READING_COLORS[index % READING_COLORS.length];
    const completed = isAlphabetCompleted(item.letter);
  
    return (
      <FadeSlideIn delay={60 + index * 25} style={{ width: '23%' }}>
        <TouchableOpacity
          style={[selection.alphabetItem, { backgroundColor: bgColor, width: '100%' }]}
          onPress={() => handleAlphabetSelect(item)}
          activeOpacity={0.78}
        >
          {/* Gloss dot */}
          <View style={selection.alphabetHighlightDot} />
  
          {/* Uppercase + lowercase side by side, baseline-aligned */}
          <View style={selection.alphabetContainer}>
            <Text
              style={selection.alphabetLetter}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {item.letter.toUpperCase()}
            </Text>
            <Text
              style={selection.alphabetLetterSmall}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {item.letter.toLowerCase()}
            </Text>
          </View>
  
          {/* Completed badge — top-right */}
          {completed && (
            <View style={selection.completedBadge}>
              <Text style={selection.completedCheckmark}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </FadeSlideIn>
    );
  };

  // --- CHAPTER CARD (Step 1) – reuses letterCard styles ---
  const renderChapterCard = ({ item, index }: { item: any; index: number }) => {
    const totalLessons = item.lessons?.length || 0;
    const totalWords = item.lessons?.reduce((sum: number, l: any) => sum + (l.words?.length || 0), 0) || 0;
    const completedCount = item.lessons?.reduce((sum: number, l: any) => {
      return sum + (l.words?.filter((word: string) => isWordCompleted(word)).length || 0);
    }, 0) || 0;

    return (
      <FadeSlideIn delay={80 + (index ?? 0) * 60}>
        <TouchableOpacity
          style={selection.letterCard}
          onPress={() => handleChapterSelect(item)}
          activeOpacity={0.7}
        >
          <View style={selection.letterCardContent}>
            {/* Chapter icon (using book emoji, can be replaced with any icon) */}
            <View style={selection.letterIconContainer}>
              <Text style={selection.letterIconText}>📙</Text>
            </View>

            {/* Chapter info */}
            <View style={selection.letterInfo}>
              <Text style={selection.letterTitle}>{item.title}</Text>
              <Text style={selection.letterSubtitle}>
                {totalLessons} lesson{totalLessons !== 1 ? 's' : ''} · {totalWords} words
              </Text>
              {completedCount > 0 && (
                <Text style={selection.letterProgress}>
                  {completedCount}/{totalWords} completed
                </Text>
              )}
            </View>

            {/* Arrow */}
            <View style={selection.letterArrowContainer}>
              <Text style={selection.letterArrow}>›</Text>
            </View>
          </View>
        </TouchableOpacity>
      </FadeSlideIn>
    );
  };

  // --- WORD BUBBLE (inside a lesson) ---
  const renderWordInLesson = (word: string, index: number, lesson: any) => {
    const completed = isWordCompleted(word);
    return (
      <TouchableOpacity
        key={`${word}-${index}`}
        style={[selection.wordBubble, completed && selection.wordBubbleCompleted]}
        onPress={() => handleWordSelect(word, lesson, selectedChapter)}
        activeOpacity={0.7}
      >
        <Text style={[
          selection.wordBubbleText,
          completed && selection.wordBubbleTextCompleted,
          { fontFamily: 'Andika-Bold' }
        ]}>
          {word}
        </Text>
        {completed && (
          <View style={selection.wordCompletedBadge}>
            <Text style={selection.wordCompletedCheck}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --- LESSON CARD (Step 2) – reuses phonemeSection styles ---
  const renderLesson = (lesson: any, index: number) => {
    const words = lesson.words || [];
    if (words.length === 0) return null;

    return (
      <FadeSlideIn key={`${lesson.lesson_id}-${index}`} delay={100 + index * 80}>
        <View style={selection.phonemeSection}>
          <View style={selection.phonemHeader}>
            <View style={selection.phonemeIconContainer}>
              <Text style={selection.phonemeIcon}>📖</Text>
            </View>
            <View style={selection.phonemeInfo}>
              <Text style={selection.phonemeTitle}>{lesson.title}</Text>
              <Text style={selection.phonemeIPA}>{words.length} words</Text>
            </View>
          </View>

          <View style={selection.wordsGrid}>
            {words.map((word: string, idx: number) => renderWordInLesson(word, idx, lesson))}
          </View>
        </View>
      </FadeSlideIn>
    );
  };

  const renderPassageItem = ({ item, index }: { item: Passage; index: number }) => {
    const accentColor = READING_COLORS[index % READING_COLORS.length];
    return (
      <FadeSlideIn delay={60 + index * 60}>
        <View style={selection.itemWrapper}>
          <TouchableOpacity
            style={selection.item}
            onPress={() => handlePassageSelect(item)}
            activeOpacity={0.8}
          >
            {/* Colored accent bar on the left edge */}
            <View style={selection.passageAccentBar} />
            <View style={selection.insidePassageListContainer}>
              <Image
                style={selection.readingImage}
                source={getPassageImage(item.image)}
              />
              <View style={selection.titleAuthorWrapper}>
                <Text style={selection.title}>{item.title}</Text>
                <Text style={selection.author}>By {item.author}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </FadeSlideIn>
    );
  };

  return (
    <SafeAreaView style={selection.container}>
      <View style={selection.insideContainer}>
        <BubbleBackground />

        {/* Header – unchanged */}
        {/* Header */}
        <View style={{ zIndex: 100 }}>
          <View style={upperNav.header}>
            <TouchableOpacity style={headerStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
              <Text style={headerStyles.backArrowText}>‹</Text>
            </TouchableOpacity>
            <Svg height={60} width={220}>
              <SvgText
                x={110}                 // center X
                y={35}                  // baseline Y
                fontSize={23}
                fontFamily="Andika-Bold"
                textAnchor="middle"     // center align
                fill="none"          // inside color
                stroke="#E8F5E9"        // outline color
                strokeWidth={8}         // outline thickness
                strokeLinejoin='round'
              >
                Reading Materials
              </SvgText>
              <SvgText
                x={110}
                y={35}
                fontSize={23}
                fontFamily="Andika-Bold"
                textAnchor="middle"
                fill="#1B5E20"
              >
                Reading Materials
              </SvgText>
            </Svg>
            <TouchableOpacity style={headerStyles.menuBtn} onPress={toggleMenu} activeOpacity={0.7}>
              <MenuBars />
            </TouchableOpacity>
          </View>
        </View>

        {menuVisible && (
          <View style={headerStyles.dropdown}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                handleNextStep('About');
              }}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/icons8-info-50.png')}
                style={headerStyles.aboutIcon}
              />
              <Text style={upperNav.aboutText}>About</Text>
            </TouchableOpacity>

            <View style={upperNav.divider} />

            <TouchableOpacity onPress={handleLogoutPress} style={headerStyles.dropdownItem} activeOpacity={0.75}>
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={headerStyles.dropdownIcon}
              />
              <Text style={headerStyles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}
        {/* 
        <BounceIn delay={40}>
          <View style={greetStyles.greetCard}>
            <View style={greetStyles.greetLeft}>
              <Text style={greetStyles.greetTime}>LET THE READING</Text>
              <Text style={greetStyles.greetName}>BEGIN!</Text>
              <Text style={greetStyles.greetSub}>
                Explore fun chapters, words, and passages!
              </Text>
            </View>

            <FloatingImage
              source={require('../../../assets/images/Abc-Reading.png')}
              style={greetStyles.greetImage}
            />
          </View>
        </BounceIn> */}

        {/* Tabs – unchanged */}
        <View style={selection.tabContainer}>
          <TouchableOpacity
            style={[selection.tab, activeTab === 'alphabet' && selection.activeTab]}
            onPress={() => {
              setActiveTab('alphabet');
              setSelectedChapter(null);
            }}
          >
            <Text style={[selection.tabText, activeTab === 'alphabet' && selection.activeTabText]}>
              Alphabet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[selection.tab, activeTab === 'word' && selection.activeTab]}
            onPress={() => {
              setActiveTab('word');
              setSelectedChapter(null);
            }}
          >
            <Text style={[selection.tabText, activeTab === 'word' && selection.activeTabText]}>
              Words
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[selection.tab, activeTab === 'passage' && selection.activeTab]}
            onPress={() => {
              setActiveTab('passage');
              setSelectedChapter(null);
            }}
          >
            <Text style={[selection.tabText, activeTab === 'passage' && selection.activeTabText]}>
              Passages
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={selection.contentContainer}>
          {activeTab === 'alphabet' && (
            <>
              <FadeSlideIn delay={40}>
                <Text style={selection.sublabel}>Select a letter to read:</Text>
              </FadeSlideIn>
              <FlatList
                data={alphabetData}
                renderItem={renderAlphabetItem}
                keyExtractor={item => item.letter}
                numColumns={4}
                columnWrapperStyle={selection.alphabetRow}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={selection.alphabetListContainer}
              />
            </>
          )}

          {/* WORDS TAB – new chapter/lesson navigation */}
          {activeTab === 'word' && (
            <View style={selection.wordSelectionContainer}>
              {!selectedChapter ? (
                <>
                  <FadeSlideIn delay={40}>
                    <Text style={selection.sublabel}>Choose a chapter and lesson to read:</Text>
                  </FadeSlideIn>
                  <FlatList
                    data={chapters}
                    renderItem={renderChapterCard}
                    keyExtractor={item => item.chapter_id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={selection.letterListContainer}
                  />
                </>
              ) : (
                <>
                  <FadeSlideIn delay={40} direction="left">
                    <View style={selection.combinedHeaderRow}>
                      <TouchableOpacity
                        style={selection.combinedBackBtn}
                        onPress={handleBackToChapters}
                        activeOpacity={0.7}
                      >
                        <Text style={selection.combinedBackArrow}>‹</Text>
                      </TouchableOpacity>

                      <View style={selection.combinedTitleCol}>
                        <Text style={selection.combinedTitle} numberOfLines={2}>
                          {selectedChapter.title}
                        </Text>
                        <Text style={selection.combinedSubtitle}>
                          {selectedChapter.lessons?.length || 0} lesson(s)
                        </Text>
                      </View>
                    </View>
                  </FadeSlideIn>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={selection.phonemeListContainer}
                  >
                    {(selectedChapter.lessons || []).map((lesson: any, idx: number) =>
                      renderLesson(lesson, idx)
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          )}

          {activeTab === 'passage' && (
            <View style={selection.passageListContainer}>
              <FadeSlideIn delay={40}>
                <Text style={selection.sublabel}>Select a passage to read:</Text>
              </FadeSlideIn>
              {passages.length > 0 ? (
                <FlatList
                  data={passages}
                  renderItem={renderPassageItem}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <Text>No passages available</Text>
              )}
            </View>
          )}
        </View>

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogoout}
        />
      </View>
    </SafeAreaView>
  );
}