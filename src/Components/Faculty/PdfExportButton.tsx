import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import RNPrint from 'react-native-print';
import { buildFacultyPdfHtml } from './PdfHtmlBuilder';
import { FacultyColors as F } from '../../Utilities/Theme';

interface PdfExportButtonProps {
  studentName: string;
  readingLevel?: string;
  aralinDone: number;
  totalAttempts: number;
  groupedReports: {
    letter: string;
    aralinLabel: string;
    aralinProgress: number;
    activities: {
      type: 'Titik' | 'Salita' | 'Talata';
      title: string;
      reports: {
        accuracyRate: number;
        wordPerMin: number;
      }[];
    }[];
  }[];
  allReports: {
    timestamp: any;
    accuracyRate: number;
    wordPerMin: number;
    substitutionCount?: number;
    omissionCount?: number;
    insertionCount?: number;
    repetitionCount?: number;
  }[];
}

export default function PdfExportButton({
  studentName,
  readingLevel,
  aralinDone,
  totalAttempts,
  groupedReports,
  allReports,
}: PdfExportButtonProps) {
  const handleExport = useCallback(async () => {
    try {
      const html = buildFacultyPdfHtml({
        studentName,
        readingLevel,
        aralinDone,
        totalAttempts,
        groupedReports,
        allReports,
      });

      await RNPrint.print({
        html,
      });

      Alert.alert('Success', 'PDF has been sent to print. Tap "Save as PDF" in the print preview to export.');
    } catch (err: any) {
      console.error('PDF export error:', err);
      const msg = err?.message || String(err) || 'Unknown error';
      Alert.alert('Error', `Could not generate PDF.\n\n${msg}`);
    }
  }, [studentName, readingLevel, aralinDone, totalAttempts, groupedReports, allReports]);

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handleExport}
      activeOpacity={0.75}
    >
      <Text style={styles.icon}>⬇</Text>
      <Text style={styles.label}>PDF</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: F.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: F.primaryLight,
  },
  icon: {
    fontSize: 16,
    fontWeight: '900',
    color: F.primaryDeep,
    marginTop: -2,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    color: F.primaryDeep,
    textTransform: 'uppercase',
    marginTop: -1,
  },
});
