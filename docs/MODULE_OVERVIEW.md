# CISC Kids — Module Overview

**Reading Assessment App · Version 1.0.0**

> *A quick reference describing what each module is for and what it does. Each item is summarized in 1–3 sentences.*

---

## Account & Access

**Sign-in.** The login screen where existing users enter their email and password to access the app. It safely limits repeated failed attempts and sends each user to the correct module based on their role.

**Role Selection.** Lets a new user choose whether they are signing up as a Student or a Teacher. This choice decides which details are collected next and which module they will use.

**Sign-up.** The registration process for creating a new account, completed in two short steps. It guides the user from choosing a role through to entering their account and personal details.

**Sign-Up Email Account.** The first sign-up step, where the user enters their email and creates a password. Students must also have a parent or guardian tick a consent checkbox before continuing.

**Sign-up Personal Information.** The second sign-up step, where the user adds their name, gender, date of birth, grade level, and an optional profile picture. Completing this step creates the account and signs the user in.

**About.** Shows information about the app, its purpose, the speech-recognition model used, and the development team.

---

## 1. Student Module

The Student Module is the learner's space for practicing reading and tracking personal progress. Students read words and passages aloud, get instant feedback, and view how they are improving over time.

**Home.** The student's starting screen with a greeting and quick links to the main activities. It includes:

**Start Reading.** Lets the student choose a word or passage to read aloud while the app records and scores it. It checks reading accuracy and detects mistakes (miscues) in real time.

**Reading Selection.** The area where the student browses reading materials organized into chapters and lessons. It includes:
- **Chapter Selection.** Lets the student pick a specific chapter to access its available lessons.
- **Lesson and Word Selection.** Displays the lessons within the chosen chapter and allows the student to select specific words to practice. Words already read correctly are marked with a check so the student can see what they've finished.

**Passage Selection.** The "Passages" tab where the student picks a short story to read from a list. Each passage shows its title, author, and picture to help the student choose.

**Word Reading Activity.** The screen where the student reads a single word aloud and the app checks if it was pronounced correctly. It then shows one of two results:

- **Correct Feedback Result.** A congratulations message shown when the word is read correctly, and the word is marked as completed.
- **Incorrect Feedback Result.** A "try again" message shown when the word does not match, encouraging the student to practice and record again.
  - **Revealed Word Card.** When an incorrect result is shown, tapping the word card flips it over to display what the app actually heard the student say, helping them understand their pronunciation mistake.

**Passage Reading Activity.** The screen where the student reads a full passage aloud and the app scores their accuracy and reading speed. It then shows one of two results:

- **Miscues Detected Result.** A breakdown of the reading mistakes found in the passage, listed by type (substitution, omission, insertion, repetition), along with the accuracy score.
- **No Miscues Result.** A "perfect reading" message shown when no mistakes are detected, celebrating a flawless attempt.

**Reading Performance.** Shows the student's progress, mastered words, accuracy charts, and a history of past reading sessions. It helps students see how much they've completed and where they improve. It is organized into four tabs:

- **Progress Tab.** Shows how much of the reading materials the student has completed overall. It gives a quick sense of how far along the student is.
- **Word Mastery Tab.** Shows the words the student has practiced and mastered. It highlights which words are already learned. It includes:
  - **Chapter Selection.** Lets the student pick a chapter to view its overall word-mastery progress, displaying the specific number of words completed out of the total for that chapter.
  - **Lesson Progress View.** Displays the lessons inside the selected chapter, showing exactly how many words have been successfully completed in each lesson.
  - **Lesson Selection.** Lets the student open a specific lesson to view its words in detail. This focuses the view on one set of words at a time.
  - **Word Breakdown.** Shows the individual words in the lesson and how well each was read. Colors indicate which words are mastered and which still need practice.
