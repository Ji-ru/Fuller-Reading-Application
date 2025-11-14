import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../ui/BubblesDesign';
import user from '../../ui/UserStyle';
import passagesData from '../../../assets/ReadingMaterial/ReadingMaterial.json';
import selection from '../../ui/PassageSelectionStyles';
import { Passage } from '../../Types/passage';

// Safe data access with fallback
const passages = passagesData?.Passages || [];

export default function PageSelectionScreen() {
  // HANDLE NAVIGATION
  const {
    handleLogout,
    handleNextStep,
    handleCancelRegistration,
    handleBackStep,
    handleReadingNext,
  } = useNavigationHelper();

  // HANDLE MENU
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => handleLogout(),
        },
      ],
      { cancelable: true },
    );
  };

  // Handle passage selection
  const handlePassageSelect = (passage: Passage) => {
    handleReadingNext(passage); 
  };

  const renderItem = ({ item }: { item: Passage }) => (
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
          <View style={user.header}>
            <Image
              style={user.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
            <TouchableOpacity style={user.touchable} onPress={toggleMenu}>
              <Image
                style={user.menuIcon}
                source={require('../../../assets/icons/Menu-icon.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={user.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={user.logoutIcon}
              />
              <Text style={user.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OVERLAY TO CLOSE MENU */}
        {menuVisible && (
          <TouchableOpacity
            style={user.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}

        {/* SCREEN TITLE */}
        <Text style={selection.label}>Register</Text>

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

        {/* PASSAGES LIST */}
        <View style={selection.passageListContainer}>
        <Text style={selection.sublabel}>Select a passage:</Text>          
          {passages.length > 0 ? (
            <FlatList
              data={passages}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <Text>No passages available</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
