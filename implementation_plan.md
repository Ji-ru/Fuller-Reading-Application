# Goal Description
The user wants to enhance the analytics on two main dashboards:
1. **Admin Dashboard**: Update the "Reading Level Distribution" chart to include filters for Grade Level and Class.
2. **Faculty Dashboard**: Add two new components for "Alphabet Mastery" and "Word Mastery" that show progress per Class (similar to the individual student versions), with data driven by the currently selected class filter.

## Proposed Changes

### Admin Dashboard Updates
* **[NEW] `src/Hooks/Admin/useAdminReadingLevelAnalytics.ts`**
  * Create a new hook that fetches all students and classes context, returning an array of student data that includes their reading level, grade level, and class ID.
* **[MODIFY] [src/Components/Admin/ReadingLevelDistributionChart.tsx](file:///c:/rubi_web/CISC_Capstone/MiscueReading/src/Components/Admin/ReadingLevelDistributionChart.tsx)**
  * Introduce UI controls (dropdowns or segmented buttons) for filtering by `Grade Level` and [Class](file:///c:/rubi_web/CISC_Capstone/MiscueReading/src/Hooks/use_ReadingStudentStats.ts#28-56).
  * Update the PieChart to dynamically recompute the `beginner`, `intermediate`, and `advanced` counts based on the filtered data.

---

### Faculty Dashboard Updates
* **[NEW] `src/Hooks/Faculty/useClassAlphabetMastery.ts`**
  * Create a hook to fetch and aggregate Alphabet sessions for a group of students (based on the `facultyId` and `filter` for class/overall).
  * The hook will combine session data from all applicable students by date, averaging their accuracy and mastery percentages, and formatting them into the `slots` and `summary` shapes expected by the UI.
* **[NEW] `src/Hooks/Faculty/useClassWordMastery.ts`**
  * Create a hook to fetch and aggregate Word sessions for the class.
  * Similar to alphabet, it will combine chapters and lessons data across multiple students to find class-wide averages for word mastery.
* **[NEW] `src/Components/Faculty/Dashboard/ClassAlphabetMastery.tsx`**
  * Replicate the UI from [StudentAlphabetMastery.tsx](file:///c:/rubi_web/CISC_Capstone/MiscueReading/src/Components/Faculty/StudentView_Status/StudentAlphabetMastery.tsx) but connect it to the new `useClassAlphabetMastery` hook.
  * Adjust descriptions to reflect that it is "Class Average" rather than individual data.
* **[NEW] `src/Components/Faculty/Dashboard/ClassWordMastery.tsx`**
  * Replicate the UI from [StudentWordMastery.tsx](file:///c:/rubi_web/CISC_Capstone/MiscueReading/src/Components/Faculty/StudentView_Status/StudentWordMastery.tsx) but connect it to the new `useClassWordMastery` hook.
* **[MODIFY] [src/Screens/Faculty/Faculty_Dashboard.tsx](file:///c:/rubi_web/CISC_Capstone/MiscueReading/src/Screens/Faculty/Faculty_Dashboard.tsx)**
  * Import and render `<ClassAlphabetMastery>` and `<ClassWordMastery>`.
  * Pass the exact same `readingStatusFilter` and `facultyId` to them so they sync with the global class dropdown.

## Verification Plan

### Automated Tests
* N/A. No explicit automated testing is set up for React Native UI charts in this project. 

### Manual Verification
* Admin Dashboard: Wait for the charts to render, interact with the new Grade and Class dropdowns, and visually confirm the PieChart sections respond correctly and numbers add up.
* Faculty Dashboard: Select different classes from the existing global filters and ensure the new Alphabet and Word Mastery components reload and display averaged data without throwing errors. Confirm the UI matches the individual student views.
