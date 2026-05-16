# Student_History.tsx - Enhanced Architecture Plan
## 4-Tab Structure: Progress, Sessions, Analytics & History

---

## Overview

Transform `Student_History.tsx` into a comprehensive 4-tab screen, aligning with the new analytics documentation:
- **Tab 1: Progress (formerly Kasaysayan)** — Overall curriculum completion (aralin-grouped history, alphabet/word mastery summaries).
- **Tab 2: Sessions (NEW)** — Deep-dive into Alphabet and Word mastery sessions.
- **Tab 3: Analytics (formerly Pagganap)** — Performance analytics dashboard (Accuracy, Speed, Miscues).
- **Tab 4: History (formerly Mga Talata)** — Passage attempts and miscue breakdown per reading session.

The tabs will:
- Share a single data-fetching layer (caching to minimize reads)
- Use slide animation when switching
- Separate word/alphabet analytics into the "Sessions" tab from passage analytics in "Analytics"

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Student_History.tsx (Main Container)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Tab Switcher (Progress | Sessions | Analytics | History)│
│  │                                                           │
│  ├─ Content Layer (Slides between tabs)                     │
│  │                                                           │
│  ├─ TAB 1: PROGRESS (Old Kasaysayan)                        │
│  │  ├─ Hero Cards (aralinDone, etc.)                        │
│  │  └─ Grouped Aralin Cards / Curriculum Completion         │
│  │                                                           │
│  ├─ TAB 2: SESSIONS (NEW)                                   │
│  │  ├─ Alphabet Mastery Tracking                            │
│  │  └─ Word Mastery Analytics (Moved from old Performance)  │
│  │                                                           │
│  ├─ TAB 3: ANALYTICS (Old Pagganap)                         │
│  │  ├─ Filter Pill Selector (Linggo | Buwan | Taon)         │
│  │  ├─ Reading Time Activity (Bar Chart)                    │
│  │  ├─ Speed & Accuracy (Gauges + Line)                     │
│  │  └─ Miscue Insights (Donut + Lists)                      │
│  │                                                           │
│  └─ TAB 4: HISTORY (Old Mga Talata)                         │
│     ├─ Summary Stats Bar (Passages, Attempts, WPM, Acc)     │
│     └─ Expandable Passage Cards (List of attempts & miscues)│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Caching Strategy (Minimize Database Reads)
```
State Variables:
├─ cachedAnalyticsData: { [filter: string]: AnalyticsData }  // Cache by filter
├─ cachedSessionData: { [filter: string]: SessionData[] }    // Cache sessions
├─ wordMasteryData: WordMasterySnapshot                      // Static per reload
├─ activeFilter: 'Week' | 'Month' | 'Year'                   // Current selection
└─ lastFetchTime: number                                      // Track freshness
```

**Fetch Rules:**
1. **On screen mount:** Fetch all analytics (Week, Month, Year) in parallel → cache
2. **On filter change:** Return from cache (no DB read)
3. **On tab switch (History ↔ Performance):** Use cached data (no re-fetch)
4. **On screen re-open:** Re-fetch all data (to catch new reading sessions)

---

## TAB 1: HISTORY (Existing)

### Structure (No Changes)
- Hero cards (aralinDone, assessmentsDone removed per user request)
- Filter toggle removed (only on Performance tab)
- Aralin-grouped cards with passage, word, alphabet activities
- Existing collapsed/expanded logic preserved

### Hero Section Simplification
```
┌─────────────────────────────────────────────┐
│  "Magandang araw, [Name]!"                  │
│  Kasaysayan ng Iyong Pagbabasa               │
│  ┌─────────────────────────────────────────┐│
│  │ Aralins Done: X                         ││
│  │ Total Attempts: Y                       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## TAB 2: PASSAGE HISTORY (NEW)

### Structure
- Displays all passages the student has attempted, ordered historically.
- Provides a summary stats bar: total passages, attempts, avg accuracy, best WPM.
- Each passage behaves as an expandable card.
- Expanding a passage shows a chronological list of ALL attempts.
- Each attempt card displays:
  - Attempt # and Date
  - Acc %, WPM, Duration, Total Miscues
  - If miscues > 0, an organized "Miscue Breakdown" showing Substitution, Omission, Insertion, and Repetition with badged tags.
  - If 0 miscues, a "Perfect reading" badge logic.

### Design Layout Layout & empty state
```
┌─────────────────────────────────────────────────────────────┐
│  [ 📚 Empty State ] (If no reading history yet)             │
│  "No Reading History Yet. Start reading..."                 │
│  [ Start Reading Button ]                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Stats Bar                                                  │
│  [ X Passages ] | [ Y Attempts ] | [ Z% Avg Acc ] | [ W WPM]│
│                                                             │
│  "Your Reading Sessions"                                    │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │ 📖 [Passage Title]           Attempts: X│ ▼              │
│  └─────────────────────────────────────────┘                │
│   (If Expanded):                                            │
│   ┌───────────────────────────────────────┐                 │
│   │ Date | Attempt #1                     │                 │
│   │ Acc: % | WPM: X | Dur: X | Miscues: X │                 │
│   │ ├─ [Substitution] text...             │                 │
│   │ └─ [Omission]     text...             │                 │
│   └───────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Structure & Implementation Plan

