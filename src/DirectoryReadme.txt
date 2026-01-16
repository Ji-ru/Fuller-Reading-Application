CISC Capstone - src/ Directory Documentation
============================================

This file describes the folder structure within the `src/` directory of the MiscueReading application, listing their main files, key functions (with signatures), data types, and the main purposes of each folder and file.

-------------------------------------------------------------------------------

## 1. Components/
Reusable UI components, often parameterized, such as buttons, navigation bars, reading UIs, and feedback elements. Subfolders are grouped by feature or use-case.

- **Buttons/**  — GenderRadioButton.tsx, GradeLevelSelectionButton.tsx, LogoutModal.tsx
    - *Purpose:* Commonly used input controls and modals for the app.
    - `GenderRadioButton`: Props: `{ onGenderSelect(gender: string) }`. Lets users pick M/F, emits callback.
    - `GradeLevelSelectionButton`: Props: `{ onSelect?: (grade: number) }`. Dropdown for grade level (1-3), emits selection.
    - `LogoutModal`: Props: `{ visible, onCancel, onConfirm, ... }`. Modal for confirming logout.

- **Faculty/**
    - `PieChart.tsx`: Renders a pie chart for displaying miscue distribution. Props: `{ data: PieChartData[], title?, centerText?, showLegend? }` where PieChartData includes type, percentage, count, color. Calculates chart segments and legend.

- **MiscueHistory/**
    - `MiscueReportCard.tsx`: (Currently commented out) Was planned to visually summarize a session’s miscue types, counts, and relevant passage details.

- **NavigationBar/**
    - `BottomNav.tsx`: Bottom navigation specific for faculty role; uses navigation controller hooks to route to Dashboard/MyClass/Profile.

- **Reading/**
    - `PassageFeedback.tsx`: Shows feedback/result summaries after reading; props include miscues, accuracy, correctness.
    - `ProgressBar.tsx`: (Commented out) Previously for visual accuracy bars.
    - `ReadingHeader.tsx`: Header for reading screens: back button, menu, and a logout modal.
    - `RecordingControls.tsx`: Starts/stops recordings, shows microphone and permissions indicators.
    - `TextDisplay.tsx`: Renders passage or word/alphabet content, highlights errors (miscues) color-coded by miscue type, shows feedback/score visuals.

-------------------------------------------------------------------------------

## 2. Controller/
Business and data logic, interacts with persistence and external services.

- `AudioRecordingController.ts`: Handles microphone permissions, audio setup/teardown, start/stop, and time tracking. Exports `useAudioRecording()` hook with full recording state/controls.
- `AuthenticationController.ts`: Account creation (signup), login, logout, user/profile/class CRUD, plus role-based field logic. Data types: UserDocument, ClassDocument (see Types).
- `DatabaseController.ts`: Logic for storing/fetching miscue reports, word/alphabet completions, and reading stats. Main functions:
    - `storeReport(passageTitle, miscues, accuracy, wpm, recordingDuration)`
    - `getStudentReadingStats(studentId)`, `getStudentReports(studentId)`
    - `getCompletedWords(studentId)`, `getCompletedAlphabets(studentId)`
- `MiscueAnalysisServiceController.ts`: Core miscue-detection logic. Has functions to:
    - `detectMiscues(passageText, spokenText): Miscue[]`
    - `calculateAccuracy(...)`, `checkAlphabetPhonemeAccuracy(...)`, `checkWordAccuracy(...)`
    - Also utility for feedback messages and summary formatting.
- `NavigationController.ts`: Custom wrapper for React Navigation — exports the `useNavigationHelper()` hook, which returns unified navigation/setters for all screens.
- `PermissionsController.ts`: Audio permission utilities for Android/iOS; used by the audio recording controller.
- `Speech2TextServiceController.ts`: Hook for sending audio to Google STT and processing responses (transcription fallback, loading states).

-------------------------------------------------------------------------------

## 3. Hooks/
- `useFacultyMiscueStats.ts`: Custom React hook—for faculty—to aggregate accuracy/miscue stats for their students (average accuracy, type breakdown, percentage per type). Used for dashboard visualization (e.g., PieChart).

-------------------------------------------------------------------------------

## 4. Screens/
Each subfolder or file is a top-level screen (view/page). Separation by role:
- **Faculty/** (dashboard, profile, classes)
- **SignUp/** (multi-step signup onboarding)
- **Student/** (their flows: reading pages, history, home)
- Others: LoginScreen.tsx, LoadingScreen.tsx, Profile.tsx.
Each screen typically imports navigation hooks and coordinates UI components and controller logic for its purpose (e.g., showing progress, launching readings, onboarding, etc).

-------------------------------------------------------------------------------

## 5. Services/
- `FeedbackModal.tsx`: Modal feedback (with Lottie animation) for reading attempts, for immediate user feedback on result.

-------------------------------------------------------------------------------

## 6. Types/
TypeScript interfaces and types that model:
- User, class, miscue report, passage data, reading material, etc.
Files:
- `dataInterfaces.ts`: UserDocument, ClassDocument, MiscueReportDocument, and roles.
- `miscue.ts`: Miscue, MiscueType, FacultyMiscueStats, StudentMiscueReport, etc.
- `passage.ts`: Models passage, alphabets, word contrasts; “type guard” helpers (isPassage/isAlphabet/isWords).

-------------------------------------------------------------------------------

## 7. ui/
All local custom styling for screens and component types (StyleSheet-based CSS-in-JS); file per logical UI chunk: ButtonStyles.ts, FeedbackModalStyle.ts, ReadingActivityStyles.ts, etc.

-------------------------------------------------------------------------------

**Summary:**
- *Components/* = focus on reusable rendered UI
- *Controller/* = non-visual business/data logic and services
- *Screens/*    = full pages/widgets using components+controller for user journey
- *Hooks*/*     = stateful logic for stats/analytics
- *Types/*      = shared data structures
- *ui/*         = all custom design/styles
- *Services/*   = 3rd-party or cross-cutting services

**See the top of each source file for exact exported functions, prop types, and data structures.**

