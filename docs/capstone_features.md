# Development of the Mobile Reading Assessment Application
## Mobile Application Development and Integration Results
### Per-Feature Description and Purpose

---

The MiscueReading mobile application was developed using React Native with Firebase as the backend infrastructure. The application serves two primary user roles — students and faculty — and is structured around the principle of miscue analysis, an evidence-based framework for diagnosing oral reading errors introduced by Goodman (1969). The features implemented in the system are classified into two tiers: **Core Features**, which constitute the fundamental capabilities that define the application's purpose, and **Secondary Features**, which extend and enhance the user experience without forming the essential assessment pipeline.

---

## I. Core Features

Core features are those capabilities without which the application cannot fulfill its primary function as an oral reading assessment tool. The removal of any core feature would render the assessment pipeline incomplete.

---

### Core Feature 1: Oral Reading Recording

**Description**

The application provides students with the ability to read assigned materials aloud by activating the device microphone through a single on-screen tap. Audio capture is managed by the `react-native-audio-recorder-player` library, which records the student's voice in real time at the moment the session begins. While recording is active, animated ripple rings expand outward from the microphone button to provide continuous visual confirmation that the device is capturing audio. A second tap ends the recording and triggers the downstream transcription and scoring pipeline.

**Purpose**

Oral reading recording is the primary data collection mechanism of the entire system. All subsequent analysis — transcription, miscue detection, accuracy scoring, and report generation — depends entirely on the audio captured in this step. By reducing the interaction to a single tap, the feature minimizes friction and lowers the cognitive barrier for young learners who may experience anxiety in formal oral assessment settings. The recording mechanism allows assessment to occur naturally and independently, without requiring a teacher to be physically present for every session.

---

### Core Feature 2: Real-Time Speech-to-Text Transcription

**Description**

Audio recorded during a reading session is streamed to the **Deepgram Nova-3** automatic speech recognition (ASR) model via a dedicated `useSpeechToText` hook. The Deepgram Nova-3 model is optimized for conversational and oral reading contexts and returns both interim partial transcripts — displayed to the student while reading is still in progress — and a finalized transcript upon session completion. The finalized transcript is passed to the miscue analysis engine for word-level comparison against the target passage.

**Purpose**

Speech-to-text transcription bridges the gap between a student's spoken reading and the text-based comparison required for automated assessment. Without this feature, identifying specific mispronounced, skipped, or inserted words would require a teacher to be present and manually mark each error, which is both time-consuming and impractical at scale. By processing transcription in real time, the system delivers assessment results immediately after each session, enabling students to receive feedback without delay. The selection of Deepgram Nova-3 specifically addresses the phonological characteristics of Filipino English oral reading patterns, improving transcription accuracy over general-purpose models.

---

### Core Feature 3: Automatic Miscue Detection and Classification

**Description**

Upon completion of a reading session, the finalized speech transcript is aligned token by token against the target passage text using normalized string comparison. Each deviation between the expected and spoken text is classified into one of four miscue categories defined by Goodman's (1969) miscue analysis framework:

- **Substitution** — the student reads an incorrect word in place of the target word (e.g., reads "home" instead of "house")
- **Omission** — the student skips a word present in the passage
- **Insertion** — the student adds a word not present in the passage
- **Repetition** — the student repeats a word already read

The full list of detected miscues, each annotated with its type, the expected word, and the word actually spoken, is stored as part of the session report in Firestore.

**Purpose**

Miscue classification is the defining capability that distinguishes MiscueReading from a simple reading timer or accuracy calculator. Rather than reducing a reading session to a single score, the feature identifies the specific nature of each error, providing teachers with diagnostic information that can directly inform instruction. A student who predominantly commits substitution errors may be relying on visual guessing strategies and may benefit from phonics reinforcement, whereas a student with frequent omission errors may be skipping words due to decoding difficulty or inattention — each pattern pointing to a different instructional response. This feature transforms raw audio data into actionable, educationally meaningful insight aligned with established reading assessment practice.

---

### Core Feature 4: Reading Accuracy Score and Words-Per-Minute (WPM) Measurement

**Description**

Upon the completion of each reading session, the application computes two primary oral reading fluency metrics:

- **Reading Accuracy Rate**: the percentage of words read correctly relative to the total number of words in the passage.
  > Accuracy (%) = (Correct Words ÷ Total Words) × 100

