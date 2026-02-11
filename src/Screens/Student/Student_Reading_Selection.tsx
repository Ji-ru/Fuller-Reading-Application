import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SectionList,
  ScrollView,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import selection from '../../UI_Designs/PassageSelectionStyles';
import { Alphabet, Contrasts, Passage, Word } from '../../Interfaces/passage';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import { useStudentCompletedAlphabet, useStudentCompletedWord } from '../../Hooks/Student/use_StudentCompletedReading';
import { getAuth } from '@react-native-firebase/auth';

// Retrieve current user id 
const currentStudentId = getAuth().currentUser?.uid ?? '';

// Safe data access with fallback
const alphabetData = readingMaterialData?.Alphabet || [];
const passages = readingMaterialData?.Passages || [];
const wordsData = readingMaterialData?.Words || [];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function PageSelectionScreen() {
  // HANDLE NAVIGATION
  const { handleLogout, handleBackStep, handleReadingNext } = useNavigationHelper();

  const completedAlphabets = useStudentCompletedAlphabet(currentStudentId);
  const isAlphabetCompleted = (letter: string) => completedAlphabets.some(a => a.letter === letter);

  const completedWords = useStudentCompletedWord(currentStudentId);
  const normalize = (value: string) => value.trim().toLowerCase();
  const isWordCompleted = (word: string) => completedWords.some(a => normalize(a.word) === normalize(word));

  // HANDLE MENU
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'alphabet' | 'passage' | 'word'>('alphabet');
  const [logoutVisible, setLogoutVisible] = useState(false);
  
  // NEW: Word selection state - two-step process
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

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

  // Handle alphabet selection
  const handleAlphabetSelect = (alphabet: Alphabet) => {
    handleReadingNext(alphabet, 'alphabet');
  };

  // Handle word selection
  const handleWordSelect = (wordText: string) => {
    const wordData = wordsData.find((word: Word) =>
      word.contrasts.some((contrast: Contrasts) =>
        contrast.words.includes(wordText),
      ),
    );
    if (!wordData) return;
    
    // Keep Word interface, but FILTER contrasts to the selected word only
    const filteredWord: Word = {
      letter: wordData.letter,
      contrasts: wordData.contrasts
        .map(contrast => ({
          ...contrast,
          words: contrast.words.filter(
            w => w.trim().toLowerCase() === wordText.trim().toLowerCase(),
          ),
        }))
        .filter(contrast => contrast.words.length > 0),
    };

    handleReadingNext(filteredWord, 'word');
  };

  // NEW: Handle letter selection in word tab
  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
  };

  // NEW: Go back to letter selection
  const handleBackToLetters = () => {
    setSelectedLetter(null);
  };

  // Handle passage selection
  const handlePassageSelect = (passage: Passage) => {
    handleReadingNext(passage, 'passage');
  };

  // Get word data for selected letter
  const getSelectedLetterWords = () => {
    if (!selectedLetter) return null;
    return wordsData.find((word: Word) => word.letter === selectedLetter);
  };

  // Render alphabet item
  const renderAlphabetItem = ({ item }: { item: Alphabet }) => (
    <TouchableOpacity
      style={selection.alphabetItem}
      onPress={() => handleAlphabetSelect(item)}
    >
      <View style={selection.alphabetContainer}>
        <Text style={selection.alphabetLetter}>{item.letter}</Text>
        {isAlphabetCompleted(item.letter) && (
          <View style={selection.completedBadge}>
            <Text style={selection.completedCheckmark}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // NEW: Render letter card for word selection
  const renderLetterCard = ({ item }: { item: Word }) => {
    // Count total words for this letter
    const totalWords = item.contrasts.reduce((sum, contrast) => sum + contrast.words.length, 0);
    
    // Count completed words for this letter
    const completedCount = item.contrasts.reduce((sum, contrast) => {
      return sum + contrast.words.filter(word => isWordCompleted(word)).length;
    }, 0);

    return (
      <TouchableOpacity
        style={selection.letterCard}
        onPress={() => handleLetterSelect(item.letter)}
        activeOpacity={0.7}
      >
        <View style={selection.letterCardContent}>
          {/* Letter Icon */}
          <View style={selection.letterIconContainer}>
            <Text style={selection.letterIconText}>{item.letter}</Text>
          </View>

          {/* Letter Info */}
          <View style={selection.letterInfo}>
            <Text style={selection.letterTitle}>Letter {item.letter}</Text>
            <Text style={selection.letterSubtitle}>
              {totalWords} words • {item.contrasts.length} categories
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

  // NEW: Render word item in phoneme category
  const renderWordInCategory = (word: string, index: number) => {
    const completed = isWordCompleted(word);
    
    return (
      <TouchableOpacity
        key={`${word}-${index}`}
        style={[
          selection.wordBubble,
          completed && selection.wordBubbleCompleted,
        ]}
        onPress={() => handleWordSelect(word)}
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

  // NEW: Render phoneme category section
  const renderPhonemeCategory = (contrast: Contrasts, index: number) => {
    return (
      <View key={`${contrast.phoneme}-${index}`} style={selection.phonemeSection}>
        <View style={selection.phonemHeader}>
          <View style={selection.phonemeIconContainer}>
            <Text style={selection.phonemeIcon}>🔤</Text>
          </View>
          <View style={selection.phonemeInfo}>
            <Text style={selection.phonemeTitle}>
              {contrast.phoneme.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text style={selection.phonemeIPA}>{contrast.ipa}</Text>
          </View>
        </View>
        
        <View style={selection.wordsGrid}>
          {contrast.words.map((word, idx) => renderWordInCategory(word, idx))}
        </View>
      </View>
    );
  };

  // Render passage item
  const renderPassageItem = ({ item }: { item: Passage }) => (
    <View style={selection.itemWrapper}>
      <TouchableOpacity
        style={selection.item}
        onPress={() => handlePassageSelect(item)}
      >
        <View style={selection.insidePassageListContainer}>
          <View>
            <Text style={selection.title}>{item.title}</Text>
            <Text style={selection.author}>By {item.author}</Text>
          </View>
          <View style={selection.arrowContainer}>
            <Text style={selection.arrowButton}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={selection.container}>
      <View style={selection.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

        {/* HEADER (LOGO + MENU ICON) */}
        <View>
          <View style={upperNav.header}>
            <TouchableOpacity style={upperNav.touchable} onPress={handleBackStep}>
              <Image
                source={require('../../../assets/icons/BackButton-icon.png')}
              />
            </TouchableOpacity>
            <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
            <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
              <Image
                style={upperNav.menuIcon}
                source={require('../../../assets/icons/Menu-icon.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OVERLAY TO CLOSE MENU */}
        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}

        {/* SCREEN TITLE */}
        <Text style={selection.label}>Reading Materials</Text>

        {/* IMAGE */}
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

        {/* TABS */}
        <View style={selection.tabContainer}>
          {/* ALPHABET TAB */}
          <TouchableOpacity
            style={[
              selection.tab,
              activeTab === 'alphabet' && selection.activeTab,
            ]}
            onPress={() => {
              setActiveTab('alphabet');
              setSelectedLetter(null); // Reset word selection
            }}
          >
            <Text
              style={[
                selection.tabText,
                activeTab === 'alphabet' && selection.activeTabText,
              ]}
            >
              Alphabet
            </Text>
          </TouchableOpacity>

          {/* WORDS TAB */}
          <TouchableOpacity
            style={[selection.tab, activeTab === 'word' && selection.activeTab]}
            onPress={() => {
              setActiveTab('word');
              setSelectedLetter(null); // Reset to letter selection
            }}
          >
            <Text
              style={[
                selection.tabText,
                activeTab === 'word' && selection.activeTabText,
              ]}
            >
              Words
            </Text>
          </TouchableOpacity>

          {/* PASSAGE TAB */}
          <TouchableOpacity
            style={[
              selection.tab,
              activeTab === 'passage' && selection.activeTab,
            ]}
            onPress={() => {
              setActiveTab('passage');
              setSelectedLetter(null); // Reset word selection
            }}
          >
            <Text
              style={[
                selection.tabText,
                activeTab === 'passage' && selection.activeTabText,
              ]}
            >
              Passages
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT BASED ON ACTIVE TAB */}
        <View style={selection.contentContainer}>
          {/* ALPHABET TAB */}
          {activeTab === 'alphabet' && (
            <>
              <Text style={selection.sublabel}>
                Select a letter to practice:
              </Text>
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

          {/* WORDS TAB - TWO-STEP SELECTION */}
          {activeTab === 'word' && (
            <View style={selection.wordSelectionContainer}>
              {/* STEP 1: Letter Selection */}
              {!selectedLetter && (
                <>
                  <Text style={selection.sublabel}>
                    Choose a letter to see its words:
                  </Text>
                  <FlatList
                    data={wordsData}
                    renderItem={renderLetterCard}
                    keyExtractor={item => item.letter}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={selection.letterListContainer}
                  />
                </>
              )}

              {/* STEP 2: Word Selection by Phoneme */}
              {selectedLetter && (() => {
                const letterData = getSelectedLetterWords();
                if (!letterData) return null;

                return (
                  <>
                    {/* Back Button */}
                    <TouchableOpacity
                      style={selection.backToLettersButton}
                      onPress={handleBackToLetters}
                      activeOpacity={0.7}
                    >
                      <Text style={selection.backArrow}>←</Text>
                      <Text style={selection.backToLettersText}>
                        Back to Letters
                      </Text>
                    </TouchableOpacity>

                    {/* Selected Letter Header */}
                    <View style={selection.selectedLetterHeader}>
                      <View style={selection.selectedLetterIcon}>
                        <Text style={selection.selectedLetterIconText}>
                          {selectedLetter}
                        </Text>
                      </View>
                      <View>
                        <Text style={selection.selectedLetterTitle}>
                          Letter {selectedLetter} Words
                        </Text>
                        <Text style={selection.selectedLetterSubtitle}>
                          Choose a word to practice
                        </Text>
                      </View>
                    </View>

                    {/* Phoneme Categories with Words */}
                    <ScrollView 
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={selection.phonemeListContainer}
                    >
                      {letterData.contrasts.map((contrast, index) => 
                        renderPhonemeCategory(contrast, index)
                      )}
                    </ScrollView>
                  </>
                );
              })()}
            </View>
          )}

          {/* PASSAGES TAB */}
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