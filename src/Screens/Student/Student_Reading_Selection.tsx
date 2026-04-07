import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
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

const alphabetData = readingMaterialData?.Alphabet || [];
const passages = readingMaterialData?.Passages || [];

// New structure: Words[0].chapters[]
const wordsContainer = readingMaterialData?.Words?.[0];
const chapters = wordsContainer?.chapters || [];

export default function PageSelectionScreen() {
  const { handleLogout, handleBackStep, handleReadingNext } = useNavigationHelper();

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
      targetWord: String(lesson.targetWord),
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

  const renderAlphabetItem = ({ item }: { item: Alphabet }) => (
    <TouchableOpacity
      style={[
        selection.alphabetItem,
      ]}
      onPress={() => handleAlphabetSelect(item)}
    >
      <View style={selection.alphabetContainer}>
        <Text style={selection.alphabetLetter}>{item.letter}</Text>
        {/* Completed badge removed – completion is indicated by background color */}
      </View>
    </TouchableOpacity>
  );

  // --- CHAPTER CARD (Step 1) – reuses letterCard styles ---
  const renderChapterCard = ({ item }: { item: any }) => {
    const totalLessons = item.lessons?.length || 0;
    const totalWords = item.lessons?.reduce((sum: number, l: any) => sum + (l.words?.length || 0), 0) || 0;
    const completedCount = item.lessons?.reduce((sum: number, l: any) => {
      return sum + (l.words?.filter((word: string) => isWordCompleted(word)).length || 0);
    }, 0) || 0;

    return (
      <TouchableOpacity
        style={selection.letterCard}
        onPress={() => handleChapterSelect(item)}
        activeOpacity={0.7}
      >
        <View style={selection.letterCardContent}>
          {/* Chapter icon (using book emoji, can be replaced with any icon) */}
          <View style={selection.letterIconContainer}>
            <Text style={selection.letterIconText}>📘</Text>
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
            <Text style={selection.letterArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
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
      <View key={`${lesson.lesson_id}-${index}`} style={selection.phonemeSection}>
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
    );
  };

  const renderPassageItem = ({ item }: { item: Passage }) => (
    <View style={selection.itemWrapper}>
      <TouchableOpacity
        style={selection.item}
        onPress={() => handlePassageSelect(item)}
      >
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
  );

  return (
    <SafeAreaView style={selection.container}>
      <View style={selection.insideContainer}>
        <BubbleBackground />

        {/* Header – unchanged */}
        <View>
          <View style={upperNav.header}>
            <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
              <Image
                source={require('../../../assets/icons/BackButton-icon.png')}
                style={upperNav.backButtonIcon}
              />
            </TouchableOpacity>
            {/* <Text style={selection.label}>Reading Materials</Text> */}
            <Svg height={60} width={220}>
              <SvgText
                x={110}                 // center X
                y={35}                  // baseline Y
                fontSize={23}
                fontFamily="DynaPuff-Bold"
                textAnchor="middle"     // center align
                fill="none"          // inside color
                stroke="#D7E9FF"        // outline color
                strokeWidth={8}         // outline thickness
                strokeLinejoin='round'
              >
                Reading Materials
              </SvgText>
              <SvgText
                x={110}
                y={35}
                fontSize={23}
                fontFamily="DynaPuff-Bold"
                textAnchor="middle"
                fill="#3B7FC9"
              >
                Reading Materials
              </SvgText>
            </Svg>
            <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
              <Image
                style={upperNav.menuIcon}
                source={require('../../../assets/icons/Menu-icon.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity onPress={handleLogoutPress} style={upperNav.logoutButton}>
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
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

        <View style={selection.image_text_container}>
          <Image
            style={selection.image}
            source={require('../../../assets/images/Abc-Reading.png')}
          />
          <View style={selection.textContainer}>
            <Text style={selection.text}>Let the reading</Text>
            <Text style={selection.beginText}>BEGIN!</Text>
          </View>
        </View>

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
              <Text style={selection.sublabel}>Select a letter to practice:</Text>
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
                  <Text style={selection.sublabel}>Choose a chapter:</Text>
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
                  <View style={selection.combinedHeaderRow}>
                    <TouchableOpacity
                      style={selection.combinedBackBtn}
                      onPress={handleBackToChapters}
                      activeOpacity={0.7}
                    >
                      <Text style={selection.combinedBackArrow}>←</Text>
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
              <Text style={selection.sublabel}>Select a passage:</Text>
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