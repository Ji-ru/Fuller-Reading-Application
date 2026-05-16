# Student Analytics Implementation Plan

## Overview
This document outlines the architecture and implementation steps for adding robust, cost-effective analytics to the Student Module. The analytics will track reading completion, activity duration, speed, accuracy, and miscue insights. 

To optimize Firebase read costs, we use a **Daily Aggregation (Session) Schema**. Instead of fetching hundreds of raw completion records, we update a single session document per day, saving significant billing costs and improving fetch speeds.

## Design Considerations
All UI components (charts, gauges, cards) should follow the **modernized design system** already established in the project:
- **Color Palette:** Primary blue (`#3d71d9`), accent colors from `ACCENT_COLORS` in `Theme.ts`
- **Typography & Spacing:** Match the design system used in `Faculty_Dashboard.tsx` and `Student_Reading_Activity.tsx`
- **Components:** Use existing `BounceIn`, animated components, and `LinearGradient` for consistency
- **Charts Library:** Use `react-native-gifted-charts` for modern, smooth animations aligned with the app's aesthetic
- **Accessibility:** Ensure charts have text labels and color-blind friendly color schemes

## 1. Database Schema & Indexes

**Path:** `studentAnalytics/{studentId}/dailySessions/{YYYY-MM-DD}`

**Document Structure:**
```json
{
  "date": "2026-05-03",
  "schoolYear": "2025-2026", 
  "alphabetsCompleted": ["M", "S"],
  "wordsCompletedCount": 5,
  "passagesReadCount": 1,
  "readingDurationSeconds": 120,
  "accuracySum": 95,
  "wpmSum": 60,
  "miscuesCount": {
    "substitution": 1,
    "omission": 0,
    "insertion": 0,
    "repetition": 2
  }
}
```

**Firestore Index (`firestore.indexes.json`)**
To allow sorting and filtering smoothly across dates and years without full collection scans:
```json
{
  "collectionGroup": "dailySessions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "schoolYear", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```

## 2. Core Utility - School Year Logic

The Year metric relies on the academic calendar: **June 1 to March 31**. 
We need a helper function to strictly bound records into their overlapping school year string (e.g., `2026-2027`).

```typescript
export const getSchoolYear = (date: Date): string => {
  const month = date.getMonth(); // 0 = Jan, 5 = Jun
  const year = date.getFullYear();

  // If June (5) to December (11), it belongs to "CurrentYear-NextYear"
  if (month >= 5) {
    return `${year}-${year + 1}`;
  }
  // If January (0) to May (4) (including summer break), it belongs to "PreviousYear-CurrentYear"
  else {
    return `${year - 1}-${year}`;
  }
};
```

## 3. Data Capture (Updating Controllers)

Modify `src/Controller/MiscueReportController.ts` using Firebase v22 Modular SDK. We will implement `setDoc` with `{ merge: true }` combined with `increment()` and `arrayUnion()` calls.

### Helper Method
```typescript
import { getFirestore, doc, setDoc, increment, arrayUnion } from '@react-native-firebase/firestore';

async function updateDailySession(studentId: string, analyticsData: any) {
  const db = getFirestore();
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const schoolYear = getSchoolYear(today);

  const sessionRef = doc(db, `studentAnalytics/${studentId}/dailySessions/${dateString}`);

  await setDoc(sessionRef, {
      date: dateString,
      schoolYear: schoolYear,
      ...analyticsData
  }, { merge: true });
}
```

### Integration Points
*   **`storeAlphabetCorrectAttempt`:** Append to `alphabetsCompleted` via `arrayUnion`.
*   **`storeWordCorrectAttempt`:** Increase `wordsCompletedCount` via `increment(1)`.
*   **`storeReport` (Passage):** Convert MM:SS to total seconds. Increment `passagesReadCount`, `readingDurationSeconds`, `accuracySum`, `wpmSum`, and respective properties inside `miscuesCount`.

## 4. Analytics Fetching Hook

Create or modify `src/Hooks/use_StudentAnalytics.ts` using `getDocs` and `query` to pull ONLY the data needed for the active UI filter (`Week`, `Month`, or `Year`). 

