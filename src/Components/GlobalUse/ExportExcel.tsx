// Components/GlobalUse/ExportExcelButton.tsx
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as XLSX from 'xlsx';
import { sw, sh, sf } from '../../Utils/responsive';

// ─── Hardcoded sample data (replace with real data later) ─────────────────────
const HARDCODED_READING_DATA = [
  {
    PassageTitle: 'The Little Red Hen',
    Date: '2025-05-01',
    AccuracyRate: 92.5,
    WordsPerMinute: 78,
    Duration: '2:14',
    TotalMiscues: 3,
    Substitutions: 'hen→him',
    Omissions: 'the',
    Insertions: 'None',
    Repetitions: 'little',
  },
  {
    PassageTitle: 'The Little Red Hen',
    Date: '2025-05-03',
    AccuracyRate: 95.0,
    WordsPerMinute: 85,
    Duration: '2:01',
    TotalMiscues: 1,
    Substitutions: 'None',
    Omissions: 'None',
    Insertions: 'None',
    Repetitions: 'red',
  },
  {
    PassageTitle: 'Jack and Jill',
    Date: '2025-05-05',
    AccuracyRate: 88.0,
    WordsPerMinute: 70,
    Duration: '1:45',
    TotalMiscues: 5,
    Substitutions: 'Jill→Gill',
    Omissions: 'and, up',
    Insertions: 'the',
    Repetitions: 'None',
  },
  {
    PassageTitle: 'Jack and Jill',
    Date: '2025-05-07',
    AccuracyRate: 91.0,
    WordsPerMinute: 76,
    Duration: '1:52',
    TotalMiscues: 2,
    Substitutions: 'None',
    Omissions: 'jack',
    Insertions: 'None',
    Repetitions: 'and',
  },
  {
    PassageTitle: 'The Sun and the Wind',
    Date: '2025-05-08',
    AccuracyRate: 97.5,
    WordsPerMinute: 90,
    Duration: '3:10',
    TotalMiscues: 0,
    Substitutions: 'None',
    Omissions: 'None',
    Insertions: 'None',
    Repetitions: 'None',
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ExportExcelButtonProps {
  /** Pass real grouped reports here once you're ready to wire it up */
  data?: typeof HARDCODED_READING_DATA;
  studentName?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ExportExcel({
  data = HARDCODED_READING_DATA,
  studentName = 'Student',
}: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // 1. Build worksheet
      const worksheetData = [
        // Header row
        [
          'Passage Title',
          'Date',
          'Accuracy Rate (%)',
          'Words Per Minute',
          'Duration',
          'Total Miscues',
          'Substitutions',
          'Omissions',
          'Insertions',
          'Repetitions',
        ],
        // Data rows
        ...data.map(row => [
          row.PassageTitle,
          row.Date,
          row.AccuracyRate,
          row.WordsPerMinute,
          row.Duration,
          row.TotalMiscues,
          row.Substitutions,
          row.Omissions,
          row.Insertions,
          row.Repetitions,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // 2. Column widths
      ws['!cols'] = [
        { wch: 28 }, // Passage Title
        { wch: 14 }, // Date
        { wch: 18 }, // Accuracy
        { wch: 18 }, // WPM
        { wch: 12 }, // Duration
        { wch: 14 }, // Total Miscues
        { wch: 22 }, // Substitutions
        { wch: 18 }, // Omissions
        { wch: 18 }, // Insertions
        { wch: 18 }, // Repetitions
      ];

      // 3. Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reading History');

      // 4. Write to base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // 5. Save to temp file
      const fileName = `ReadingHistory_${studentName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
      const filePath =
        Platform.OS === 'android'
          ? `${RNFS.CachesDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, wbout, 'base64');

      // 6. Share / open
      await Share.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
        failOnCancel: false,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      if (error?.message !== 'User did not share') {
        Alert.alert('Export Failed', 'Could not export the file. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handleExport}
      activeOpacity={0.8}
      disabled={isExporting}
    >
      {isExporting ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.btnText}>📥 Excel</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D6F42', // Excel green
    borderRadius: sw(8),
    paddingVertical: sh(6),
    paddingHorizontal: sw(12),
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: sh(1) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3),
    minWidth: sw(80),
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: sf(12),
    fontFamily: 'Nunito-Bold',
  },
});