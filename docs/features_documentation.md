# MiscueReading — Implemented Features Documentation

**App:** MiscueReading (React Native + Firebase)
**Modules covered:** Student, Faculty
**Last updated:** 2026-05-12

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Authentication & Onboarding](#2-authentication--onboarding)
3. [Student Module](#3-student-module)
   - 3.1 [Student Home](#31-student-home)
   - 3.2 [Reading Library](#32-reading-library)
   - 3.3 [Reading Activity (Core Engine)](#33-reading-activity-core-engine)
   - 3.4 [Student Profile](#34-student-profile)
   - 3.5 [My Class](#35-my-class)
   - 3.6 [Reading History & Personal Analytics](#36-reading-history--personal-analytics)
4. [Faculty Module](#4-faculty-module)
   - 4.1 [Faculty Dashboard](#41-faculty-dashboard)
   - 4.2 [Class Management](#42-class-management)
   - 4.3 [Student Roster](#43-student-roster)
   - 4.4 [Individual Student Analytics](#44-individual-student-analytics)
   - 4.5 [Faculty Profile](#45-faculty-profile)
   - 4.6 [Class Archive](#46-class-archive)
5. [Shared / Global Features](#5-shared--global-features)
6. [Data Export](#6-data-export)
7. [Component–Screen Map](#7-componentscreen-map)

---

## 1. System Overview

MiscueReading is an oral reading assessment platform designed around **miscue analysis** — the practice of categorizing and studying errors (miscues) a student makes while reading aloud. The app records student speech, transcribes it in real time via **Deepgram Nova-3 STT**, compares the transcription against the target passage, and saves a structured session report to **Firebase Firestore**.

Three roles exist in the system: **Student**, **Faculty**, and **Admin**. This document covers Student and Faculty only.

---

## 2. Authentication & Onboarding

| Feature | Details |
|---|---|
| Email / Password sign-in | Standard Firebase Auth with loading state, error messages, and rate-limit lockout after repeated failed attempts |
| Google OAuth sign-in | One-tap Google sign-in; new Google users are routed to role selection before completing their profile |
| Role selection | `Choose_User_Role.tsx` — new users pick Student, Faculty, or Admin before filling out the registration form |
| Two-step registration | Step 1 (`SignUp_One.tsx`): Personal info (name, email, password). Step 2 (`SignUp_Two.tsx`): Role-specific fields — grade level, gender, academic year for students; school details for faculty |
| Registration confirmation | `SignUp_Completed.tsx` shows a success screen and routes the user to their role-appropriate home screen |

---

## 3. Student Module

### 3.1 Student Home

**Screen:** `src/Screens/Student/Student_Home.tsx`

The entry point for students after login.

| Feature | Description |
|---|---|
| Personalised greeting | Displays the student's first name pulled from their Firestore profile |
| Animated welcome UI | `BounceIn` animation on mount; floating character SVG that plays alongside background music |
| Background music | Persistent looping music managed by `GlobalMusicContext` — continues across tab switches |
| Navigation shortcuts | Quick-access buttons to Library, My Class, Profile, and History |
| Logout | Confirmation modal before signing out, handled via `Logout_Modal` |

---

### 3.2 Reading Library

**Screen:** `src/Screens/Student/Student_Reading_Selection.tsx`

A catalogue of all reading materials the student can practice with.

| Feature | Description |
|---|---|
| Material types | Three categories: **Passages** (full reading texts), **Words** (single-word pronunciation), **Alphabets** (letter-sound recognition) |
| Completion badges | Each material card shows whether the student has already completed it, sourced from `useStudentCompletedWord` |
| Filter / sort | Dropdown to filter by type or sort by difficulty / completion status |
| Navigation | Tapping a material navigates to the Reading Activity screen, passing the selected material as a route param |

---

### 3.3 Reading Activity (Core Engine)

**Screen:** `src/Screens/Student/Student_Reading_Activity.tsx`

The heart of the application — where the actual reading assessment happens.

#### 3.3.1 Audio Recording

| Feature | Description |
|---|---|
| Microphone capture | `useAudioRecording` hook manages start/stop of device microphone using `react-native-audio-recorder-player` |
| Visual recording state | Animated ripple rings expand from the microphone button while recording to indicate active capture |
| Recording controls | Single tap to start, tap again to stop; controlled via `RecordingControls.tsx` |

#### 3.3.2 Speech-to-Text

| Feature | Description |
|---|---|
| Real-time transcription | Audio is streamed to **Deepgram Nova-3** via `useSpeechToText` hook |
| Interim results | Partial transcripts shown as the student speaks; finalised transcript used for scoring |
| Language support | Configured for Filipino English oral reading patterns |

#### 3.3.3 Miscue Detection & Accuracy Scoring

| Feature | Description |
|---|---|
| Word-level alignment | Transcript tokens are aligned to expected passage tokens using normalised string comparison |
| Miscue categorisation | Each misread token is classified as one of: **Substitution** (wrong word said), **Omission** (word skipped), **Insertion** (extra word added), **Repetition** (word repeated) |
| Accuracy rate | `Accuracy = (Correct Words / Total Words) × 100` — shown as a percentage on completion |
| WPM calculation | `WPM = (Words Read / Recording Time in Seconds) × 60` |
| Per-word highlighting | `TextDisplay.tsx` renders each word and colours it green (correct) or red (miscue) for immediate feedback |

#### 3.3.4 Feedback System

| Feature | Description |
|---|---|
| Passage completion modal | `PassageFeedback.tsx` shows final accuracy %, WPM, star rating, and a word-level miscue breakdown |
| Motivational modals | `FeedbackModal.tsx` plays Lottie animations and sound effects (congratulations, try again, good job) based on accuracy threshold |
| Star rating | `StarRatingDisplay.tsx` maps accuracy ranges to 1–3 stars (≥95% = 3 stars, 90–94% = 2 stars, <90% = 1 star) |
| Retry | Students can attempt the same passage again; each attempt is recorded as an independent session |

#### 3.3.5 Session Report Storage

| Feature | Description |
|---|---|
| Firestore write | On completion, a structured report object is written to Firestore containing: studentId, passageId, passageTitle, accuracy, WPM, miscues array (type + word), timestamp, duration |
| Completion tracking | The passage is flagged as completed in the student's completion record in Firestore |
| Offline resilience | Firestore SDK caches pending writes and syncs when connectivity is restored |

---

### 3.4 Student Profile

**Screen:** `src/Screens/Student/Student_Profile.tsx`

| Feature | Description |
|---|---|
| Profile display | Shows name, email, gender, and enrolled class |
| Profile editing | Toggle edit mode to update name and other basic fields; changes saved to Firestore via `updateStudentBasicInfo` |
| Embedded analytics | The profile screen reuses the same analytics components as the Faculty student view — Accuracy Trends chart, Miscue Insights panel, Word Mastery tracker, and Completion Progress — so students can see their own data |
| PDF export | Exports a formatted PDF report of the student's own performance (self-view mode of `ExportPdf`) |

---

### 3.5 My Class

**Screen:** `src/Screens/Student/Student_MyClass.tsx`

| Feature | Description |
|---|---|
| Enrolled classes list | Displays all classes the student is currently enrolled in with class name and teacher name |
| Join class | Input a class code provided by the faculty member; validated against Firestore before adding |
| Leave class | Confirmation modal before removing self from a class |
| Real-time updates | Class membership changes reflected immediately via Firestore real-time listener |

---

### 3.6 Reading History & Personal Analytics

**Screen:** `src/Screens/Student/Student_History.tsx`

A four-tab analytics hub for the student to review their own progress.

#### Tab 1 — Progress

| Component | Feature |
|---|---|
| `StudentCompletionProgress` | Curriculum-wide completion tracker — expandable Word chapters with lesson-level progress bars; single Alphabet progress bar |

#### Tab 2 — Sessions

| Component | Feature |
|---|---|
| `Student_TimeTrack` (ActivityTracking) | Reading activity heatmap showing which days/hours the student was active over the selected period |

#### Tab 3 — Analytics

| Component | Feature |
|---|---|
| `Student_Accuracy_Chart` | Accuracy % and WPM bar chart across sessions in the selected time range; peak period highlighted; grade-level benchmark card |
| `StudentMiscueInsights` | Three panels — (1) miscue type distribution with student-friendly labels ("Wrong word", "Skipped word", etc.), (2) most-miscued passage, (3) most-miscued individual words |
| `StudentWordMastery` | Per-chapter word mastery bars and per-lesson breakdowns |
| `StudentAlphabetMastery` | 26-letter grid showing mastery status for each letter |

#### Tab 4 — History

| Component | Feature |
|---|---|
| `MiscueReportCard` list | Chronological list of all reading sessions; each card shows passage title, date, accuracy %, WPM, and a per-word miscue breakdown |

#### History Filter System

| Control | Description |
|---|---|
| Range selector | Toggle between Week / Month / Year view |
| Period navigator | Back/forward arrows to step through historical periods |
| Day-of-week chips | In Week range — filter to sessions on a specific day |
| Week-of-month chips | In Month range — filter to sessions in a specific week |
| Academic year | Automatically bounded to Philippine school year (June 1 – March 31) |

#### Export

| Feature | Description |
|---|---|
| PDF export button | `ExportPdf` called with all active filter state (`historyFilter`, `historyAnchor`, `perfTimeRange`, `perfAnchor`, `historySelectedDay`, `historySelectedWeekOfMonth`, etc.) so the exported report matches what is on screen |

---

## 4. Faculty Module

### 4.1 Faculty Dashboard

**Screen:** `src/Screens/Faculty/Faculty_Dashboard.tsx`

A class-wide analytics command centre. All charts update based on the selected academic year and class filters.

#### Filters

| Control | Description |
|---|---|
| Academic year selector | Dropdown to switch between academic years (Philippine school calendar) |
| Class selector | Dropdown listing all of the faculty member's active classes |
| `ReadingStatusFilter` | Combines both dropdowns into a reusable filter bar component |

#### Dashboard Sections

| Section | Component | Description |
|---|---|---|
| Overview counts | `NumberOfClassesAndStudents` | Cards showing total active classes and enrolled student count |
| Class reading health | `ClassReadingStatus` | Grid classifying each student as Fluent, Developing, Emerging, or At-Risk based on their latest accuracy score |
| Participation rate | `ClassParticipationRate` | Percentage of enrolled students who have completed at least one session in the selected period |
| Accuracy trends | `AccuracyTrends` | Class-averaged accuracy and WPM bar chart over time with grade-level WPM benchmark band overlay |
| Reading calendar | `ReadingCalendarHeatmap` | Month-grid heatmap where each cell represents a day; colour intensity reflects number of sessions that day |
| Passage difficulty | `PassageDifficultyRanking` | Ranked list of passages ordered by average student difficulty (lowest accuracy first) |
| Miscue analysis | `MiscueChart` | Bar chart showing class-aggregate counts of each miscue type (Substitution, Omission, Insertion, Repetition) |
| Word mastery | `ClassWordMastery` | Aggregate word mastery progress across all students in the class |
| Alphabet mastery | `ClassAlphabetMastery` | Aggregate alphabet mastery across all students |
| Active hours | `ActiveHoursChart` | Bar chart of reading activity distribution by day of week or hour of day |

---

### 4.2 Class Management

**Screen:** `src/Screens/Faculty/Faculty_MyClass.tsx`

| Feature | Description |
|---|---|
| Class list | FlatList of all active classes with class name, grade level, and student count |
| Create class | Modal form — enter class name, select grade level (1–3), select academic year; creates Firestore document and generates a join code |
| Edit class name | Inline edit modal to rename an existing class |
| Archive class | Confirmation dialog before archiving; archived classes are hidden from students and moved to the archive view |
| Real-time updates | Firestore real-time subscription — new students who join or changes to class details appear without a page refresh |
| Navigate to roster | Tapping a class card navigates to `Faculty_MyStudents` passing the `classId` |

---

### 4.3 Student Roster

**Screen:** `src/Screens/Faculty/Faculty_MyStudents.tsx`

| Feature | Description |
|---|---|
| Student list | FlatList of all students enrolled in the selected class with name and basic info |
| Search | Live text search filtering students by name (client-side, no network call) |
| Navigate to profile | Tapping a student card navigates to `Faculty_Student_View_Profile` passing the `studentId` |

---

### 4.4 Individual Student Analytics

**Screen:** `src/Screens/Faculty/Faculty_Student_View_Profile.tsx`

A four-tab detailed view of a single student, mirroring what the student sees in their own `Student_History` screen, with additional faculty-only panels.

#### Date Range Filter (Global to All Tabs)

| Feature | Description |
|---|---|
| `DateRangeFilter` | Shared filter bar above all tabs; produces `historyBounds` and `perfBounds` (`{ start, end, range }`) |
| Range options | Week / Month / Year presets |
| Scope | Applied to the Sessions, Performance, and History tabs; the Completion tab is curriculum-wide and not time-filtered |

#### Tab 1 — Completion

| Component | Feature |
|---|---|
| `StudentCompletionProgress` | Shows curriculum completion status — expandable Word chapters with lesson-level bars; single Alphabet bar. Source: `ReadingMaterial_new.json` curriculum definition compared against Firestore completions. Not affected by date filter. |

#### Tab 2 — Sessions

| Component | Feature |
|---|---|
| `StudentActivityTrackingCard` | Reading activity heatmap over the selected date range |
| `StudentTotalActivityToday` | **Faculty-only panel.** Three animated progress bars showing today's accuracy for Alphabet (purple), Words (amber), and Passage (orange) categories |

#### Tab 3 — Performance (Analytics)

| Component | Feature |
|---|---|
| `Student_Accuracy_Chart` | Individual student accuracy % and WPM bar chart over the selected period; grade-level benchmark band; peak period highlighted in bold with solid fill |
| `StudentMiscueInsights` | (a) Miscue type distribution — bar chart of Substitution, Omission, Insertion, Repetition counts. (b) Top miscued passage — highest miscue-count passage with score. (c) Most miscued words — bar chart of the most frequently mispronounced individual words |
| `StudentWordMastery` | Per-chapter word mastery progress bars with expandable lesson-level detail |

#### Tab 4 — History

| Component | Feature |
|---|---|
| `MiscueReportCard` list | All reading session records filtered to `historyBounds` date range; each card shows passage title, date, accuracy %, WPM, and per-word miscue breakdown with technical labels (Substitution, Omission, etc.) |

#### Export

| Feature | Description |
|---|---|
| Excel export | `ExportExcel` button generates a `.xlsx` file of session data for spreadsheet analysis |
| PDF export | `ExportPdf` called with `historyFilter`, `historyAnchor`, `perfTimeRange`, `perfAnchor` derived from `historyBounds` and `perfBounds` so the PDF report matches the active date filter on screen; `groupedReports` is not passed — the component self-fetches from Firestore at export time |

---

### 4.5 Faculty Profile

**Screen:** `src/Screens/Faculty/Faculty_Profile.tsx`

| Feature | Description |
|---|---|
| Profile display | Shows first name, middle name, last name, email, gender |
| Profile editing | Toggle edit mode to update name fields; validated before saving to Firestore via `updateFacultyProfile` |
| Field validation | Required fields highlighted with error state when empty on save attempt |
| Save confirmation | Alert modal confirms successful save or displays error message |

---

### 4.6 Class Archive

**Screen:** `src/Screens/Faculty/Faculty_MyArchive.tsx`

| Feature | Description |
|---|---|
| Archived class list | FlatList of all archived classes |
| Unarchive | Confirmation dialog before restoring a class to active status |
| Real-time updates | Firestore real-time subscription same as the active class list |

---

## 5. Shared / Global Features

These features appear in both modules.

| Feature | Component / Hook | Description |
|---|---|---|
| Responsive layout | `sw()`, `sh()`, `sf()` from `responsive.ts` | All dimensions and font sizes scale proportionally to device screen size |
| Alert modal | `AlertModal.tsx` | Reusable confirmation/error modal used across all screens |
| Logout modal | `Logout_Modal.tsx` | Confirmation dialog used in home screens and sidebars |
| Date range filter | `DateRangeFilter.tsx` | Shared between Faculty Student Profile and other analytics screens; emits `DateBounds { start, end, range }` |
| Navigation helper | `useNavigationHelper()` | Centralized navigation utilities; prevents duplicate navigation calls |
| Background music | `GlobalMusicContext`, `Student_Bq_Music.tsx` | Music persists across the student tab navigator; wrapped at navigator level so music doesn't restart on tab switch |
| Animated components | `FadeSlideIn.tsx`, `BubbleBackground.tsx` | Shared animation wrappers used in welcome and info screens |

---

## 6. Data Export

Both the Student self-view and the Faculty student profile support report export.

### PDF Export — `ExportPdf.tsx`

| Feature | Description |
|---|---|
| Role detection | Automatically determines if the viewer is Faculty or Student by comparing `studentId` prop against the authenticated user's UID; adjusts miscue labels accordingly |
| Self-fetching | If `groupedReports` prop is not passed, the component fetches its own copy from Firestore via `MiscueReportController.getStudentReports` |
| Date filter awareness | Accepts `historyFilter`, `historyAnchor`, `perfTimeRange`, `perfAnchor` to scope report data to the faculty's/student's selected period |
| Inline SVG charts | Accuracy donut chart, paired accuracy/WPM bar chart, miscue type distribution chart — all rendered as inline SVG strings within the HTML template |
| Grade benchmarks | Report includes a grade-level benchmark table (Hasbrouck & Tindal 2017 norms) if `gradeLevel` prop is provided |
| Print / save | Uses `RNPrint.print({ html })` to open the native print dialog; user can save as PDF or send to printer |
| Student name | Resolved from Firestore `users/{uid}` document (not taken from a prop, so always current) |

### Excel Export — `ExportExcel.tsx`

| Feature | Description |
|---|---|
| Spreadsheet output | Generates a `.xlsx` file with session-level data rows |
| Download | File saved to device storage or shared via native share sheet |

---

## 7. Component–Screen Map

The table below shows which reusable components appear in each screen so that a developer can trace where a feature is rendered.

| Component | Student_History | Student_Profile | Faculty_Dashboard | Faculty_Student_View_Profile |
|---|:---:|:---:|:---:|:---:|
| `StudentCompletionProgress` | ✓ | ✓ | — | ✓ |
| `Student_TimeTrack` | ✓ | — | — | ✓ |
| `Student_Accuracy_Chart` | ✓ | ✓ | — | ✓ |
| `StudentMiscueInsights` | ✓ | ✓ | — | ✓ |
| `StudentWordMastery` | ✓ | ✓ | — | ✓ |
| `StudentAlphabetMastery` | ✓ | ✓ | — | — |
| `StudentTotalActivityToday` | — | — | — | ✓ (faculty-only) |
| `AccuracyTrends` (class) | — | — | ✓ | — |
| `MiscueChart` (class) | — | — | ✓ | — |
| `ClassReadingStatus` | — | — | ✓ | — |
| `ClassParticipationRate` | — | — | ✓ | — |
| `ReadingCalendarHeatmap` | — | — | ✓ | — |
| `PassageDifficultyRanking` | — | — | ✓ | — |
| `ClassWordMastery` | — | — | ✓ | — |
| `ClassAlphabetMastery` | — | — | ✓ | — |
| `ExportPdf` | ✓ | ✓ | — | ✓ |
| `ExportExcel` | — | — | — | ✓ |
| `DateRangeFilter` | — | — | — | ✓ |

---

*This document reflects the implemented state of the codebase as of the last update date above. For analytics computation details, research basis, and threshold tables, see [`analytics_documentation.md`](analytics_documentation.md).*