- **Words Per Minute (WPM)**: the rate at which the student read, computed from total words read and recording duration.
  > WPM = (Total Words Read ÷ Recording Duration in Seconds) × 60

Both values are displayed immediately after the session ends and are persisted in the session report alongside the miscue list.

**Purpose**

Accuracy and WPM are the two internationally recognized measures of oral reading fluency (Rasinski, 2004). Accuracy alone cannot determine whether a student is reading fluently, because a student may read slowly enough to achieve a high accuracy score without demonstrating automaticity. WPM alone cannot determine reading quality, because a fast reader with many errors is not reading fluently. Taken together, the two metrics provide a complete picture of a student's reading performance for any given session. These values also serve as the basis for all trend analysis in the application and are benchmarked against Hasbrouck and Tindal's (2017) grade-level Oral Reading Fluency norms, giving both students and faculty a standardized reference frame for interpreting scores.

---

### Core Feature 5: Session Report Storage

**Description**

Each completed reading session produces a structured report document that is written to **Firebase Firestore**. The report stores the following fields: student identifier, passage identifier and title, reading accuracy percentage, WPM, the complete miscue list (type, expected word, spoken word), session timestamp, and total recording duration. Firestore's built-in offline persistence layer caches pending writes locally and synchronizes them to the server when network connectivity is restored, ensuring that no session data is lost due to temporary connectivity interruptions.

**Purpose**

Persistent session records are the foundation upon which all analytics features in the application are built. Without stored reports, neither students nor faculty can review past performance, identify improvement trends, or make data-informed instructional decisions. Storing reports in Firestore enables real-time access by both the student and their assigned faculty from any device without requiring a dedicated application server, and ensures that historical data accumulates over the full academic year. The offline caching mechanism is particularly important in school environments where internet connectivity may be intermittent.

---

### Core Feature 6: Individual Student Analytics

**Description**

A multi-component analytics view presents data visualizations derived from a student's accumulated session reports. The view includes:

- An **accuracy and WPM trend chart** showing performance across sessions within a user-selected date range, with the peak-performing period highlighted
- A **miscue type breakdown chart** displaying counts of each miscue category (Substitution, Omission, Insertion, Repetition)
- Identification of the **most-miscued passage** and the **most frequently mispronounced individual words**
- A **word mastery tracker** organized by chapter and lesson, showing how many words in each unit have been mastered
- An **alphabet mastery grid** displaying the 26-letter mastery status for each letter
- A **curriculum completion progress** indicator showing overall and chapter-level completion of the reading material catalogue

Faculty access this view through the individual student profile screen; students access an equivalent view through their personal history screen with student-friendly labels on the miscue categories.

**Purpose**

Aggregate analytics provide both students and faculty with a longitudinal view of reading development that no single session score can convey. A student may produce a high accuracy score on one day but show a declining trend over several weeks; conversely, a consistently low scorer may be demonstrating marked improvement over a term. By presenting multiple dimensions simultaneously — accuracy, fluency, error patterns, mastery, and curriculum coverage — the analytics view enables targeted instructional decisions rather than reactive responses to isolated scores. The dual-access model, in which both students and faculty can view the same data through role-appropriate interfaces, supports student self-regulation alongside professional teacher oversight.

---

### Core Feature 7: Class Management and Class-Wide Dashboard

**Description**

Faculty are provided with tools to create and manage reading classes. When creating a class, the faculty member specifies a class name, grade level (Grade 1, 2, or 3), and academic year; the system automatically generates a unique alphanumeric join code that students use to enroll. Faculty can rename active classes, archive classes that are no longer active (removing them from student view), and restore archived classes when needed.

The class dashboard aggregates reading session data from all enrolled students and presents the following analytics:

- A **reading health grid** classifying each student as Fluent, Developing, Emerging, or At-Risk based on their most recent accuracy scores
- **Class participation rate** — the percentage of enrolled students who have completed at least one reading session in the selected period
- A **class-averaged accuracy and WPM trend chart** with a grade-level WPM benchmark band overlay
- A **reading calendar heatmap** showing session frequency by day across the calendar month
- A **passage difficulty ranking** ordering passages from most to least difficult based on average student accuracy
- A **class-wide miscue analysis chart** aggregating miscue type counts across all students
- **Class word mastery** and **alphabet mastery** aggregate indicators

All dashboard charts are filterable by academic year and by class, enabling faculty who manage multiple classes to navigate between them.

**Purpose**