- **Analytics Tab.** Displays charts of the student's reading accuracy and most common mistakes over time. Results can be filtered by week, month, or year. It includes:
  - **Accuracy and Speed.** A chart showing how the student's reading accuracy and speed (words per minute) change over the selected period. It helps spot whether the student is improving.
  - **Common Miscue Type.** Shows which kind of reading mistake the student makes most often — wrong word, skipped word, added word, or repeated word. This points to the main area the student needs to work on.
  - **Top Miscued Passages.** Highlights the passages where the student made the most mistakes. This points to the readings that need more practice.
  - **Most Miscued Words.** Lists the specific words the student most often gets wrong. This helps target individual words for review.
- **History Tab.** Lists every past reading session, grouped by passage. Tapping a passage shows each attempt's accuracy, words-per-minute, duration, and miscue details. It includes:
  - **Passage Selection.** Lets the student choose a specific passage to view a detailed history of all their past reading attempts for that text.
  - **Reading Attempt Details.** Displays the comprehensive miscue results for a specific reading session, including the accuracy score, reading speed, and exactly which mistakes were made.
- **Date Filter.** A shared filter used in the Word Mastery, Analytics, and History tabs to choose a time period by week, month, or year. The student can move between periods with arrow buttons or pick a specific day to narrow the results.

**My Class.** Lets a student join their teacher's class using a class code and wait for approval. It also shows class details once the student is accepted. It includes:

- **Join Class.** Lets the student enter the class code given by their teacher to send a request to join. A student can only belong to one class at a time.
- **Pending Approval.** Shows a "waiting for approval" notice after a join request is sent. The student can cancel the request while it is still pending.
- **Leave Class.** Lets the student exit their current class. For added security, the student may be asked to confirm with their password before leaving.

**My Profile.** Displays the student's photo and personal details and allows them to edit basic information. It includes:

- **Edit.** Lets the student update their basic information such as name, birthdate, and sex. Changes are kept after tapping Save and can be discarded with Cancel.

---

## 2. Faculty (Teacher) Module

The Faculty Module is the teacher's space for managing classes and monitoring students' reading. Teachers create classes, approve students, and review reading results through charts and reports.

**Bottom Navigation Menu.** A persistent menu at the bottom of the screen that allows teachers to easily switch between their main areas: Dashboard, My Class, Archive, and Profile.

**Dashboard.** Gives an overview of the teacher's classes and student reading performance through easy-to-read charts. Teachers can filter by academic year and section. It includes:

- **Academic Filter.** A dropdown to filter the dashboard charts and data by specific academic year and section.
- **Gender Distribution.** Shows the number of boys and girls in the selected class. It gives a quick picture of the class makeup.
- **Class Participation.** Shows how many students are actively doing their reading activities. It helps the teacher see who is engaged and who may be falling behind.
- **Reading Activity.** A calendar that shows which days students read the most. It reveals patterns in how consistently the class practices.
- **Accuracy and Speed.** Charts that track the class's reading accuracy and speed (words per minute) over time. It shows whether students are improving as a group.
- **Common Miscue Type.** Shows the most frequent kind of reading mistake across the class — wrong word, skipped word, added word, or repeated word. It points to the skill the class needs most help with.
- **Most Miscued Passage.** Highlights the passages that cause the most mistakes for the class. This helps the teacher know which readings are hardest.
- **Most Common Miscued Words.** Lists the specific words students most often get wrong. This helps the teacher target words for class practice.

**My Class.** Lets teachers create classes, share class codes, and edit, archive, or delete them. Tapping a class opens its student list. It includes:

- **Create New Class.** Lets the teacher make a new class by entering a class name and grade level. The app then generates a unique class code to share with students.
- **Edit Class.** Lets the teacher rename an existing class. The change is saved and shown on the class card.
- **Archive Class.** Moves a class out of the active list and into the Archive without deleting it. The class and its data can be restored later.
- **Delete Class.** Permanently removes a class from the system. This action cannot be undone.

**My Students.** Shows the students in a class, where teachers approve or reject join requests and remove students. Teachers can open any student's reading data and export it as PDF or Excel. It includes:

