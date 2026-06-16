// Note: React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used here,
// because this file defines a service class, not a React component or custom hook.
// React hooks are only usable inside function components or custom React hooks (functions prefixed with 'use').
import { Miscue } from '../Interfaces/miscue';

export class MiscueAnalysisService {
  // Strip punctuation, lowercase, and split text into a clean list of words
  private static normalizeWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  static detectMiscues(passageText: string, spokenText: string): Miscue[] {
    if (!spokenText) {
      return [];
    }

    // Strip punctuation and split into words
    const targetWords = this.normalizeWords(passageText);
    const userWords = this.normalizeWords(spokenText);

    const detectedMiscues: Miscue[] = [];

    let targetIndex = 0;
    let userIndex = 0;

    while (targetIndex < targetWords.length && userIndex < userWords.length) {
      const expectedWord = targetWords[targetIndex];
      const spokenWord = userWords[userIndex];

      // Case 1: Exact match - no miscue
      if (spokenWord === expectedWord) {
        targetIndex++;
        userIndex++;
        continue;
      }

      // Case 2: Check for repetition first (since it's most specific)
      const repetitionMiscue = this.detectRepetition(
        targetWords,
        userWords,
        targetIndex,
        userIndex,
      );
      if (repetitionMiscue) {
        detectedMiscues.push(repetitionMiscue);
        userIndex++; // Only advance user index for repetition
        continue;
      }

      // Case 3: Check if current spoken word matches next target word (omission)
      const omissionMiscue = this.detectOmission(
        targetWords,
        userWords,
        targetIndex,
        userIndex,
      );
      if (omissionMiscue.miscue) {
        for (let i = 0; i < omissionMiscue.skipCount; i++) {
          detectedMiscues.push({
            expected: targetWords[targetIndex + i],
            spoken: '[OMITTED]',
            position: targetIndex + i,
            timestamp: new Date(),
            type: 'omission',
          });
        }
        targetIndex += omissionMiscue.skipCount; // Skip all omitted words
        continue;
      }

      // Case 4: Check if current target word matches next spoken word (insertion)
      const insertionMiscue = this.detectInsertion(
        targetWords,
        userWords,
        targetIndex,
        userIndex,
      );
      if (insertionMiscue.miscue) {
        for (let i = 0; i < insertionMiscue.skipCount; i++) {
          detectedMiscues.push({
            expected: '[EXTRA]',
            spoken: userWords[userIndex + i],
            position: targetIndex,
            timestamp: new Date(),
            type: 'insertion',
          });
        }
        userIndex += insertionMiscue.skipCount; // Skip all inserted words
        continue;
      }

      // Case 5: Substitution (words don't match but positions align)
      // DIRECT APPROACH
      detectedMiscues.push(
        this.detectSubstitution(expectedWord, spokenWord, targetIndex),
      );
      targetIndex++;
      userIndex++;
      continue;
    }

    // Handle remaining omissions (target words not spoken)
    while (targetIndex < targetWords.length) {
      detectedMiscues.push({
        expected: targetWords[targetIndex],
        spoken: '[OMITTED]',
        position: targetIndex,
        timestamp: new Date(),
        type: 'omission',
      });
      targetIndex++;
    }

    // Handle remaining insertions (extra spoken words)
    while (userIndex < userWords.length) {
      detectedMiscues.push({
        expected: '[EXTRA]',
        spoken: userWords[userIndex],
        position: userIndex,
        timestamp: new Date(),
        type: 'insertion',
      });
      userIndex++;
    }

    return detectedMiscues;
  }

  // DETECT REPETITION
  private static detectRepetition(
    targetWords: string[],
    userWords: string[],
    targetIndex: number,
    userIndex: number,
  ): Miscue | null {
    /**
     * Check if the current spoken word repeats the previous spoken word
     * First if statement:
     * - 1st Condition: Check if userIndex is less the the length of user words (spoken)
     * - 2nd Condition: Check if current word is same as previous word
     *
     * Second if statement:
     * - both 1st and 2nd conditions in the targetIndex and targetWords are similar with the First if statement
     */

    if (userIndex > 0 && userWords[userIndex] === userWords[userIndex - 1]) {
      /**
       * Check if the target text also has this repetition at this position
       * If yes then, its not a MISCUE
       * @returns null since its not a repetitive word
       */
      if (
        targetIndex > 0 &&
        targetWords[targetIndex] === targetWords[targetIndex - 1]
      ) {
        return null;
      }
      return {
        expected: `[NO REPETITION EXPECTED]`,
        spoken: userWords[userIndex],
        position: targetIndex,
        timestamp: new Date(),
        type: 'repetition',
      };
    }
    return null;
  }

  // DETECT OMISSION
  private static detectOmission(
    targetWords: string[],
    userWords: string[],
    targetIndex: number,
    userIndex: number,
  ): { miscue: Miscue | null; skipCount: number } {
    // Look ahead instance
    const LOOKAHEAD = 5;

    // Check if current spoken word matches any upcoming target word
    for (
      let i = 1;
      i <= LOOKAHEAD && targetIndex + i < targetWords.length;
      i++
    ) {
      if (userWords[userIndex] === targetWords[targetIndex + i]) {
        // Found a match at position +i, so i words were omitted
        return {
          miscue: {
            expected: targetWords[targetIndex],
            spoken: '[OMITTED]',
            position: targetIndex,
            timestamp: new Date(),
            type: 'omission',
          },
          skipCount: i, // Tell caller how many words to skip
        };
      }
    }
    return { miscue: null, skipCount: 0 };
  }

