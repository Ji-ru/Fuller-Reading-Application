import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SectionList,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../ui/BubblesDesign';
import user from '../../ui/UserStyle';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import selection from '../../ui/PassageSelectionStyles';
import { Alphabet, Contrasts, Passage, Word } from '../../Types/passage';
import LogoutModal from '../../Components/Buttons/LogoutModal';
import upperNav from '../../ui/UpperNavigation';

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
  const { handleLogout, handleBackStep, handleReadingNext } =
    useNavigationHelper();

  // HANDLE MENU
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'alphabet' | 'passage' | 'word'>(
    'alphabet',
  );
  const [logoutVisible, setLogoutVisible] = useState(false);

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

  /**
   * Uses useMemo to shuffle only once when component mounts, ensuring
   * consistent display during the session. Re-shuffles on component remount.
   */
  const prepareWordsData = useMemo(() => {
    return wordsData.map((wordData: Word) => {
      const allWords: string[] = [];

      // Loop through each contrast in the Word
      wordData.contrasts.forEach((contrast: Contrasts) => {
        // Take first 5 words from this contrast
        const shuffledWords = shuffleArray(contrast.words);
        const selectedWords = shuffledWords.slice(0, 5);
        allWords.push(...selectedWords);
      });
      return {
        letter: wordData.letter,
        data: allWords,
      };
    });
  }, []);

  // Handle passage selection
  const handlePassageSelect = (passage: Passage) => {
    handleReadingNext(passage, 'passage');
  };

  // Render alphabet item
  const renderAlphabetItem = ({ item }: { item: Alphabet }) => (
    <TouchableOpacity
      style={selection.alphabetItem}
      onPress={() => handleAlphabetSelect(item)}
    >
      <View style={selection.alphabetContainer}>
        <Text style={selection.alphabetLetter}>{item.letter}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render word item
  const renderWordItem = ({ item }: { item: string }) => (
    <View style={selection.itemWrapper}>
      <TouchableOpacity
        style={selection.item}
        onPress={() => handleWordSelect(item)}
      >
        <View style={selection.insidePassageListContainer}>
          <Text style={selection.word}>{item}</Text>
          <View style={selection.arrowContainer}>
            <Text style={selection.arrowButton}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Displays the letter header (A, B, C, etc.)
  const renderSectionHeader = ({
    section,
  }: {
    section: { letter: string; data: string[] };
  }) => (
    <View style={selection.wordSectionContainer}>
      <Text style={selection.wordSection}>{section.letter}</Text>
    </View>
  );

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
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          {/* Top Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />

          {/* Bottom Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>
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
            onPress={() => setActiveTab('alphabet')}
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
            onPress={() => setActiveTab('word')}
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
            onPress={() => setActiveTab('passage')}
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
          {/* WORDS TAB */}
          {activeTab === 'word' && (
            <View style={selection.passageListContainer}>
              <Text style={selection.sublabel}>Select a word to practice:</Text>
              {prepareWordsData.length > 0 ? (
                <SectionList
                  sections={prepareWordsData}
                  renderItem={renderWordItem}
                  renderSectionHeader={renderSectionHeader}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  stickySectionHeadersEnabled={true}
                />
              ) : (
                <Text>No words available</Text>
              )}
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