Class management forms the organizational structure that connects students to their assigned teacher and makes faculty-side analytics possible. Without a class-based enrollment model, there is no mechanism for a faculty member to know which students' data to display or analyze. The class dashboard gives faculty the ability to monitor the reading health of their entire class from a single screen, identify students who may require early intervention, evaluate the relative difficulty of passages in the curriculum, and assess whether class-wide instructional strategies are producing measurable improvement over time. The academic year filter supports year-on-year comparison aligned with the Philippine school calendar (June to March).

---

## II. Secondary Features

Secondary features extend and enhance the user experience by supporting the core assessment pipeline, improving usability, providing additional learning scaffolds, or enabling administrative operations. While these features are not part of the critical assessment path, they contribute substantially to the overall educational value and practical utility of the application.

---

### Secondary Feature 1: Reading Material Catalogue with Completion Tracking

**Description**

The application provides a structured library of reading materials organized into three exercise types: **Passages** (multi-sentence reading texts for fluency assessment), **Words** (single-word pronunciation exercises), and **Alphabets** (letter-sound recognition activities). Each material card in the catalogue displays a completion badge indicating whether the student has already finished that material, sourced in real time from the student's completion records in Firestore.

**Purpose**

The catalogue gives students a clear inventory of available practice materials and a visible record of what they have accomplished. The completion badge reduces repetitive practice on already-mastered items and guides students toward new or unfinished materials, supporting self-directed learning habits appropriate to early grade-level readers.

---

### Secondary Feature 2: Per-Word Color-Coded Feedback

**Description**

During and immediately after a reading session, the passage text is rendered with each word individually color-coded: words read correctly are displayed in green, while words identified as miscues are displayed in red. This visual overlay is produced by `TextDisplay.tsx`, which maps the token-level miscue list from the analysis engine onto the passage display in real time.

**Purpose**

Color-coded word feedback provides students with immediate, word-level visibility into exactly where their errors occurred, rather than presenting only a summary percentage. For young learners who may not yet fully interpret numerical scores, seeing the specific words highlighted in red creates a concrete, visual understanding of their reading performance and encourages targeted self-correction on subsequent attempts.

---

### Secondary Feature 3: Star Rating and Motivational Feedback System

**Description**

At the end of each reading session, the application awards a star rating based on the student's accuracy score: three stars for accuracy at or above 95%, two stars for accuracy between 90% and 94%, and one star for accuracy below 90%. Alongside the rating, a motivational feedback modal plays a Lottie animation paired with a sound effect selected based on the accuracy outcome — congratulatory animations for high scores and encouraging animations for lower scores. Students may then choose to retry the same material, and each retry is recorded as an independent session.

**Purpose**

The star rating and motivational feedback system is designed with the developmental needs of early grade-level learners in mind. External motivation through visual rewards (stars, animations) and audio reinforcement reduces the negative affect commonly associated with reading difficulties (Afflerbach, 2007) and encourages students to persist through repeated attempts. The retry mechanism acknowledges that reading fluency develops through deliberate practice and repetition, and the independent recording of each attempt ensures that improvement across retries is captured in the data.

---

### Secondary Feature 4: Reading Activity Heatmap

**Description**

A calendar-style heatmap displays the student's reading activity over a selected date range. Each day is represented as a cell, with colour intensity proportional to the number of reading sessions completed on that day. Days with no activity are displayed in a neutral tone, while high-activity days appear in the deepest colour. An equivalent class-level heatmap on the faculty dashboard aggregates activity across all enrolled students.

**Purpose**

The heatmap gives both students and faculty an at-a-glance view of reading consistency and habit formation over time. Regular, distributed practice is strongly associated with reading fluency gains (Kuhn & Stahl, 2003), and the heatmap makes irregular or lapsed practice periods immediately visible without requiring the user to search through individual session records. For faculty, the class heatmap can reveal periods of low engagement that may correlate with instructional events or school calendar factors.

---

### Secondary Feature 5: Grade-Level Benchmark Integration

**Description**

The individual student accuracy and WPM trend chart displays a benchmark indicator showing the expected accuracy and WPM range for the student's assigned grade level. Benchmarks are derived from Hasbrouck and Tindal's (2017) Oral Reading Fluency norms, specifically the spring 50th-percentile values: Grade 1 (53–82 WPM, 90–100% accuracy), Grade 2 (89–120 WPM, 92–100% accuracy), and Grade 3 (107–140 WPM, 94–100% accuracy). On the class-wide trends chart, the benchmark is rendered as a shaded band overlaid on the WPM bars.

