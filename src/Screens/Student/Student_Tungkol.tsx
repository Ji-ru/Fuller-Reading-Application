import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackArrowIcon } from '../../Components/GlobalUse/Icons';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import { StudentColors as C, Radii, Shadows } from '../../Utilities/Theme';

export default function StudentTungkolScreen() {
  const { handleBackStep } = useNavigationHelper();

  return (
    <SafeAreaView style={S.bg}>
      {/* Bubbles */}
      <View style={bubbles.bubblesContainer} pointerEvents="none">
        <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
      </View>

      {/* Header */}
      <View style={S.headerBar}>
        <TouchableOpacity onPress={handleBackStep} style={S.backBtn} activeOpacity={0.7}>
          <BackArrowIcon size={20} color={C.ink} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Tungkol</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Body */}
      <ScrollView
        style={S.body}
        contentContainerStyle={S.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Identity Card */}
        <View style={S.identityCard}>
          <View style={S.identityGlow} />

          <Image
            style={S.logo}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          <Text style={S.appName}>Marungko Reading Application</Text>
          <View style={S.versionPill}>
            <Text style={S.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={S.aboutCard}>
          <Text style={S.aboutHeader}>Tungkol sa App</Text>
          <View style={S.aboutDivider} />

          <Text style={S.aboutText}>
            Marungko Reading Application is an innovative mobile assessment tool designed to assess and monitor the reading skills of Grade 1 to Grade 3 students. The application focuses on evaluating students’ oral reading performance through interactive reading activities that measure pronunciation, word recognition, reading fluency, and reading accuracy. As an assessment-based platform, the application helps teachers and parents track students’ reading development, identify reading difficulties, and monitor progress over time through guided reading exercises and performance results.
          </Text>
        </View>

        {/* Speech Recognition Section */}
        <View style={[S.aboutCard, { marginTop: 16 }]}>
          <Text style={S.aboutHeader}>Speech Recognition Model</Text>
          <View style={S.aboutDivider} />

          <Text style={S.aboutText}>
            This application uses a fine-tuned version of the Whisper to assess students’ oral reading performance. Whisper is an automatic speech recognition (ASR) model developed by OpenAI that converts spoken language into text. It is trained on large multilingual datasets, enabling it to recognize different accents, pronunciations, and speaking styles.
          </Text>
        </View>

        {/* Team Section */}
        <View style={[S.aboutCard, { marginTop: 16 }]}>
          <Text style={S.aboutHeader}>Ang Aming Team</Text>
          <View style={S.aboutDivider} />

          {/* Jayariz Cortez */}
          <View style={S.teamMember}>
            <View style={S.teamPhotoContainer}>
              <Image
                source={require('../../../assets/images/Cortez.jpg')}
                style={S.teamPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={S.teamInfo}>
              <Text style={S.teamName}>Jayariz Cortez</Text>
              <Text style={S.teamRole}>Lead Developer</Text>
            </View>
          </View>

          {/* John Louise Ayonting */}
          <View style={S.teamMember}>
            <View style={S.teamPhotoContainer}>
              <Image
                source={require('../../../assets/images/Ayonting.jpg')}
                style={S.teamPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={S.teamInfo}>
              <Text style={S.teamName}>John Louise Ayonting</Text>
              <Text style={S.teamRole}>Model & Software Developer</Text>
            </View>
          </View>

          {/* Cristene Devilleres */}
          <View style={[S.teamMember, S.teamMemberLast]}>
            <View style={S.teamPhotoContainer}>
              <Image
                source={require('../../../assets/images/Devilleres.jpg')}
                style={S.teamPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={S.teamInfo}>
              <Text style={S.teamName}>Cristene Devilleres</Text>
              <Text style={S.teamRole}>Model Developer & Documentation</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
  },

  // Body
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bodyContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Identity Card
  identityCard: {
    backgroundColor: C.white,
    borderRadius: Radii.xl,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    ...Shadows.cardLift,
  },
  identityGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: C.green + '0A',
  },
  logo: {
    width: 120,
    height: 100,
    marginBottom: 12,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: C.green,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  versionPill: {
    backgroundColor: C.greenLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.green,
  },

  // About Card
  aboutCard: {
    backgroundColor: C.white,
    borderRadius: Radii.xl,
    padding: 22,
    ...Shadows.card,
  },
  aboutHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 10,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: C.slate + '12',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 23,
    color: C.ink,
    marginBottom: 14,
    textAlign: 'justify',
    fontWeight: '500',
  },

  // Team Section
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.slate + '10',
  },
  teamMemberLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  teamPhotoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.green + '20',
    ...Shadows.subtle,
  },
  teamPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: C.greenLight,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 18,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 13,
    fontWeight: '600',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