  private static detectInsertion(
    targetWords: string[],
    userWords: string[],
    targetIndex: number,
    userIndex: number,
  ): { miscue: Miscue | null; skipCount: number } {
    const LOOKAHEAD = 5;
    /**
     * Detects word insertions by looking ahead in spoken text
     *
     * Example:
     *   Target: "the cat"
     *   Spoken: "the big brown cat"
     *   At "big": looks ahead and finds "cat" at position +2
     *   Returns: miscue for "big", skipCount = 2 (skip "big" and "brown")
     *
     * @returns miscue for first inserted word, skipCount = total inserted words
     */
    for (let i = 1; i <= LOOKAHEAD && userIndex + i < userWords.length; i++) {
      if (targetWords[targetIndex] === userWords[userIndex + i]) {
        return {
          miscue: {
            expected: '[EXTRA]',
            spoken: userWords[userIndex],
            position: targetIndex,
            timestamp: new Date(),
            type: 'insertion',
          },
          skipCount: i, // Tell caller how many inserted words to skip
        };
      }
    }
    return { miscue: null, skipCount: 0 };
  }

  private static detectSubstitution(
    expected: string,
    spoken: string,
    position: number,
  ): Miscue {
    return {
      expected,
      spoken,
      position,
      timestamp: new Date(),
      type: 'substitution',
    };
  }

  // Enhanced accuracy calculation that considers miscues
  static calculateAccuracy(passageText: string, spokenText: string): string {
    if (!spokenText) return '0';

    const targetWords = passageText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    const miscues = this.detectMiscues(passageText, spokenText);

    // Count all error types that affect accuracy
    const errorCount = miscues.filter(
      miscue =>
        miscue.type === 'omission' ||
        miscue.type === 'substitution' ||
        miscue.type === 'insertion' ||
        miscue.type === 'repetition',
    ).length;

    const correctCount = targetWords.length - errorCount;
    const accuracy = (correctCount / targetWords.length) * 100;

    return Math.max(0, accuracy).toFixed(1);
  }

  static getAccuracyFeedback(accuracy: string): string {
    const accuracyNum = parseFloat(accuracy);
    if (accuracyNum >= 95) return 'Excellent Reading! 🎉';
    if (accuracyNum >= 90) return 'Great Job!';
    if (accuracyNum >= 80) return 'Good Effort!';
    if (accuracyNum >= 70) return 'Keep Practicing!';
    return "Let's Try Again!";
  }

  static formatMiscueWords(miscues: Miscue[]): string {
    if (miscues.length === 0) return 'None';

    return miscues
      .slice(0, 5)
      .map(miscue => {
        switch (miscue.type) {
          case 'omission':
            return `"${miscue.expected}"`;
          case 'insertion':
            return `"${miscue.spoken}"`;
          case 'repetition':
            return `"${miscue.spoken}"`;
          case 'substitution':
            return `"${miscue.expected}"`;
          default:
            return `"${miscue.spoken}"`;
        }
      })
      .join(', ');
  }

  // ==============================
  // ALPHABET PHONEME ACCURACY (STRICT)
  // ==============================
  static checkAlphabetPhonemeAccuracy(
    targetLetter: string,
    spokenText: string,
  ): {
    isCorrect: boolean;
    accuracy: string;
    feedback: string;
  } {
    if (!spokenText || spokenText === 'No Speech Detected!') {
      return {
        isCorrect: false,
        accuracy: '0',
        feedback: 'No sound detected',
      };
    }

    const normalizedTarget = targetLetter.toUpperCase().trim();
    const normalizedSpoken = spokenText.toUpperCase().trim();

    // Remove everything except letters
    const cleanSpoken = normalizedSpoken.replace(/[^A-Z]/g, '');

    // For alphabet phoneme: must be exactly the single letter
    // Examples that should PASS: "A", "A.", "A!", "A "
    // Examples that should FAIL: "Apple", "A cat", "The letter A"
    const isCorrect = cleanSpoken === normalizedTarget;

    return {
      isCorrect,
      accuracy: isCorrect ? '100' : '0',
      feedback: isCorrect
        ? `✓ Perfect! You said the letter "${normalizedTarget}" correctly.`
        : `✗ Try again. Say just the letter "${normalizedTarget}". You said: "${normalizedSpoken}"`,
    };
  }

  // ==============================
  // WORD ACCURACY (More tolerant)
  // ==============================
  static checkWordAccuracy(
    targetWord: string,
    spokenText: string,
  ): {
    isCorrect: boolean;
    accuracy: string;
    feedback: string;
  } {
    if (!spokenText || spokenText === 'No Speech Detected!') {
      return {
        isCorrect: false,
        accuracy: '0',
        feedback: 'No sound detected',
      };
    }

    const normalizedTarget = targetWord.toUpperCase().trim();
    const normalizedSpoken = spokenText.toUpperCase().trim();

    // Remove non-alphabetic characters but keep spaces for multi-word phrases
    const cleanSpoken = normalizedSpoken.replace(/[^A-Z\s]/g, '').trim();
    const cleanTarget = normalizedTarget.replace(/[^A-Z\s]/g, '').trim();

    // Ensure exact match to prevent false mastery (e.g. "CATS" for "CAT")
    const spokenWords = cleanSpoken.split(/\s+/);
    const isCorrect = spokenWords.includes(cleanTarget);
    return {
      isCorrect,
      accuracy: isCorrect ? '100' : '0',
      feedback: isCorrect
        ? `✓ Great! You said "${cleanTarget}" correctly.`
        : `✗ Try again. Expected "${cleanTarget}", you said: "${normalizedSpoken}"`,
    };
  }
}