**Purpose**

Raw scores become educationally meaningful when placed in the context of grade-level expectations. Without a reference benchmark, a 75% accuracy score cannot be interpreted as adequate, insufficient, or exceptional without external knowledge of norms. The benchmark integration allows faculty to immediately see whether a student or class is performing above, within, or below grade-level expectations, supporting evidence-based decisions about pacing, differentiated instruction, and referral for reading support.

---

### Secondary Feature 6: Word Mastery and Alphabet Mastery Tracking

**Description**

The **word mastery tracker** displays a student's mastery of individual words organized by curriculum chapter and lesson. Each word in the reading material catalogue is marked as mastered or unmastered based on the student's session history. The tracker supports expandable chapter and lesson views for detailed inspection. The **alphabet mastery grid** displays all 26 letters and marks each as mastered or unmastered based on alphabet reading session performance.

**Purpose**

Word and alphabet mastery tracking operationalizes Bloom's (1968) Mastery Learning principle — the idea that students should achieve a defined level of competency on each learning unit before advancing. By making mastery visible at the word and letter level, both students and faculty can identify specific items that require additional practice rather than approaching reteaching at the broad passage or chapter level. This granularity supports targeted, efficient remediation.

---

### Secondary Feature 7: Curriculum Completion Progress

**Description**

A curriculum-wide completion indicator shows how much of the total reading material catalogue each student has finished, broken down by Word chapters (expandable to lesson level) and the Alphabet section (a single aggregate bar). Completion data is derived by comparing the set of materials defined in the curriculum definition file (`ReadingMaterial_new.json`) against the student's Firestore completion records.

**Purpose**

Curriculum completion progress gives students and faculty a macro-level view of how far the student has advanced through the reading programme as a whole, independent of performance quality. A student may be achieving high accuracy on the materials they attempt but have covered only a small fraction of the curriculum — a pattern that completion tracking makes visible and that may indicate the student needs encouragement or support to attempt new, more challenging materials.

---

### Secondary Feature 8: History Date Range Filtering

**Description**

The student analytics and history screens include a date range filter allowing users to scope all displayed data to a specific period. Three range presets are available — **Week**, **Month**, and **Year** — each with a back/forward period navigator for stepping through historical periods. The Week range includes day-of-week filter chips; the Month range includes week-of-month chips for finer granularity. All date ranges are bounded by the Philippine academic year (June 1 to March 31 of the following year). The faculty's individual student analytics view uses a simplified `DateRangeFilter` component that produces the same Week / Month / Year presets.

**Purpose**

Analytics without a time filter are inherently noisy for students who have been using the application over multiple months. A student's oldest sessions may reflect a much lower baseline than their current performance, and aggregating all sessions equally would obscure recent progress. The date filter allows both students and faculty to examine performance within a meaningful instructional window — for example, the current week's sessions or the current month's progress — and to compare across periods to evaluate growth over time.

---

### Secondary Feature 9: PDF and Excel Report Export

**Description**

The application supports the export of student reading reports in two formats. The **PDF export** generates a fully formatted report in HTML rendered through `RNPrint`, including inline SVG charts (accuracy donut, paired accuracy/WPM bar chart, miscue distribution chart), a grade-level benchmark table, and a session-level summary. The report is scoped to the currently active date filter and adjusts miscue label terminology based on the viewer's role (technical labels for faculty, student-friendly labels for students). The **Excel export** generates a `.xlsx` spreadsheet of session-level data suitable for further analysis in spreadsheet applications.

**Purpose**

Exported reports serve a documentation and communication function that the application's on-screen analytics cannot fully replicate. Faculty may be required to submit student reading assessment evidence as part of school reporting requirements, share progress summaries with parents or school administrators, or maintain offline records. Students and guardians who wish to keep a personal record of progress outside the application can do so through the PDF export. The Excel format supports faculty or researchers who wish to perform additional quantitative analysis on the raw session data.

---

### Secondary Feature 10: Student Class Enrollment (Join and Leave by Code)

**Description**

Students enroll in a class by entering a unique alphanumeric join code provided by their faculty member on the My Class screen. The code is validated against Firestore before the enrollment is confirmed. Students may also leave a class at any time through a confirmation dialog on the same screen. Class membership changes are reflected in real time through a Firestore listener.

