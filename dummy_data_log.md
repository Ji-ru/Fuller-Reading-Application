# Dummy Data Injection Log

This document tracks all temporary changes made to visualize the analytics dashboard with dummy data.

## Files Modified:

1. **[DummyPerformanceData.ts](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Utilities/DummyPerformanceData.ts)** (NEW FILE)
   - Contains the `DUMMY_REPORTS` array with mock reading sessions for "Ang Ama" and "Bibo ang Bibe".

2. **[PerformanceTab.tsx](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Components/Student/PerformanceTab.tsx)**
   - **Line 10**: Added import for `DUMMY_REPORTS`.
   - **Line 17**: Renamed `reports` prop to `realReports` and created a merged `reports` array:
     ```tsx
     const reports = [...(realReports || []), ...DUMMY_REPORTS];
     ```

3. **[PassageHistoryTab.tsx](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Components/Student/PassageHistoryTab.tsx)**
   - **Line 6**: Added import for `DUMMY_REPORTS`.
   - **Line 30**: Renamed `reports` prop to `realReports` and created a merged `reports` array:
     ```tsx
     const reports = [...(realReports || []), ...DUMMY_REPORTS];
     ```

4. **[ReadingTimeChart.tsx](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Components/Student/Performance/ReadingTimeChart.tsx)**
   - `reports` prop + `useMemo` merge logic for dummy data into chart slots.

5. **[AccuracySpeedChart.tsx](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Components/Student/Performance/AccuracySpeedChart.tsx)** (NEW FILE)
   - Receives `reports` prop with dummy data and passes to hook for visualization.

6. **[use_StudentAccuracySpeedTrends.ts](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Hooks/use_StudentAccuracySpeedTrends.ts)** (NEW FILE)
   - Accepts `injectedReports` param to merge dummy reports with Firebase data.

7. **[MiscueInsightsChart.tsx](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Components/Student/Performance/MiscueInsightsChart.tsx)** (NEW FILE)
   - Receives `reports` prop with dummy data and passes to hook for visualization.

8. **[use_StudentMiscueInsights.ts](file:///c:/rubi_web/CISC_Capstone/MarungkoReading/src/Hooks/use_StudentMiscueInsights.ts)** (NEW FILE)
   - Accepts `injectedReports` param to merge dummy reports with Firebase data.

## How to Remove:
1. Delete the file `src/Utilities/DummyPerformanceData.ts`.
2. In `PerformanceTab.tsx`: Remove import on line 10. Change line 17 back to `({ studentId, reports })` and remove the merge line.
3. In `PassageHistoryTab.tsx`: Remove import on line 6. Change line 30 back to `({ reports, onStartReading })` and remove the merge line.
4. In `ReadingTimeChart.tsx`: Remove `reports` prop, remove the `useMemo` merge block, and rename `realData`/`realTotal` back to `data`/`totalSessions`.
5. In `AccuracySpeedChart.tsx`: Remove `reports` prop. In hook, remove `injectedReports` parameter.
6. In `MiscueInsightsChart.tsx`: Remove `reports` prop. In hook, remove `injectedReports` parameter.
7. Delete this file (`dummy_data_log.md`).

