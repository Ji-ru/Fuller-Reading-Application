# Implementation Plan: Alphabet Mastery Sessions

This document outlines the steps required to implement the **Alphabet Mastery Sessions** section within the "Serye" (Sessions) tab, using your provided `AlphabetMastery.tsx` template as inspiration.

## Phase 1: Controller Modifications (`MiscueReportController.ts`)
The current methods in `MiscueReportController.ts` (lines 456-519) were copied from the Word Mastery logic, meaning they still attempt to query a `word` field. Since the `alphabetCompleted` collection only stores the `letter`, `studentId`, and `createdAt` timestamp, we need to correct the typings and mapping logic.

**Action Items:**
- **`getAlphabetMasteryData`**: Change mapping to return `{ letter, timestamp }`. Remove `word`.
- **`getAlphabetMasteryByDateRange`**: Return `Promise<Array<{ letter: string, timestamp: Date }>>`. Filter out `word`.
- **`getAlphabetMasteryAllTime`**: Return `Promise<Array<{ letter: string, timestamp: Date }>>`.

## Phase 2: Create Data Hook (`useStudentAlphabetMasteryTrends.ts`)
The `AlphabetMastery.tsx` UI relies on a hook that aggregates session data into daily, weekly, or monthly slots. We will create this hook to process the raw alphabet completions.

**Action Items:**
- Create `src/Hooks/use_StudentAlphabetMasteryTrends.ts`.
- **Data Aggregation**: Group the fetched `{ letter, timestamp }` objects into the appropriate time slots (e.g., Mon, Tue, Wed) based on the selected `TimeRange` ('week' | 'month' | 'year').
- **Synthesizing Sessions**: Since Marungko's database only logs successful alphabet completions (`alphabetCompleted`), we will map these as 100% accurate sessions. 
  - `correctLetters`: Array of letters mastered in that time slot.
  - `incorrectLetters`: `[]` (empty, as failures aren't tracked globally for alphabets).
  - `attemptedCount` & `correctCount`: Length of `correctLetters`.
  - `accuracy`: `100` if letters were mastered, otherwise `null`.

## Phase 3: Refactor UI Component & Integrate
Your inspired component `AlphabetMastery.tsx` is currently a standalone file with its own hardcoded design system (`T` tokens, `F` fonts, and inline styles). We need to adapt it so it visually matches the modernized project theme.

**Action Items:**
- **Relocate File**: Move `AlphabetMastery.tsx` into `src/Components/Student/Performance/AlphabetMasterySection.tsx`.
- **Theme Alignment**: 
  - Strip the hardcoded `T` color object and replace it with `StudentColors as C` (from `Theme.ts`).
  - Strip the `F` font object and replace it with standard React Native `fontWeight` or project-standard fonts (e.g., Nunito).
  - Apply `Radii` and `Shadows` from `Theme.ts` to ensure the cards perfectly match the "Pagsusuri" (Analytics) tab.
- **Integration**: Mount `<AlphabetMasterySection />` inside your Tab 2 component (`src/Components/Student/SessionsTab.tsx`).

---
### Please review this plan.
If this aligns with how you want the Alphabet data presented (noting that accuracy will be 100% based on the `alphabetCompleted` collection constraints), let me know and I will begin execution!
