import React from 'react';
import { Text, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const C = {
  primary: '#388E3C',
  dark: '#1F2937',
  gray: '#6B7280',
  bg: '#F6F8F7',
  white: '#FFFFFF',
};

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.title}>About</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* App Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Application</Text>
          <Text style={styles.paragraph}>
            This application supports reading development by helping learners
            practice reading while giving teachers and students access to reading
            accuracy, progress tracking, and performance insights.
          </Text>
        </View>

        {/* Team Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Team Members</Text>

          <Text style={styles.listItem}>• Arth Luije S. Bancat</Text>
          <Text style={styles.listItem}>• Erwin Leonardia</Text>
          <Text style={styles.listItem}>• Jibril Leandear Paul M. Rubi</Text>
        </View>

        {/* System Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI & System Models</Text>

          <Text style={styles.listItem}>• Speech recognition</Text>
          <Text style={styles.listItem}>• Miscue detection</Text>
          <Text style={styles.listItem}>• Reading accuracy analytics</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 30,
    color: '#fff',
    marginTop: -2,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.dark,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 10,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: C.gray,
  },

  listItem: {
    fontSize: 14,
    color: C.dark,
    paddingVertical: 4,
  },
});