- **Pending Request.** A box at the top listing students who have asked to join the class. The teacher taps Accept to add a student or Reject to decline the request.
- **Ellipsis Button.** The three-dot (⋮) button on each student's row. Tapping it lets the teacher remove that student from the class after a confirmation.

**Student Performance Monitoring.** Opens an individual student's reading data when the teacher taps a student. It shows the same Progress, Sessions, Analytics, and History information that students see, with the added ability to export the data. It includes:

- **Export PDF.** A button that turns the student's reading data into a printable PDF report. Tapping it opens the device's print preview.
  - **Generated PDF Report.** A formatted document displaying the student's complete reading profile, including accuracy charts, word mastery progress, and a history of past sessions, ready for printing or sharing.
- **Print Preview & Save.** The device's print screen where the teacher can choose the pages to include and save the file as a PDF. After saving, the app returns to the Student Performance Monitoring screen.
- **Saved PDF.** The finished report file stored on the device. It can be opened anytime from the phone's file manager (Downloads or Files).

**Archive.** Stores classes the teacher has set aside. Archived classes can be restored (unarchived) or permanently deleted. It includes:

- **Unarchive Class.** Restores an archived class back to the active My Class list. The class and all its data become available again.
- **Delete Class.** Permanently removes an archived class from the system. This action cannot be undone.

**Profile.** Displays the teacher's details and allows them to edit their information.

---

## 3. Admin Module

The Admin Module is the system manager's space for overseeing all users and classes. Admins manage accounts, organize classes across teachers, and monitor overall reading activity.

**Dashboard.** Shows system-wide statistics such as total users, teachers, students, and active classes through summary cards and charts. Admins can filter the data by academic year. It includes:

- **Menu Bar.** A navigation menu that provides quick access to the Dashboard, User Management, Class Management, and other administrative tools.
- **KPI Cards.** Displays summary counts for Total Students and Total Teachers registered for the selected academic year.
- **Users by Role.** A chart showing the breakdown of accounts between students, teachers, and admins.
- **Users Registered Over Time.** A graph tracking new account registrations over selected periods to monitor system adoption.
- **Gender Distribution.** Shows the ratio of male to female users across the entire system.
- **Classes per Grade Level.** Displays how many active classes exist for each grade level.
- **Students per Grade Level.** Shows the distribution of student enrollments across different grade levels.

**User Management.** Lets the admin search, add, edit, or delete any user account and send password-reset emails. Users can be filtered by role. It includes:

- **Add New User.** Lets the admin manually create a new user account.
- **Search User.** A search bar to quickly find specific users by name or email.
- **User List.** Displays all registered users, which can be filtered to show specific roles like students or teachers.
- **User Password Reset.** Allows the admin to send a password reset link to a specific user's email address in case they forget their login credentials.
- **Manage Account.** Options to edit a user's details or permanently delete their account from the system.
- **View User Data.** Lets the admin open a specific user's profile to view their detailed information and activity.

**Class Management.** Lets the admin view all classes in the system, create classes and assign them to teachers, and rename, archive, or delete them. Tapping a class opens its reading dashboard. It includes:

- **Create New Class.** Lets the admin make a new class, set its grade level, and assign it to a specific teacher.
- **Academic Year Filter.** A dropdown to filter the list of classes by school year.
- **List of Classrooms.** Displays all classes for the selected academic year, showing the class name, assigned teacher, and number of students.
- **Edit Class.** Lets the admin rename an existing class or reassign it to a different teacher.
- **Archive Class.** Moves an inactive class into the archive, hiding it from the main list but preserving its data.
- **Delete Class.** Permanently removes a class from the system. This action cannot be undone.
- **View Class Data.** Opens a specific class to view its dashboard, student list, and overall reading performance.

**View Faculty Data.** Lets the admin open a teacher's classes, students, and reading statistics for monitoring purposes.

---

*CISC Kids · © 2026 · Made for Filipino learners.*