```typescript
import { getFirestore, collection, query, where, orderBy, getDocs } from '@react-native-firebase/firestore';

export const fetchAnalyticsData = async (studentId: string, filter: 'Week' | 'Month' | 'Year') => {
  const db = getFirestore();
  const sessionsRef = collection(db, `studentAnalytics/${studentId}/dailySessions`);
  let analyticsQuery;

  if (filter === 'Week') {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const dateString = lastWeek.toISOString().split('T')[0];
    
    analyticsQuery = query(sessionsRef, where('date', '>=', dateString), orderBy('date', 'asc'));
  } 
  else if (filter === 'Month') {
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const dateString = lastMonth.toISOString().split('T')[0];
    
    analyticsQuery = query(sessionsRef, where('date', '>=', dateString), orderBy('date', 'asc'));
  } 
  else if (filter === 'Year') {
    const currentSchoolYear = getSchoolYear(new Date());
    analyticsQuery = query(sessionsRef, where('schoolYear', '==', currentSchoolYear), orderBy('date', 'asc'));
  }

  const snapshot = await getDocs(analyticsQuery);
  return snapshot.docs.map(doc => doc.data());
};
```

## 5. UI Visualization Mapping

*   **Completion:** Sum the `wordsCompletedCount` and length of `alphabetsCompleted` mapping to a Bar Chart.
*   **Activity Time:** Draw an Area Chart mapping `date` (X-axis) against `readingDurationSeconds / 60` mapping to minutes (Y-axis).
*   **Accuracy/Speed:** Map line charts representing the moving average (`accuracySum / passagesReadCount`).
*   **Miscue Breakdown:** Combine all nested `miscuesCount` objects returned in the query into a Donut chart showing relative percentages.

## Phase 4: UI/UX Implementation (Student Module)

### New File: `src/Screens/Student/Student_Analytics_Screen.tsx`

This screen will display comprehensive reading analytics with an intuitive, child-friendly interface following the modernized design system.

#### 4.1 Filter Toggle
- **Component:** Horizontal pill buttons at the top: `[ Linggo | Buwan | Taon ]` (Week | Month | Year)
- **Styling:** 
  - Use `LinearGradient` for active state with primary blue (`#3d71d9`)
  - Inactive state: Light background with slate text
  - Smooth transitions when switching filters
  - Each filter triggers a re-fetch using `fetchAnalyticsData(studentId, filter)`

#### 4.2 General Completion (Bar Chart)
- **Chart Type:** Bar Chart using `react-native-gifted-charts`
- **Title:** "Mga Aralining Natutuhan" (Lessons Completed)
- **Data Mapping:**
  - **Week Filter:** X-Axis shows days (L, M, M, H, B, S, D) for each day of the week
  - **Month Filter:** X-Axis shows weeks (Week 1, Week 2, Week 3, Week 4)
  - **Year Filter:** X-Axis shows months (Jun, Jul, Aug, Sep... Ene, Feb, Mar)
  - Y-Axis: Total Aralin (Alphabet + Words) completed in that period