### Architecture Diagram: Data Flow Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React Components)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Student_History.tsx (Main Container)                               │
│    ├─ Student_History_Passage_Tab.tsx (NEW)                         │
│    │   ├─ Stats Bar (Total Passages, Attempts, Avg Acc, Best WPM)  │
│    │   └─ Passage List (Chronological attempts per passage)         │
│    ├─ Student_History_Performance_Tab.tsx                           │
│    │   ├─ Section 1: Word Mastery (Layers 1-4)                     │
│    │   │   └─ Consumes: use_StudentWordMastery()                   │
│    │   ├─ Subsection 2A: Reading Time Chart                        │
│    │   │   └─ Consumes: use_StudentReadingTime()                   │
│    │   ├─ Subsection 2B: Speed & Accuracy                          │
│    │   │   └─ Consumes: use_StudentAccuracySpeedTrends()           │
│    │   └─ Subsection 2C: Miscue Insights                           │
│    │       ├─ Consumes: use_StudentMiscueStats()                   │
│    │       └─ Consumes: use_StudentTopMiscuePassageAndWords()       │
│    │                                                                 │
├─────────────────────────────────────────────────────────────────────┤
│  HOOKS LAYER (Data State Management & Caching)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Hook File Location: src/Hooks/                                     │
│                                                                      │
│  ├─ use_StudentAnalytics.ts                                         │
│  │   ├─ fetchAnalyticsData(studentId, filter)                      │
│  │   ├─ Caches by filter key (Week/Month/Year)                     │
│  │   └─ Returns aggregated dailySessions                           │
│  │                                                                   │
│  ├─ use_StudentWordMastery.ts                                       │
│  │   ├─ getCompletedAlphabets(studentId)                           │
│  │   ├─ getCompletedWords(studentId, letter)                       │
│  │   ├─ getMasteryProgress(studentId)                              │
│  │   └─ Caches: wordMasteryData (static per reload)                │
│  │                                                                   │
│  ├─ use_StudentReadingTime.ts                                       │
│  │   ├─ fetchReadingSessionsByPeriod(studentId, filter)            │
│  │   └─ Aggregates: passagesReadCount from dailySessions           │
│  │                                                                   │
│  ├─ use_StudentAccuracySpeedTrends.ts                               │
│  │   ├─ fetchTrendData(studentId, filter)                          │
│  │   ├─ calculateAvgAccuracy(), calculateAvgWPM()                  │
│  │   ├─ calculateTrendDirection()                                  │
│  │   └─ Aggregates: accuracySum, wpmSum by period                 │
│  │                                                                   │
│  ├─ use_StudentMiscueStats.ts                                       │
│  │   ├─ fetchMiscueBreakdown(studentId, filter)                    │
│  │   ├─ Aggregates: miscuesCount by type                           │
│  │   └─ Calculates: percentages, totals                            │
│  │                                                                   │
│  └─ use_StudentTopMiscuePassageAndWords.ts                          │
│      ├─ fetchTopMiscuePassage(studentId, filter)                   │
│      ├─ fetchMostMiscuedWords(studentId, filter)                   │
│      └─ Ranks by error count & passage accuracy                    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  CONTROLLER LAYER (Data Fetching & Aggregation)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MiscueReportController.ts (src/Controller/)                        │
│                                                                      │
│  EXISTING METHODS:                                                  │
│  ├─ storeReport() — saves raw miscue reports (already exists)       │
│  ├─ storeWordCorrectAttempt() — tracks word mastery (already exists)│
│  ├─ storeAlphabetCorrectAttempt() — tracks alphabet mastery        │
│  ├─ getStudentReports() — fetches all reports (already exists)      │
│  ├─ getStudentReadingStats() — basic stats (already exists)         │
│  └─ getStudentProgressOverTime() — trends (already exists)          │
│                                                                      │
│  NEW METHODS TO ADD:                                                │
│  ├─ getAnalyticsSessions(studentId, filter)                        │
│  │   └─ Returns: dailySessions docs aggregated by filter            │
│  │                                                                   │
│  ├─ getWordMasteryData(studentId)                                   │
│  │   ├─ Fetches: completedAlpha, completedWords, completedPassages │
│  │   └─ Returns: { completedAlpha: Set, completedWords: Map, ... } │
│  │                                                                   │
│  ├─ calculateReadingTimeAnalytics(studentId, filter)                │
│  │   ├─ Aggregates: passagesReadCount from dailySessions            │
│  │   └─ Groups: by day/week/month per filter                       │
│  │                                                                   │
│  ├─ calculateAccuracySpeedTrends(studentId, filter)                 │
│  │   ├─ Aggregates: accuracySum, wpmSum by period                 │
│  │   ├─ Calculates: averages, trends, peak values                  │
│  │   └─ Returns: { chartData[], avgAccuracy, avgWPM, trend, ... }  │
│  │                                                                   │
│  ├─ calculateMiscueBreakdown(studentId, filter)                     │
│  │   ├─ Sums: miscuesCount.substitution/omission/insertion/rep      │
│  │   ├─ Calculates: percentages per type                           │
│  │   └─ Returns: { miscueData[], total, percentages }              │
│  │                                                                   │
│  ├─ getTopMiscuePassage(studentId, filter)                          │
│  │   ├─ Finds: passage with highest miscue count                   │
│  │   ├─ Calculates: accuracy %, attempts, miscue count             │
│  │   └─ Returns: { title, accuracy, attempts, miscues }            │
│  │                                                                   │
│  └─ getMostMiscuedWords(studentId, filter, limit=5)                 │
│      ├─ Ranks: words by error count descending                      │
│      ├─ Determines: dominant miscue type per word                   │
│      └─ Returns: { word[], errorCount[], dominantMiscueType[] }    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  DATA LAYER (Firebase)                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Collections:                                                       │
│  ├─ miscueReports/{reportId} — Raw reading sessions                │
│  ├─ studentAnalytics/{studentId}/dailySessions/{YYYY-MM-DD}        │
│  │   └─ Aggregated: wordsCompletedCount, passagesReadCount, etc.   │
│  ├─ alphabetCompleted/{alphaId} — Alphabet mastery tracking        │
│  ├─ wordCompleted/{wordId} — Word mastery tracking                 │
│  └─ readingMaterialData — Lookup for total available words/letters │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Detailed Function Specifications by UI Section

#### SECTION 1: WORD MASTERY ANALYTICS

**Layer 1 & 2: Overall Status + Progress Bar**
- **Function:** `MiscueReportController.getWordMasteryData(studentId)`
  - Fetches: `completedAlpha` (Set), `completedWords` (Map by letter)
  - Returns: Counts for "Natutuhan", "Bagong", "Sinusubukan"
  
- **Hook:** `use_StudentWordMastery(studentId)`
  - Caches: `wordMasteryData` (static, fetched once at screen mount)
  - Returns: Mastery percentages, completion counts

**Layer 3: Letter Selector**
- **Function:** `MiscueReportController.getWordMasteryData(studentId)` (reuse)
  - Already returns `completedAlpha` Set
  
- **Hook:** `use_StudentWordMastery(studentId)` (reuse)
  - Maps to: [A, B, K, L, M*,...] pills with completed indicators

**Layer 4: Word Grid (Progressive Detail)**
- **Function:** `MiscueReportController.getStudentReports(studentId)`
  - Fetches: All historical reports to check word accuracy
  - Filters: By selected letter
  
- **Subcomponent:** `WordMasteryGrid.tsx`
  - Consumes: `use_StudentWordMastery()` hook
  - Displays: 4-column grid with mastery state (✓/✗/—)
  - On tile tap: Shows word session history

---

#### SUBSECTION 2A: READING TIME ACTIVITY (BAR CHART)

