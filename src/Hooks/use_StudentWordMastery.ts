import { useState, useEffect, useMemo } from 'react';
import { MiscueReportController } from '../Controller/MiscueReportController';
import readingMaterialData from '../../assets/ReadingMaterial/ReadingMaterial.json';

export interface WordMasteryStats {
  mastered: number;
  inProgress: number;
  new: number;
  total: number;
}

export interface AralinWordInfo {
  word: string;
  status: 'mastered' | 'tried' | 'unseen';
}

export function use_StudentWordMastery(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
) {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<{
    masteredLetters: Array<{ letter: string; timestamp: Date }>;
    masteredWords: Array<{ word: string; letter: string; timestamp: Date }>;
  }>({
    masteredLetters: [],
    masteredWords: [],
  });

  const fetchWordMastery = async () => {
    try {
      setLoading(true);
      const result = await MiscueReportController.getWordMasteryData(studentId);
      setRawData(result);
    } catch (error) {
      console.error('Error fetching word mastery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchWordMastery();
  }, [studentId]);

  // Helper to determine if a date is within the selected filter range
  const isWithinRange = (date: Date) => {
    const now = new Date();
    
    if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }

    if (timeFilter === 'month') {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (timeFilter === 'year') {
      // Academic Year: June 1 to March 31
      let startYear = now.getFullYear();
      if (now.getMonth() < 5) {
        // Before June (Jan-May)
        startYear = now.getFullYear() - 1;
      }

      const academicStart = new Date(startYear, 5, 1); // June 1
      const academicEnd = new Date(startYear + 1, 2, 31, 23, 59, 59); // March 31 of next year

      return date >= academicStart && date <= academicEnd;
    }

    return true;
  };

  const filteredData = useMemo(() => {
    const letters = new Set(
      rawData.masteredLetters
        .filter(d => isWithinRange(d.timestamp))
        .map(d => d.letter),
    );
    const words = new Set(
      rawData.masteredWords
        .filter(d => isWithinRange(d.timestamp))
        .map(d => d.word),
    );
    return { letters, words };
  }, [rawData, timeFilter]);

  const stats = useMemo((): WordMasteryStats => {
    return calculateStats(filteredData.letters, filteredData.words);
  }, [filteredData]);

  const cumulativeStats = useMemo((): WordMasteryStats => {
    const letters = new Set(rawData.masteredLetters.map(d => d.letter));
    const words = new Set(rawData.masteredWords.map(d => d.word));
    return calculateStats(letters, words);
  }, [rawData]);

  function calculateStats(masteredLettersSet: Set<string>, masteredWordsSet: Set<string>): WordMasteryStats {
    let mastered = masteredWordsSet.size;
    let total = 0;

    const allWords = new Set<string>();
    readingMaterialData.Words.forEach(group => {
      group.contrasts.forEach(contrast => {
        contrast.words.forEach(w => allWords.add(w));
      });
    });
    total = allWords.size;

    let inProgress = 0;
    readingMaterialData.Words.forEach(group => {
      const isAralinStarted =
        masteredLettersSet.has(group.letter) ||
        group.contrasts.some(c => c.words.some(w => masteredWordsSet.has(w)));

      if (isAralinStarted) {
        group.contrasts.forEach(c => {
          c.words.forEach(w => {
            if (!masteredWordsSet.has(w)) {
              inProgress++;
            }
          });
        });
      }
    });

    const newWords = Math.max(0, total - mastered - inProgress);

    return {
      mastered,
      inProgress,
      new: newWords,
      total,
    };
  }

  const getAralinWords = (letter: string): AralinWordInfo[] => {
    const group = readingMaterialData.Words.find(g => g.letter === letter);
    if (!group) return [];

    const words: AralinWordInfo[] = [];
    group.contrasts.forEach(c => {
      c.words.forEach(w => {
        let status: 'mastered' | 'tried' | 'unseen' = 'unseen';
        if (filteredData.words.has(w)) {
          status = 'mastered';
        } else if (filteredData.letters.has(letter)) {
          status = 'tried';
        }
        words.push({ word: w, status });
      });
    });
    return words;
  };

  return {
    loading,
    stats,
    cumulativeStats,
    masteredLetters: filteredData.letters,
    cumulativeLetters: new Set(rawData.masteredLetters.map(d => d.letter)),
    getAralinWords,
    refresh: fetchWordMastery,
  };
}