- **Color Scheme:** Gradient from light blue to primary blue (#3d71d9)
- **Animation:** `BounceIn` wrapper on initial load

#### 4.3 Reading Time Activity (Area Chart)
- **Chart Type:** Area Chart using `react-native-gifted-charts`
- **Title:** "Oras ng Pagbasa" (Reading Time)
- **Data Mapping:**
  - X-Axis: Same timeline as General Completion filter
  - Y-Axis: Total reading duration in minutes (`readingDurationSeconds / 60`)aq xE
  - Each point represents cumulative reading time for that day/week/month
- **Color Scheme:** Semi-transparent accent color (e.g., `#5989e5` with opacity) filling the area
- **Features:** Show actual time values on hover/tap for transparency

#### 4.4 Speed & Accuracy Analytics
- **Components (split layout):**
  
  **Left Side - Gauge Chart (Accuracy):**
  - Title: "Average Accuracy"
  - Displays average accuracy percentage calculated from `accuracySum / passagesReadCount`
  - Color Gradient: Green (90%+), Yellow (75-90%), Red (below 75%)
  - **Format:** Large circular gauge with percentage in center
  
  **Right Side - Gauge Chart (Speed):**
  - Title: "Average WPM"
  - Displays average Words Per Minute calculated from `wpmSum / passageAttempts`
  - Color Gradient: Green (high WPM), Yellow (medium), Red (slow)
  - **Format:** Large circular gauge with WPM value in center

- **Below Gauges - Line Chart (Progress Over Time):**
  - Title: "Pag-unlad ng Galing at Bilis" (Progress in Speed and Accuracy)
  - Dual-line chart showing:
    - Blue line: Accuracy percentage trend over the selected period
    - Orange line: WPM trend over the selected period
  - Allows students to see if they're improving or declining

#### 4.5 Miscue Insights Section

**Card 1: Miscue Breakdown (Donut Chart)**
- **Title:** "Uri ng Mga Pagkakamali" (Types of Errors)
- **Chart Type:** Donut chart with 4 slices:
  - **Pagpapalit (Substitution):** Red (#eb5c6c)
  - **Pagkakaltas (Omission):** Orange (#f39c12)
  - **Pagsisingit (Insertion):** Yellow (#f1c40f)
  - **Pag-uulit (Repetition):** Blue (#3d71d9)
- **Center Text:** Total miscues count
- **Interaction:** Tap each slice to see detailed count

**Card 2: Top Miscued Words (Text List)**
- **Title:** "Mga Salitang Kailangan Pang Sanayin" (Words to Practice)
- **Format:** Ranked list (1st, 2nd, 3rd... top 5)
- **Data:** Fetch from the aggregated `miscuesCount` across all passage attempts in the period
- **Visual Styling:**
  - Rank number in a colored circle (gradient colors)
  - Word in bold
  - Miscue count in lighter text
- **Interaction:** Tap a word to see which passages it appeared in

**Card 3: Top Struggling Passages (Text List)**
- **Title:** "Mga Talata na Kailangan ng Tulong" (Passages Needing Help)
- **Format:** Ranked list by lowest accuracy
- **Data:** Filter `passagePerformance` from the analytics period, sort by lowest accuracy first
- **Visual Styling:**
  - Passage title
  - Accuracy percentage with color-coded background (Red < 75%, Yellow 75-85%, Green 85%+)
  - Number of attempts
- **Interaction:** Tap to navigate to that passage for re-reading practice

### 4.6 Layout Structure
```
┌─────────────────────────────────────────┐
│  [ Linggo | Buwan | Taon ]              │  ← Filter Pills
├─────────────────────────────────────────┤
│  Mga Aralining Natutuhan                │
│  [Bar Chart - 7 days/weeks/months]      │
├─────────────────────────────────────────┤
│  Oras ng Pagbasa                        │
│  [Area Chart - Reading Duration]        │
├─────────────────────────────────────────┤
│  [Accuracy Gauge] [Speed Gauge]         │
├─────────────────────────────────────────┤
│  Pag-unlad ng Galing at Bilis           │
│  [Dual Line Chart - Trend]              │
├─────────────────────────────────────────┤
│  Uri ng Mga Pagkakamali                 │
│  [Donut Chart]                          │
├─────────────────────────────────────────┤
│  Mga Salitang Kailangan Pang Sanayin    │
│  1. [Word] - 5 times                    │
│  2. [Word] - 4 times                    │
│  ...                                    │
├─────────────────────────────────────────┤
│  Mga Talata na Kailangan ng Tulong      │
│  1. [Passage Title] - 72% accuracy      │
│  2. [Passage Title] - 68% accuracy      │
│  ...                                    │
└─────────────────────────────────────────┘
```

### 4.7 Design System Alignment
- **Header:** Use same `ReadingHeader` component as `Student_Reading_Activity.tsx`
- **Colors:** 
  - Primary: `#3d71d9`
  - Accent: Colors from `ACCENT_COLORS` in Theme
  - Success: Green for high performance
  - Warning: Yellow/Orange for average performance
  - Danger: Red for low performance
- **Typography:** Match sizes and weights from `Faculty_Dashboard.tsx`
- **Spacing & Shadows:** Use `Shadows` utility from existing design system
- **Animations:** Use `BounceIn` and existing animation components for chart loading

## 6. Identified Loopholes & Mitigations

### Loophole 1: Word/Alphabet Duplicate Counting
**Issue:** If a student repeats a word or alphabet attempt on the same day, the daily session counter (`wordsCompletedCount`) could increment multiple times, inflating the actual unique words practiced.

**Mitigation:** 
- For words: Check `hasWordBeenCompleted()` before incrementing. Only increment if the word is NEW for that letter. Otherwise, track as a "retry" metric separately.
- For alphabets: Use `arrayUnion()` (which prevents duplicates in arrays). No additional logic needed.
- **Action:** Clarify in `storeWordCorrectAttempt()` that we only update analytics if the word completion is NEW to the student.

### Loophole 2: Miscue & WPM Data Only Apply to Passages
**Issue:** The plan updates `miscuesCount`, `wpmSum`, and `accuracySum` for ALL activity types, but WPM and miscues are only meaningful for passages. Alphabets and words have 100% or 0% accuracy.

**Mitigation:**
- Strictly separate integration points by activity type.
- **Passages ONLY:** Update `passagesReadCount`, `readingDurationSeconds`, `accuracySum`, `wpmSum`, `miscuesCount`.
- **Words & Alphabets:** Update ONLY `wordsCompletedCount`, `alphabetsCompleted`, and a separate "dailyAttempts" field if retry tracking is needed.
- **Action:** Add type guards in `updateDailySession()` to validate which fields to update based on the activity type.

### Loophole 3: Timezone Misalignment
**Issue:** Using `new Date().toISOString()` converts to UTC, which may result in a different calendar date than the student's local school timezone. A student reading at 11 PM in UTC-8 would have their activity logged to the next UTC day.

**Mitigation:**
- Use the **client's local timezone** to determine the session date: `new Date().toISOString().split('T')[0]` returns the UTC date, which is incorrect.
- **Fix:** Pass the local date string explicitly: 
  ```typescript
  const today = new Date();
  const dateString = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
  ```
- **Action:** Add a utility function `getLocalDateString()` and use it consistently across all session updates.

### Loophole 4: Network/Duplicate Report Uploads
**Issue:** If a student uploads the same report twice (due to network retry), both will update the daily session, causing double-counting.

**Mitigation:**
- Add an **idempotency key** to each `miscueReports` document: a unique hash or `reportId` field. Before updating the daily session, check if we've already processed this `reportId` today.
- Store processed `reportIds` in the daily session: `processedReportIds: [...]`.
- **Action:** Before calling `updateDailySession()`, verify the `reportId` is not already in `processedReportIds`.

### Loophole 5: Missing Firestore Index Setup
**Issue:** Adding the compound index via `firestore.indexes.json` requires deployment. Some developers might forget this step, causing slow queries.

**Mitigation:**
- Document the Firestore index setup in the deployment checklist.
- **Fallback:** If the index is not deployed, queries will still work but may be slow. Add a console warning in development.
- **Action:** Include clear instructions for creating the index via Firebase Console.

### Loophole 6: First-Time / Historical Data Users
**Issue:** If this feature is added to an existing app with months of reading data, the analytics will only show data from the implementation date forward. Old activity won't be visible.

**Mitigation:**
- This is acceptable for a phased rollout. Add a note in the UI: "Analytics begin tracking from [implementation date]."
- **Optional:** Build a one-time backfill script (separate tool) to aggregate historical `miscueReports` into daily sessions retroactively.
- **Action:** Document this as a known limitation.

### Loophole 7: Concurrent Updates on Same Day Session
**Issue:** If a student performs two reading activities simultaneously (unlikely but possible in race conditions), both could try to update the same day document at the same time.

**Mitigation:**
- Firebase's atomic operations (`increment()`, `arrayUnion()`) handle concurrent writes correctly. No action needed.
- Each update is a single write operation, so Firebase's transaction semantics guarantee consistency.
- **Action:** No mitigation needed; Firebase handles this natively.

### Loophole 8: School Year Boundary Edge Case (April-May)
**Issue:** April and May are treated as part of the previous school year. But what if the school is not operating or has a different calendar?

**Mitigation:**
- This is by design per the requirement: "June 1 to March 31" is the school year boundary.
- If the school has exceptions, we can parameterize the `getSchoolYear()` logic or add a school-specific configuration.
- **Action:** Document the school year rule clearly and allow for future customization if needed.

### Loophole 9: Missing or Malformed Recording Duration
**Issue:** If `recordingDuration` is `null`, `undefined`, or malformed (not in MM:SS format), the parsing will fail.

**Mitigation:**
- Add strict validation in the duration parsing logic:
  ```typescript
  const parseRecordingDuration = (durationStr: string | undefined): number => {
    if (!durationStr || typeof durationStr !== 'string') return 0;
    const [mins, secs] = durationStr.split(':').map(Number);
    if (isNaN(mins) || isNaN(secs)) return 0;
    return (mins * 60) + secs;
  };
  ```
- **Action:** Add this validation function and use it consistently.