**Data Aggregation:**
- **Function:** `MiscueReportController.calculateReadingTimeAnalytics(studentId, filter)`
  - Reads: `studentAnalytics/{studentId}/dailySessions/{YYYY-MM-DD}` collection
  - Groups: By day (Week), week (Month), month (Year)
  - Aggregates: `passagesReadCount` per group
  - Returns: `[{ label, count }, ...]` and `totalSessions` (sum of counts)

**Caching:**
- **Hook:** `use_StudentReadingTime(studentId, filter)`
  - Calls: `calculateReadingTimeAnalytics()` on mount
  - Caches: By filter key (Week/Month/Year)
  - Returns: `{ data: Array<{label, count}>, totalSessions, loading, error }`

**Subcomponent Visualization:**
- **Component:** `ReadingTimeChart.tsx`
  - Consumes: `use_StudentReadingTime()` hook
  - Visual: Vertical bar chart built with `View` + `StyleSheet` (no third-party libraries)
  - **Layout:**
    - Title: "Oras ng Pagbasa ng Mga Talata" (Font: Poppins)
    - Header Accessory: Small blue pill showing "Total: X sessions"
    - Bar Container: Uses `onLayout` to calculate equal width for each bar
    - Bars: Primary blue (#3B7FC9), borderTopLeftRadius: 6, borderTopRightRadius: 6
    - Bar Height: Max height 80px (normalized: `(count / maxCount) * 80`)
    - Min Height: 4px (if count > 0, otherwise 0/invisible)
    - X-Axis: Centered labels below bars (Mon, Wk 1, Jan, etc.)
  - **Constraints:**
    - No `readingDurationSeconds` usage
    - No animations
    - No Y-axis lines or numeric labels
    - No `react-native-gifted-charts`

**States:**
- **Loading:** ActivityIndicator + "Loading reading data..."
- **Error:** Red card with ⚠️ icon + "Failed to load reading data"
- **Empty:** 📚 emoji + "Walang aktibidad sa panahong ito."

---

#### SUBSECTION 2B: SPEED & ACCURACY ANALYTICS

**Layer 2: Summary Strip (Metrics)**
- **Function:** `MiscueReportController.calculateAccuracySpeedTrends(studentId, filter)`
  - Reads: `dailySessions` aggregated by period
  - Calculates:
    - `avgAccuracy = accuracySum / passageAttempts * 100`
    - `avgWPM = wpmSum / passageAttempts`
    - `trendDelta = lastAccuracy - firstAccuracy`
    - `trendDirection = 'up' | 'down' | 'same'`
  - Returns: `{ avgAccuracy, avgWPM, trendDelta, trendDirection }`

**Layer 3: Bar Breakdown (Timeline)**
- **Function:** `MiscueReportController.calculateAccuracySpeedTrends(studentId, filter)` (reuse)
  - Returns: Full `chartData[]` with date, accuracy, wpm per point
  - Identifies: Peak accuracy row (for bold highlighting)

**Layer 4: Insight Pill (Interpretation)**
- **Hook:** `use_StudentAccuracySpeedTrends(studentId, filter)`
  - Calls: `calculateAccuracySpeedTrends()`
  - Caches: By filter key
  - Returns: All metrics + trend interpretation

**Subcomponent:**
- **Component:** `AccuracySpeedChart.tsx`
  - Consumes: `use_StudentAccuracySpeedTrends()` hook
  - Displays:
    - Summary strip (Layer 2)
    - Bar breakdown with dual bars (Layer 3)
    - Insight pill with trend color (Layer 4)
  - X-axis: Date labels
  - Y-axis: Accuracy %, WPM (normalized)

---

#### SUBSECTION 2C: MISCUE INSIGHTS

**Layer 2: Miscue Type Breakdown**
- **Function:** `MiscueReportController.calculateMiscueBreakdown(studentId, filter)`
  - Reads: `dailySessions` → `miscuesCount` by type
  - Aggregates: Sum substitution, omission, insertion, repetition
  - Calculates: Percentages, totals, max count for normalization
  - Returns: `{ miscueData: [{type, count, percentage}], total }`

**Layer 3: Top Miscued Passage**
- **Function:** `MiscueReportController.getTopMiscuePassage(studentId, filter)`
  - Reads: `miscueReports` filtered by date range
  - Groups: By passage title
  - Finds: Passage with highest miscue count
  - Calculates: `accuracy = accuracySum / attempts`, `miscuesTotal`
  - Returns: `{ title, accuracy, attempts, miscues }`

**Layer 4: Most Miscued Words**
- **Function:** `MiscueReportController.getMostMiscuedWords(studentId, filter, limit=5)`
  - Reads: `miscueReports` → `miscues[]` array per report
  - Groups: By word (expectedWord or spokenWord)
  - Ranks: By error count descending
  - Determines: Dominant miscue type per word
  - Returns: `{ word[], errorCount[], dominantMiscueType[] }`

**Caching:**
- **Hook 1:** `use_StudentMiscueStats(studentId, filter)`
  - Calls: `calculateMiscueBreakdown()`
  - Caches: By filter key
  - Returns: Miscue breakdown data

- **Hook 2:** `use_StudentTopMiscuePassageAndWords(studentId, filter)`
  - Calls: `getTopMiscuePassage()` + `getMostMiscuedWords()`
  - Caches: By filter key
  - Returns: { topPassage, topWords }

**Subcomponent:**
- **Component:** `MiscueInsights.tsx`
  - Consumes: `use_StudentMiscueStats()` + `use_StudentTopMiscuePassageAndWords()` hooks
  - Displays:
    - Bar breakdown chart (Layer 2)
    - Top passage card (Layer 3)
    - Ranked words list (Layer 4)

---

### File Structure & Organization

```
src/
├─ Controller/
│  └─ MiscueReportController.ts (MODIFY & EXTEND)
│     ├─ New: getAnalyticsSessions(studentId, filter)
│     ├─ New: getWordMasteryData(studentId)
│     ├─ New: calculateReadingTimeAnalytics(studentId, filter)
│     ├─ New: calculateAccuracySpeedTrends(studentId, filter)
│     ├─ New: calculateMiscueBreakdown(studentId, filter)
│     ├─ New: getTopMiscuePassage(studentId, filter)
│     ├─ New: getMostMiscuedWords(studentId, filter, limit)
│     └─ Existing: storeReport(), getStudentReports(), etc.
│
├─ Hooks/
│  ├─ use_StudentAnalytics.ts (NEW)
│  │  └─ fetchAnalyticsData(studentId, filter)
│  │
│  ├─ use_StudentWordMastery.ts (NEW)
│  │  └─ getCompletedAlphabets(), getCompletedWords(), getMasteryProgress()
│  │
│  ├─ use_StudentReadingTime.ts (NEW)
│  │  └─ fetchReadingTimeByPeriod(studentId, filter)
│  │
│  ├─ use_StudentAccuracySpeedTrends.ts (NEW)
│  │  └─ fetchTrendData(studentId, filter)
│  │
│  ├─ use_StudentMiscueStats.ts (NEW)
│  │  └─ fetchMiscueBreakdown(studentId, filter)
│  │
│  └─ use_StudentTopMiscuePassageAndWords.ts (NEW)
│     └─ fetchTopMiscuePassage(), fetchMostMiscuedWords()
│
├─ Screens/
│  ├─ Student/
│  │  └─ Student_History.tsx (MODIFY)
│  │     ├─ Add Passage History and Performance tab structure
│  │     ├─ Add filter state management
│  │     ├─ Add caching logic
│  │     └─ Render subcomponents
│  │
│  └─ Components/ (NEW SUBCOMPONENTS)
│     ├─ PassageHistoryTab.tsx
│     │  └─ Handles the Passage history stats and expanding list
│     │
│     ├─ WordMasterySection.tsx
│     │  └─ Layers 1-4 for word mastery progressive disclosure
│     │
│     ├─ ReadingTimeChart.tsx
│     │  └─ Custom vertical bar chart for passage sessions
│     │
│     ├─ AccuracySpeedChart.tsx
│     │  ├─ Summary strip (metrics)
│     │  ├─ Bar breakdown (timeline)
│     │  └─ Insight pill (trend)
│     │
│     └─ MiscueInsights.tsx
│        ├─ Miscue breakdown (horizontal bars)
│        ├─ Top passage card
│        └─ Top words ranked list
│
└─ Utilities/
   └─ analyticsHelpers.ts (OPTIONAL)
      ├─ filterByDateRange(data, filter)
      ├─ getSchoolYear(date)
      ├─ getLocalDateString(date)
      └─ parseRecordingDuration(durationStr)
```

---

### Data Flow Example: Filter Change (Week → Month)

```
1. User taps "Buwan" pill
   └─ State: activeFilter = 'Month'

2. Student_History.tsx triggers re-render
   └─ All consumer hooks observe filter change

3. Hook: use_StudentReadingTime('Month')
   └─ Check cache['Month'] → exists? return cached : fetch
   └─ Call: MiscueReportController.calculateReadingTimeAnalytics(studentId, 'Month')
   └─ Update cache['Month'] = result
   └─ Component re-renders with new data

4. Subcomponent: ReadingTimeChart.tsx
   └─ Receives updated props from hook
   └─ Chart re-animates with new data points
   └─ X-axis: Mon-Sun → Wk 1-5
   └─ Y-axis: Rescales to new max duration

5. Same flow for all other hooks:
   └─ use_StudentAccuracySpeedTrends('Month')
   └─ use_StudentMiscueStats('Month')
   └─ use_StudentTopMiscuePassageAndWords('Month')

6. Cache prevents re-fetching on History → Performance tab switch
   └─ Data remains in memory, no DB read
```

---

### Caching Strategy Implementation

**Cache Structure in Student_History.tsx State:**
```
{
  analyticsCache: {
    'Week': { data: [...], timestamp: Date },
    'Month': { data: [...], timestamp: Date },
    'Year': { data: [...], timestamp: Date }
  },
  wordMasteryCache: {
    data: { completedAlpha, completedWords },
    timestamp: Date,
    expiry: 'screen lifecycle' // Only reload on screen re-open
  }
}
```

**Fetch on Mount (Parallel):**
- Trigger all 6 hooks simultaneously
- Each hook checks cache → fetch if missing
- Load spinners show during initial load (< 2 seconds typical)

**Filter Change (Instant):**
- Check cache[activeFilter]
- If exists: Return immediately (no DB read)
- If missing: Fetch in background with loading indicator

**Tab Switch (Instant):**
- No re-fetch (cache still valid)
- Slide animation plays while showing cached data

**Screen Close / Re-open:**
- Invalidate all caches
- On re-open: Re-fetch from scratch (catches new data)

---

### Error Handling Plan

**Per Hook Error State:**
```
Loading: ActivityIndicator + "Loading [section name]..."
Error: Red card with ⚠️ icon + error message + "Retry" button
Empty: Centered message + emoji (e.g., "No data for this period")
```

**Retry Logic:**
- Each hook has `retry()` function
- Clears cache entry for that filter
- Re-fetches from database

**Fallback Behavior:**
- If analytics endpoints fail: Show cached data if available
- If all data missing: Show empty state (not error, but graceful)

---

**Ready to proceed with code generation once you approve this plan.** Say "execute" to begin implementing these functions, hooks, and subcomponents.

---

## TAB 3: PERFORMANCE (NEW)

### Top: Filter Selector
```
┌─────────────────────────────────────────────────────────┐
│  Piliin ang Panahon:  [ Linggo ] [ Buwan ] [ Taon ]     │
│                       (Active = filled gradient blue)   │
└─────────────────────────────────────────────────────────┘
```

**Behavior:**
- Pills update on tap
- Re-populate all charts/sections immediately from cached data
- Default: "Linggo" (Week)
- Whichever filter has the most data is selected on first load

---

## SECTION 1: WORD MASTERY ANALYTICS

### Design Principle: Progressive Disclosure (WordMasteryPlan Style)

Following "One layer = One question":

---

### Layer 1: Overall Status
**Question:** "How many words has the student mastered in this period?"

```
┌─────────────────────────────────────────────────┐
│  Mga Salitang Natutuhan sa [Week/Month/Year]   │
│  Natutuhan: 42 | Bagong: 15 | Sinusubukan: 8   │
└─────────────────────────────────────────────────┘
```

**Data Mapping:**
- Fetch from `dailySessions` aggregated over the period
- Count unique words in `alphabetsCompleted` (NEW only, not retries)
- Calculate totals from `wordsCompletedCount`

---

### Layer 2: Mastery Progress Bar
**Question:** "What percentage of all available words has been mastered?"

```
┌─────────────────────────────────────────────────┐
│  Pag-unlad:  [████████░░░░░░░░░░░░]  74%       │
└─────────────────────────────────────────────────┘
```

**Specs:**
- Single animated fill bar (spring animation from 0% → actual)
- Percentage number on the right
- No caption sentence below
- Color: Green (85%+), Amber (60-85%), Red (<60%)

**Data Mapping:**
- `masteredWords / totalAvailableWords * 100`
- totalAvailableWords = sum of all words across all letters in the readingMaterialData

---

### Layer 3: Letter Selector (Progressive Disclosure Trigger)
**Question:** "Which letter (Aralin) do you want to examine?"

```
┌──────────────────────────────────────────────────────────┐
│  [ A ] [ B ] [ K ] [ L ] [ M* ] [ N ] [ S ] [ T ] [ U ]  │
│                     ↑ Active pill (dark fill)             │
│         * = green dot (completed)                         │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Horizontal scrollable row of pills
- Active pill: Solid fill with primary blue (#3d71d9)
- Completed letter: Small green checkmark or dot on pill
- Tap to select letter → **expands to Layer 4**

**Data Mapping:**
- List all 30 letters from `readingMaterialData.Alphabet`
- Completed status from `wordMasteryData.completedAlpha` (fetched once at startup)
- Default selected: First letter with NEW activity this period

---

### Layer 4: Word Mastery Grid (Tap-to-Expand / Progressive Detail)
**Question:** "Which specific words for this letter did the student master, miss, or not try?"

**Trigger:** User taps a letter pill → grid appears below (slide-in animation)

```
┌────────────────────────────────────────────────────────┐
│  Titik M (Letter M)                                     │
│  Natutuhan: 3   Nagkamali: 2   Hindi pa: 5             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │  Mama  │ │  Mano  │ │  Masa  │ │  Mais  │         │
│  │   ✓    │ │   ✓    │ │   ✗    │ │   —    │         │
│  │ Green  │ │ Green  │ │ Red    │ │ Gray   │         │
│  └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │  Milo  │ │  Mate  │ │  Muro  │ │  Muka  │         │
│  │   ✗    │ │   —    │ │   —    │ │   —    │         │
│  │ Red    │ │ Gray   │ │ Gray   │ │ Gray   │         │
│  └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Tile States:**
- **Green Tile (✓):** Word mastered by student (100% accuracy across attempts)
- **Red Tile (✗):** Word attempted but not mastered (< 100% accuracy)
- **Gray Tile (—):** Word not attempted yet

**Specs:**
- 4 columns × N rows (responsive to screen width)
- Each tile: 64x64dp with word name below icon
- Tiles animate in: spring scale-in, staggered 25ms per tile
- Header shows count chips: "Natutuhan: 3  Nagkamali: 2  Hindi pa: 5"
- **Tap tile:** Show session history for that word (mini modal or slide-up)

**Data Mapping:**
- Get words for selected letter from `readingMaterialData.Words`
- Check `wordMasteryData.completedWords[letter]` for mastered words
- Check historical reports for failed attempts (accuracy < 100%)
- Remaining words = not attempted

---

### Word Mastery Summary (Side-by-side with grid, optional)
If space allows, show a small sidebar:
```
┌──────────────────┐
│ Titik M Snapshot │
├──────────────────┤
│ Natutuhan: 3/10  │
│ Progress: [███░] │
│ 30%              │
└──────────────────┘
```

---

## SECTION 2: PASSAGE ANALYTICS

All subsections use the same **filter state** (Week/Month/Year) selected at the top.

---

### Subsection 2A: Reading Time Activity (Bar Chart)

**Question:** "How many passages did the student read in this period?"

```
┌────────────────────────────────────────────────────────────┐
│  Oras ng Pagbasa ng Mga Talata          [ Total: X sess ]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│          ┌──┐                                              │
│          │  │        ┌──┐                                  │
│    ┌──┐  │  │  ┌──┐  │  │                                  │
│    │  │  │  │  │  │  │  │                                  │
│  ──┴──┴──┴──┴──┴──┴──┴──┴───────────────────               │
│    Mon   Tue   Wed   Thu   Fri   Sat   Sun                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Specs:**
- **Type:** Custom Bar Chart (View-only)
- **Primary Metric:** `passagesReadCount` from `dailySessions`
- **Color:** #3B7FC9 (Primary Blue)
- **Bar Shape:** Rounded top corners (6)
- **Max Height:** 80px (Normalized based on highest count in set)
- **States:** 
  - Loading: ActivityIndicator
  - Error: Red card styling
  - Empty: 📚 emoji + "Walang aktibidad sa panahong ito."
- **Constraints:** No duration logic, no third-party libraries, no Y-axis labels.

---

### Subsection 2B: Speed & Accuracy Analytics

**Title:** "Accuracy & Speed"

**Question:** "Is the student reading faster and more accurately over time?"

#### Layer 1: Time Range Tabs (Accuracy & Speed)
- Three pill buttons: Week | Month | Year
- Active tab = filled (primary color background, white text)
- Inactive tab = text only (primary color text, transparent bg)
- Contained in a rounded background track
- Synchronized with the filter selector at the top of Performance tab

---

#### Layer 2: Summary Strip (Key Metrics)

```
┌────────────────────────────────────────────┐
│  Avg Accuracy: 82%  |  Avg WPM: 68  |  ▲ 5% │
└────────────────────────────────────────────┘
```

**Specifications:**
- Three metrics separated by vertical dividers:
  - **Avg Accuracy %:** Computed from `accuracySum / passageAttempts * 100`
  - **Avg WPM:** Computed from `wpmSum / passageAttempts`
  - **Trend (Δ%):** Computed as `(lastAccuracy - firstAccuracy) / firstAccuracy * 100`
- **Trend Arrow Color:**
  - ▲ Green (#2CA96A): accuracy improved
  - ▼ Red (#EF4444): accuracy dropped
  - — Gray (#6B7280): no change (< 1% difference)
- All text: Primary blue, bold weight
- Centered layout with consistent spacing

---

#### Layer 3: Bar Breakdown (Detailed Timeline)

```
┌────────────────────────────────────────────────────────────┐
│  Legend: ● Accuracy   ● Speed (WPM)                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Mon  [████████░░░░]  85.0%                              │
│       [█████░░░░░░░░░░░░░░░░░░░░]  48                    │
│                                                            │
│  Tue  [███████░░░░░]  84.0%      ← Regular row           │
│       [███████░░░░░░░░░░░░░░░░░]  42                     │
│                                                            │
│  Wed  [███████████░░]  91.0%     ← Peak row (bold)       │
│       [██████████░░░░░░░░░░░░░░]  52                     │
│                                                            │
│  Thu  [██████░░░░░░]  80.0%                              │
│       [█████░░░░░░░░░░░░░░░░░░░]  40                     │
│                                                            │
│  Fri  [████████░░░░]  83.0%                              │
│       [████░░░░░░░░░░░░░░░░░░░░]  35                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Row Structure:**
- **Date Label:** Fixed width (e.g., "Mon", "Wk 1", "Jun")
  - Peak row: **bold** label (day/week/month with highest accuracy)
- **Bar 1 - Accuracy:**
  - Default color: Light blue (#c0e8f2)
  - Peak row: Primary blue (#3B7FC9) — highlights best performance
  - Bar fills left-to-right from 0-100%
  - Value label on right: "85.0%" or "—" if no data
- **Bar 2 - Speed (WPM):**
  - Color: Amber background (#FEF3C7)
  - Fills left-to-right normalized against `maxWpm` in the dataset
  - Value label on right: "48" or "—" if no data
  - Text color for value: Amber (#F59E0B)
- **Row Separators:** Thin bottom border between rows
  - Last row: No border

**Legend (Above breakdown):**
```
● Accuracy   ● Speed (WPM)
```
- Two colored dots with labels
- Centered above the card
- One line only

**Data Mapping:**
- Fetch from `dailySessions` (aggregated by day/week/month per filter)
- Accuracy = `accuracySum / passageAttempts` per period
- WPM = `wpmSum / passageAttempts` per period
- Peak = highest accuracy value across all periods
- For "Week": date labels = Mon, Tue, Wed...
- For "Month": date labels = Wk 1, Wk 2, Wk 3...
- For "Year": date labels = Jun, Jul, Aug, Sep... Ene, Feb, Mar

---

#### Layer 4: Insight Pill (Trend Interpretation)

```
┌────────────────────────────────────────────────────────────┐
│  ▲ Accuracy improved by 5% over this period.              │
└────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Colored pill with background matching trend direction
- **Up (Improvement):**
  - Background: Light green (#D4F1E8)
  - Text color: Green (#2CA96A)
  - Icon: ▲
  - Message: "Accuracy improved by X% over this period."
- **Down (Decline):**
  - Background: Light red (#FEE2E2)
  - Text color: Red (#EF4444)
  - Icon: ▼
  - Message: "Accuracy dropped by X%. Consider reviewing exercises."
- **Same (Consistent):**
  - Background: Light gray (#F3F8FF)
  - Text color: Gray (#6B7280)
  - Icon: —
  - Message: "Reading accuracy remained consistent."
- Centered text, one sentence only
- No bullet points or multi-line analysis

**Logic:**
- Calculate `accDelta = lastAccuracy - firstAccuracy`
- If `accDelta >= 1`: Show "up" pill with `Math.round(accDelta)%`
- If `accDelta <= -1`: Show "down" pill with `Math.round(Math.abs(accDelta))%`
- If `-1 < accDelta < 1`: Show "same" pill

---

### Section Card Styling (2B)
- Background: White
- Border: 1px light blue (#D7E9FF)
- Border radius: 14px
- Padding: 20px inner spacing
- No shadow (border provides separation)
- Bottom margin: 24px from next section

---

### Subsection 2C: Miscue Insights

**Question:** "What reading errors is the student making, and which words/passages need practice?"

#### Layer 1: Section Title & Time Range Integration

**Title:** "Miscue Insights" — one line, plain text

**Time Range Sync:**
- Uses the same filter pills (Linggo | Buwan | Taon) selected at the top of the Performance tab
- No additional filter controls needed for this section
- Data reflects the active time period

---

#### Layer 2: Miscue Type Breakdown (Horizontal Bar Chart)

**Question:** "What kinds of errors is the student making?"

```
┌────────────────────────────────────────────────────────────┐
│  Common Miscue Types                                        │
│  [This Week · 24 total miscues]                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ● Substitution    [████████████░░░░░░░░░░░░]  12 (50%)  │
│                                                            │
│  ● Omission        [████████░░░░░░░░░░░░░░░░]   7 (29%)   │
│                                                            │
│  ● Repetition      [████░░░░░░░░░░░░░░░░░░░░]  3 (13%)   │
│                                                            │
│  ● Insertion       [██░░░░░░░░░░░░░░░░░░░░░░]  2 (8%)    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Row Structure (One per Miscue Type):**
- **Colored dot:** Matches the miscue type color
- **Type label:** "Substitution", "Omission", "Insertion", "Repetition"
- **Horizontal bar:** Fills left-to-right based on count proportion
  - Bar background: Light tint of the miscue color (e.g., light red for Substitution)
  - Bar fill: Vivid color for that type (see color mapping below)
  - **Normalization:** Bar length is relative to the HIGHEST count among the 4 types (not normalized to 100%)
- **Count label on right:** Vivid color (e.g., red for Substitution), displays raw count
- **Percentage on header:** Gray color, e.g., "50%"

**Miscue Type Colors (Fixed Across All Sections):**
```
Substitution → Red        (#eb5c6c bar / #FFEBEE background)
Omission     → Orange     (#FF9800 bar / #FFF3E0 background)
Insertion    → Blue       (#42A5F5 bar / #E3F2FD background)
Repetition   → Purple     (#AB47BC bar / #F3E5F5 background)
```

**Card Subtitle:** "[Time Range Name] · [N] total miscues"
- Example: "[This Week · 24 total miscues]"

**Empty State:**
- If `total === 0`:
  - Centered text: "No miscues recorded for this period 🎉"

**Data Mapping:**
- Fetch from `miscuesCount` aggregated across all `dailySessions` in the selected period
- Sort by count descending (highest miscue type first)
- Calculate percentage: `miscueCount / totalMiscues * 100`

---

#### Layer 3: Top Miscued Passage (Text Card)

**Question:** "Which reading passage causes the most errors?"

```
┌────────────────────────────────────────────────────────────┐
│  Top Miscued Passage                                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  "Ang Pamilya" (in italic bold, primary blue)             │
│                                                            │
│  Accuracy: 72%  |  Attempts: 3  |  Miscues: 8 (red)       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Content:**
- **Passage Title:** Displayed in italic, bold, primary blue (#3d71d9), enclosed in quotes
- **Metric Strip:** Three metrics separated by vertical dividers (below title)
  - **Accuracy %:** Calculated from passage-level `accuracySum / attempts`
    - Color: Text is default (gray/dark)
  - **Attempts:** Number of times this passage was attempted
    - Color: Text is default
  - **Miscues:** Raw count of miscues in this passage
    - **Color: RED (#EF4444)** — signals it's a problem metric

**Empty State:**
- If no passage data:
  - Centered text: "No passage data for this period"

**Data Mapping:**
- Fetch from passage-level analytics aggregated over the selected period
- Find passage with the HIGHEST miscue count
- Calculate accuracy from that passage's `accuracySum` and `passageAttempts`

---

#### Layer 4: Most Miscued Words (Ranked List)

**Question:** "Which specific words keep tripping the student up?"

```
┌────────────────────────────────────────────────────────────┐
│  Most Miscued Words                                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ① "malaki"  [Substitution]  ×8                           │
│                                                            │
│  ② "punong"  [Omission]      ×6                           │
│                                                            │
│  ③ "bahay"   [Substitution]  ×5                           │
│                                                            │
│  ④ "bata"    [Repetition]    ×3                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Row Structure (Top N words, e.g., top 5):**
- **Rank Circle:**
  - Small circle (32×32dp) containing rank number (1, 2, 3…)
  - Background: Light primary blue (#D7E9FF)
  - Text: Primary blue (#3d71d9), bold weight
- **Word:** Displayed in italic, bold, dark text, enclosed in quotes (e.g., `"malaki"`)
- **Dominant Miscue Type Badge:** Colored pill/badge
  - Background & text color: Match the miscue type color (vivid)
  - Example: Red pill for Substitution, Orange for Omission
  - Centered badge with padding
- **Count:** "×N" on the far right, gray color
  - Example: "×8" for 8 miscues

**Row Separators:**
- Thin bottom border between rows
- Last row: No border

**Empty State:**
- If no word data:
  - Centered text: "No word data for this period"

**Sorting:**
- Sort by `errorCount` descending (highest count first)
- Render in order received from hook (do NOT re-sort in component)

**Data Mapping:**
- Fetch from hook (to be created: `useStudentMiscueStats()`)
- Dominant miscue type = the most frequent miscue type for that word across all attempts
- Error count = total miscues for that word in the selected period

---

### States for Miscue Insights Section

**Loading State:**
- `ActivityIndicator` (spinner) centered
- Below: "Loading miscue insights…"
- Blocks all three subsections (2C-1, 2C-2, 2C-3) until data loads

**Error State:**
- Light red card with 1px red border
- Icon: ⚠️
- Message: Error message from hook
- Sub-label: "Failed to load miscue data"
- Displayed in place of content sections

**Empty States (Per Subsection):**
- Each subsection (breakdown, passage, words) has its own inline empty state
- Sections remain visible even when empty
- Only the content inside changes to empty message

---

### Section Card Styling (2C)
- Background: White
- Border: 1px light blue (#D7E9FF)
- Border radius: 14px
- Padding: 20px inner spacing
- **No shadow** (border provides separation)
- Bottom margin: 24px from next section

---

### Design Principles (Miscue Section)
- **Color Consistency:** Miscue type colors are fixed across all 3 subsections. A "Substitution" badge in Layer 4 must match the "Substitution" bar in Layer 2.
- **Clarity Over Decoration:** No shadows on bars or cards. Borders provide clean separation.
- **Actionability:** The ranked word list (Layer 4) is the most actionable output — teachers/parents can use it directly for targeted practice.
- **Independence:** Each layer answers one distinct question. Teachers should understand one layer without reading the others.

---

## Visual Separation & Layout

Each subsection should be **visually distinct** using:
- **Section Cards:** White background, rounded corners, subtle shadow
- **Section Titles:** Large bold text (24pt) in primary blue
- **Spacing:** 24dp vertical gap between sections
- **Borders:** Light gray divider line between sections (optional, for clarity)

### Example Layout Structure:
```
┌─────────────────────────────────────────┐
│ ┌─── Section 1: Word Mastery ───────┐  │
│ │ Layer 1: Status                     │  │
│ │ Layer 2: Progress Bar               │  │
│ │ Layer 3: Letter Selector            │  │
│ │ Layer 4: Word Grid (tap to expand)  │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ ┌─── Section 2: Passage Analytics ──┐  │
│ │ 2A: Reading Time Area Chart        │  │
│ │                                     │  │
│ │ 2B: Speed & Accuracy (Gauges)      │  │
│ │                                     │  │
│ │ 2B: Trend Line Chart               │  │
│ │                                     │  │
│ │ 2C: Miscue Breakdown (Donut)       │  │
│ │                                     │  │
│ │ 2C: Top Miscued Words (List)       │  │
│ │                                     │  │
│ │ 2C: Top Struggling Passages (List) │  │
│ └─────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

---

## Implementation Architecture & Data Flow

### Database Schema & Optimization

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

**Purpose:** Aggregated daily session documents minimize Firebase read costs. Instead of fetching hundreds of raw completion records, we read pre-aggregated metrics from one document per day.

**Firestore Index (`firestore.indexes.json`):**
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

---

### School Year Logic

The Year metric uses the academic calendar: **June 1 to March 31**

```typescript
export const getSchoolYear = (date: Date): string => {
  const month = date.getMonth(); // 0 = Jan, 5 = Jun
  const year = date.getFullYear();

  // If June (5) to December (11), it belongs to "CurrentYear-NextYear"
  if (month >= 5) {
    return `${year}-${year + 1}`;
  }
  // If January (0) to May (4), it belongs to "PreviousYear-CurrentYear"
  else {
    return `${year - 1}-${year}`;
  }
};
```

---

### Data Capture Integration (MiscueReportController)

Modify `src/Controller/MiscueReportController.ts` to hook `updateDailySession()` into existing methods:

**Helper Method:**
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

**Integration Points:**
- **`storeAlphabetCorrectAttempt`:** Append to `alphabetsCompleted` via `arrayUnion`
- **`storeWordCorrectAttempt`:** Increment `wordsCompletedCount` via `increment(1)`
- **`storeReport` (Passage):** 
  - Convert MM:SS duration to total seconds
  - Increment `passagesReadCount`, `readingDurationSeconds`, `accuracySum`, `wpmSum`
  - Update nested `miscuesCount` object with substitution/omission/insertion/repetition counts

---

### Analytics Fetching Hook

Create `src/Hooks/use_StudentAnalytics.ts` with modular Firebase SDK:

```typescript
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

---

### Caching Strategy

```
On Screen Mount:
  └─ Fetch all data (Week + Month + Year) in parallel
     └─ Cache in component state by filter key
     └─ Invalidate cache only on screen close/reopen

On Filter Change:
  └─ Return cached data immediately (no DB read)

On Tab Switch (History ↔ Performance):
  └─ Use cached data (no re-fetch)
```

**Benefit:** Reduces database reads from ~300 per session to ~3 on initial mount.

---

### Design System Alignment

All charts and analytics components must follow the **modernized design system**:

- **Color Palette:** 
  - Primary Blue: `#3d71d9`
  - Accent Colors: From `ACCENT_COLORS` in `Theme.ts`
  - Success (Green): `#2CA96A`
  - Warning (Amber): `#F59E0B`
  - Error (Red): `#EF4444`
  
- **Typography & Spacing:** Match `Faculty_Dashboard.tsx` and `Student_Reading_Activity.tsx`

- **Components:** Use existing `BounceIn`, animated components, and `LinearGradient` for consistency

- **Charts Library:** Use `react-native-gifted-charts` for modern, smooth animations

- **Accessibility:** Ensure charts have text labels and color-blind friendly schemes

---

### Identified Loopholes & Mitigations

| Loophole | Mitigation |
|----------|-----------|
| **Word/Alphabet Duplicate Counting** | Check `hasWordBeenCompleted()` before incrementing. Use `arrayUnion()` for alphabets (prevents duplicates natively). |
| **Miscue/WPM Only for Passages** | Add type guards in `updateDailySession()`. Update miscue/WPM fields ONLY for passage activity types. |
| **Timezone Misalignment** | Use client local timezone: `new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0]` |
| **Duplicate Report Uploads** | Add idempotency key (`reportId`). Check `processedReportIds` array before updating session. |
| **Missing Firestore Index** | Document in deployment checklist. Add console warning in dev if index not deployed. |
| **Historical Data Unavailable** | Accept as known limitation. Show message: "Analytics begin tracking from [implementation date]." |
| **Concurrent Updates** | Firebase atomic operations (`increment()`, `arrayUnion()`) handle this natively. No action needed. |
| **School Year Boundary Edge Cases** | Document June 1 - March 31 rule. Allow future parameterization if school calendar varies. |
| **Malformed Duration Data** | Add validation: `const parseRecordingDuration = (durationStr) => { if (!durationStr) return 0; const [m, s] = durationStr.split(':').map(Number); return isNaN(m) \|\| isNaN(s) ? 0 : (m*60)+s; }` |

---

## Tab Animation & Switching

**Transition:** Horizontal slide
- History → Performance: Slide LEFT (Performance enters from right)
- Performance → History: Slide RIGHT (History enters from left)
- Duration: 300ms ease-in-out
- Interpolation: `Animated.timing` or `Animated.spring`

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState<'history' | 'performance'>('history');
const slideAnimation = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(slideAnimation, {
    toValue: activeTab === 'performance' ? 1 : 0,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, [activeTab]);
```

---

## Data Fetching Flow

### On Screen Mount (Student_History.tsx):
```
1. Fetch Reports (from MiscueReportController)
   └─ getStudentReports(studentId) → all historical reports

2. Fetch Word Mastery (from MiscueReportController)
   └─ getStudentDetailedCompletion(studentId) → completedAlpha, completedWords, completedPassages

3. Fetch Analytics Sessions (LAZY - on Performance tab first open)
   └─ fetchAnalyticsData(studentId, 'Week') → cache for Week
   └─ fetchAnalyticsData(studentId, 'Month') → cache for Month
   └─ fetchAnalyticsData(studentId, 'Year') → cache for Year

4. Cache all results in state → no further DB reads until screen re-opens
```

### On Filter Change (in Performance Tab):
```
1. User taps filter pill (Linggo/Buwan/Taon)
2. setActiveFilter(newFilter)
3. Re-render all charts with cached data[newFilter]
4. NO database reads
```

### Data Cache Invalidation:
```
1. User closes Student_History screen
2. Cache is destroyed (when component unmounts)
3. When user re-opens Student_History, fetch fresh data
4. This ensures reading sessions from during the session are captured
```

---

## Loading & Error States

### Loading (Initial Fetch):
```
┌────────────────────────────────┐
│ Hinihintay ang data...         │
│ [Loading spinner]              │
└────────────────────────────────┘
```

### Error (Failed Fetch):
```
┌────────────────────────────────┐
│ May problema sa pagkuha ng data │
│ Error: [error message in red]  │
│ [Retry button]                 │
└────────────────────────────────┘
```

### Empty State (No Data in Period):
```
┌────────────────────────────────┐
│ 📚                             │
│ Walang aktibidad sa panahong ito│
│                                │
│ Subukan ang ibang panahon       │
│ [Switch to Month / Year]       │
└────────────────────────────────┘
```

---

## Implementation Notes

### Key Files to Modify/Create:
1. **`src/Screens/Student/Student_History.tsx`** — Add tab structure, Performance section
2. **`src/Hooks/use_StudentAnalytics.ts`** (CREATE) — Fetch and cache analytics data
3. **`src/Controller/MiscueReportController.ts`** — Enhance word mastery aggregations
4. **`src/UI_Designs/StudentAnalyticsStyles.ts`** (CREATE) — Centralized styles for charts

### Dependencies to Add:
```json
{
  "react-native-gifted-charts": "^1.4.0",
  "react-native-reanimated": "^3.x.x"
}
```

### TypeScript Interfaces:
```typescript
interface AnalyticsData {
  filter: 'Week' | 'Month' | 'Year';
  sessions: DailySession[];
  wordMasteryByLetter: Record<string, WordMasteryStats>;
  passagePerformance: PassagePerformance[];
  miscueAggregates: MiscueAggregates;
}

interface DailySession {
  date: string;
  wordsCompletedCount: number;
  passagesReadCount: number;
  readingDurationSeconds: number;
  accuracySum: number;
  wpmSum: number;
  miscuesCount: { substitution: number; omission: number; insertion: number; repetition: number };
}

interface WordMasteryStats {
  masteredWords: string[];
  missedWords: string[];
  untried: string[];
}

interface MiscueAggregates {
  topMiscuedWords: { word: string; count: number }[];
  topStrugglingPassages: { title: string; accuracy: number }[];
  miscueBreakdown: { substitution: number; omission: number; insertion: number; repetition: number };
}
```

---

## Summary of Design Principles

✅ **Progressive Disclosure:** Show summary first, tap to expand details (WordMasteryPlan style)
✅ **One Layer = One Question:** Each visual layer answers a single question
✅ **Clear Separation:** Words section ≠ Passages section (no mixing)
✅ **Caching Strategy:** Minimize DB reads; cache all data on mount
✅ **Smooth Animations:** Slide tabs, spring gauges, staggered grid tiles
✅ **Color Coding:** Accuracy/Speed gradients (Green/Amber/Red)
✅ **Tap-to-Expand:** Word grid hidden until user selects letter
✅ **Filter Persistence:** Same filter applied to all sections
✅ **Responsive Layout:** Works on all screen sizes (4-7 inches)
✅ **Accessibility:** Text labels, no color-only information, readable fonts