**Purpose**

The join-by-code mechanism provides a simple, controlled enrollment process appropriate for primary school contexts where students may not have reliable access to email or formal account management tools. The code-based system ensures only students with explicit faculty authorization can join a class, maintaining the integrity of class-level data and preventing unauthorized access to other classes' analytics. The leave-class capability gives students and faculty flexibility in managing class assignments across the academic year.

---

### Secondary Feature 11: Class Archive and Restore

**Description**

Faculty can archive any active class through a confirmation dialog on the class management screen. Archived classes are removed from the student-facing class list and no longer appear in the faculty's active dashboard filters. Archived classes are accessible through a dedicated archive screen, where they can be restored to active status at any time.

**Purpose**

Class archiving supports the management of historical class data across multiple academic years without permanently deleting records. A faculty member who creates a new class at the start of each school year can archive the previous year's class, keeping the active dashboard uncluttered while retaining full access to historical session data and analytics for reference, reporting, or longitudinal research purposes.

---

### Secondary Feature 12: Today's Activity Summary (Faculty View)

**Description**

On the Sessions tab of the individual student analytics screen, a faculty-exclusive panel displays three animated progress bars showing the student's reading accuracy for the current day across each exercise category: Alphabet (purple), Words (amber), and Passage (orange). The bars animate on load using a spring physics animation to reflect the current-day accuracy percentages for each category.

**Purpose**

While the main analytics charts provide historical and trend-based views, the Today's Activity panel gives faculty an immediate, real-time snapshot of what the student has practiced on the current day. This is particularly useful during monitoring sessions or parent–teacher conferences where a faculty member needs to report on a student's most recent activity without navigating through historical data. The category breakdown helps faculty quickly identify which exercise type the student has been focusing on or neglecting on any given day.

---

### Secondary Feature 13: Passage Difficulty Ranking

**Description**

The faculty class dashboard includes a passage difficulty ranking that lists all passages attempted by students in the class, ordered from most to least difficult. Difficulty is determined by the average reading accuracy achieved across all student attempts on each passage — lower average accuracy indicating higher difficulty.

**Purpose**

The ranking provides faculty with an evidence-based view of which passages in the curriculum are posing the greatest challenge to the class as a whole, as opposed to relying on subjective judgments of text complexity. This information can inform decisions about curriculum pacing (whether to spend additional time on high-difficulty passages before advancing), differentiated grouping (assigning high-difficulty passages only to students who have demonstrated readiness), and curriculum review (flagging passages that are consistently too difficult as candidates for revision or replacement).

---

### Secondary Feature 14: Authentication and User Registration

**Description**

The application supports two sign-in methods: **email and password** authentication through Firebase Auth, and **Google OAuth** single sign-on. The email sign-in flow includes failed-attempt tracking and a temporary account lockout after repeated incorrect entries. New users who register via Google are routed through a role selection screen before completing profile setup. Registration follows a two-step form: the first step collects personal information (name, email, password), and the second step collects role-specific information (grade level, gender, and academic year for students; school and department details for faculty).

**Purpose**

A secure authentication layer is foundational to the integrity of any system that stores personal student performance data. Role-based registration ensures that the application serves each user type with an appropriate interface and appropriate data access permissions from the moment of first login. The Google OAuth option reduces the account creation barrier for users who already have Google accounts, which is common in school environments using Google Workspace for Education. The failed-attempt lockout mechanism protects student accounts from unauthorized access attempts.

---

### Secondary Feature 15: Background Music

**Description**

A persistent background music track plays throughout the student-facing tab navigation. Music playback is managed by `GlobalMusicContext` and wrapped at the navigator level by `Student_Bq_Music.tsx`, which ensures that the music continues without interruption or restart when the student switches between tabs (Home, Library, My Class, Profile).

**Purpose**

Background music in the student interface serves an affective and motivational function. Reading practice can be perceived by young learners as a demanding or anxiety-inducing activity. A calm, consistent audio environment reduces perceived effort and creates a familiar, welcoming atmosphere that encourages voluntary engagement with the application. Wrapping the music at the navigator level rather than at the individual screen level ensures continuity of the audio experience and prevents jarring restarts that would break immersion.

---

*For computation methods, research basis, and threshold tables behind the analytics features listed above, refer to [analytics_documentation.md](analytics_documentation.md). For a complete inventory of screens and components, refer to [features_documentation.md](features_documentation.md).*
