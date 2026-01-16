// ActiveHoursChart.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useActiveHours } from '../../Hooks/useActiveHours';

interface ActiveHoursChartProps {
  facultyId?: string | null;
  data?: { day: string; hours: number }[];
}

const ActiveHoursChart: React.FC<ActiveHoursChartProps> = ({
  facultyId = null,
  data,
}) => {
  // Use the hook if facultyId is provided
  const { chartData: hookData, loading, error } = useActiveHours(facultyId);

  // Dummy data matching the reference image
  const defaultData = [
    { day: 'Su', hours: 2 },
    { day: 'M', hours: 5 },
    { day: 'T', hours: 3 },
    { day: 'W', hours: 4 },
    { day: 'Th', hours: 6 },
    { day: 'F', hours: 3 },
    { day: 'S', hours: 3 },
  ];

  // Determine which data to use
  let chartData = defaultData;
  let displayInMinutes = false;

  if (data) {
    chartData = data;
  } else if (hookData && hookData.length > 0) {
    chartData = hookData;
  }

  // Check if all values are very small (less than 1 hour)
  const maxValue = Math.max(...chartData.map(d => d.hours));
  displayInMinutes = maxValue < 1;

  console.log(data)

  // Convert to minutes if needed for better visibility
  const displayData = displayInMinutes
    ? chartData.map(item => ({
        day: item.day,
        hours: item.hours * 60, // Convert hours to minutes
        originalHours: item.hours,
      }))
    : chartData.map(item => ({
        day: item.day,
        hours: item.hours,
        originalHours: item.hours,
      }));



  // Dynamic max value based on data
  const maxDisplayValue = displayInMinutes
    ? Math.ceil(Math.max(...displayData.map(d => d.hours), 10)) // At least 10 minutes
    : Math.ceil(Math.max(...displayData.map(d => d.hours), 8)); // At least 8 hours

  const chartHeight = 200;

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Active Hours</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B5FED" />
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Active Hours</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading data</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  // Generate Y-axis labels dynamically
  const yAxisLabels = displayInMinutes
    ? Array.from({ length: 5 }, (_, i) => Math.round((maxDisplayValue / 4) * (4 - i)))
    : [8, 6, 4, 2, 0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Active {displayInMinutes ? 'Minutes' : 'Hours'}
      </Text>

      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {yAxisLabels.map((value, index) => (
            <View key={index} style={styles.yAxisLabelContainer}>
              <Text style={styles.yAxisLabel}>
                {value}
                {displayInMinutes ? 'm' : 'h'}
              </Text>
            </View>
          ))}
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Horizontal grid lines */}
          <View style={styles.gridLinesContainer}>
            {yAxisLabels.map((_, index) => (
              <View key={index} style={styles.gridLine} />
            ))}
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {displayData.map((item, index) => {
              const barHeight = Math.max(
                (item.hours / maxDisplayValue) * chartHeight,
                2 // Minimum height for visibility
              );

              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barHeight }]} />
                  </View>
                  <Text style={styles.xAxisLabel}>
                    {item.day}
                    {'\n'}
                    <Text style={styles.xAxisValue}>
                      {displayInMinutes
                        ? `${item.hours.toFixed(2)}m`
                        : `${item.hours.toFixed(2)}h`}
                    </Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 250,
  },
  yAxisContainer: {
    width: 35,
    height: 210,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabelContainer: {
    height: 20,
    justifyContent: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#999',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 8,
    marginTop: 40,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 200,
  },
  bar: {
    width: 20,
    backgroundColor: '#5B5FED',
    borderRadius: 4,
    minHeight: 2,
  },
  xAxisLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  xAxisValue: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#BBB',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  errorSubtext: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ActiveHoursChart;
// ActiveHoursChart.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ActivityIndicator,
//   TouchableOpacity,
//   ScrollView,
//   Modal,
//   FlatList
// } from 'react-native';
// import { useActiveHours } from '../../Hooks/useActiveHours';

// interface ActiveHoursChartProps {
//   facultyId?: string | null;
// }

// const ActiveHoursChart: React.FC<ActiveHoursChartProps> = ({
//   facultyId = null,
// }) => {
//   const currentYear = new Date().getFullYear();
//   const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
//   const [selectedYear, setSelectedYear] = useState<number>(currentYear);
//   const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
//   const [showYearFilterModal, setShowYearFilterModal] = useState(false);
//   const [availableYears, setAvailableYears] = useState<number[]>([]);

//   // Initialize available years
//   useEffect(() => {
//     const years: number[] = [];
//     // Show current year and previous 4 years
//     for (let i = 0; i <= 4; i++) {
//       years.push(currentYear - i);
//     }
//     setAvailableYears(years);
//   }, [currentYear]);

//   // Use the hook with time range and selected year
//   const { 
//     chartData, 
//     loading, 
//     error,
//     stats 
//   } = useActiveHours(facultyId, {
//     timeRange,
//     selectedYear,
//   });

//   // Determine what unit to display (hours or minutes)
//   const maxValue = Math.max(...chartData.map(d => d.hours));
//   const displayInMinutes = maxValue < 1 && maxValue > 0;

//   // Prepare data for display
//   const displayData = displayInMinutes
//     ? chartData.map(item => ({
//         day: item.day,
//         hours: item.hours * 60,
//       }))
//     : chartData;

//   // Calculate max value for scaling
//   const maxDisplayValue = Math.max(
//     ...displayData.map(d => d.hours),
//     displayInMinutes ? 10 : 1
//   );

//   const chartHeight = 160;

//   // Generate Y-axis labels
//   const generateYAxisLabels = () => {
//     if (maxDisplayValue === 0) {
//       return [0, 0, 0, 0, 0];
//     }
//     const labels = [];
//     const step = maxDisplayValue / 4;
//     for (let i = 4; i >= 0; i--) {
//       const value = Math.round(step * i * 100) / 100;
//       labels.push(value);
//     }
//     return labels;
//   };

//   const yAxisLabels = generateYAxisLabels();

//   const handleTimeRangeChange = (range: 'week' | 'month' | 'year') => {
//     setTimeRange(range);
//     setShowTimeFilterModal(false);
//   };

//   const handleYearChange = (year: number) => {
//     setSelectedYear(year);
//     setShowYearFilterModal(false);
//   };

//   // Calculate appropriate bar width based on time range and year
//   const getBarWidth = () => {
//     if (timeRange === 'week') return 50;
//     if (timeRange === 'month') {
//       if (selectedYear === currentYear) {
//         const daysInMonth = chartData.length;
//         if (daysInMonth <= 15) return 40;
//         if (daysInMonth <= 31) return 30;
//         return 25;
//       }
//       return 35; // For past years showing months
//     }
//     if (timeRange === 'year') return 40; // 12 months
//     return 50;
//   };

//   const barWidth = getBarWidth();
//   const containerWidth = chartData.length * (barWidth + 8);

//   // Get time range label based on selected year
//   const getTimeRangeLabel = () => {
//     switch (timeRange) {
//       case 'week':
//         return selectedYear === currentYear ? 'Last 4 Weeks' : `4 Weeks of ${selectedYear}`;
//       case 'month':
//         return selectedYear === currentYear ? 'This Month' : `Months of ${selectedYear}`;
//       case 'year':
//         return `Year ${selectedYear}`;
//       default:
//         return 'Last 4 Weeks';
//     }
//   };

//   // Calculate xAxisLabel fontSize dynamically
//   const getXAxisLabelFontSize = () => {
//     if (timeRange === 'month' && selectedYear !== currentYear) {
//       return 9;
//     }
//     return 10;
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Active Hours</Text>
//           <View style={styles.filterRow}>
//             <TouchableOpacity style={styles.yearFilterButton} disabled>
//               <Text style={styles.yearFilterButtonText}>{selectedYear}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.timeFilterButton} disabled>
//               <Text style={styles.timeFilterButtonText}>
//                 {getTimeRangeLabel()}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#5B5FED" />
//           <Text style={styles.loadingText}>Loading chart data...</Text>
//         </View>
//       </View>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Active Hours</Text>
//           <View style={styles.filterRow}>
//             <TouchableOpacity style={styles.yearFilterButton} disabled>
//               <Text style={styles.yearFilterButtonText}>{selectedYear}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.timeFilterButton} disabled>
//               <Text style={styles.timeFilterButtonText}>
//                 {getTimeRangeLabel()}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Error loading data</Text>
//           <Text style={styles.errorSubtext}>{error}</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header with filters */}
//       <View style={styles.header}>
//         <Text style={styles.title}>Active {displayInMinutes ? 'Minutes' : 'Hours'}</Text>
//         <View style={styles.filterRow}>
//           <TouchableOpacity 
//             style={styles.yearFilterButton}
//             onPress={() => setShowYearFilterModal(true)}
//           >
//             <Text style={styles.yearFilterButtonText}>{selectedYear}</Text>
//             <Text style={styles.filterIcon}>▼</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.timeFilterButton}
//             onPress={() => setShowTimeFilterModal(true)}
//           >
//             <Text style={styles.timeFilterButtonText}>
//               {getTimeRangeLabel()}
//             </Text>
//             <Text style={styles.filterIcon}>▼</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Stats summary */}
//       <View style={styles.statsContainer}>
//         <View style={styles.statItem}>
//           <Text style={styles.statLabel}>Total</Text>
//           <Text style={styles.statValue}>
//             {stats.totalHours.toFixed(2)} {displayInMinutes ? 'min' : 'hrs'}
//           </Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={styles.statLabel}>Average</Text>
//           <Text style={styles.statValue}>
//             {stats.averagePerPeriod.toFixed(2)} {displayInMinutes ? 'min' : 'hrs'}
//           </Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={styles.statLabel}>Peak</Text>
//           <Text style={styles.statValue}>
//             {stats.peakValue.toFixed(2)} {displayInMinutes ? 'min' : 'hrs'}
//           </Text>
//         </View>
//       </View>

//       {/* Chart */}
//       <View style={styles.chartContainer}>
//         {/* Y-axis labels */}
//         <View style={styles.yAxisContainer}>
//           {yAxisLabels.map((value, index) => (
//             <View key={index} style={styles.yAxisLabelContainer}>
//               <Text style={styles.yAxisLabel}>
//                 {value.toFixed(1)}
//                 {displayInMinutes ? 'm' : 'h'}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* Chart area */}
//         <View style={styles.chartArea}>
//           {/* Horizontal grid lines */}
//           <View style={styles.gridLinesContainer}>
//             {yAxisLabels.map((_, index) => (
//               <View key={index} style={styles.gridLine} />
//             ))}
//           </View>

//           {/* Bars */}
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={containerWidth > 400 ? { width: containerWidth } : {}}
//           >
//             <View style={styles.barsContainer}>
//               {displayData.map((item, index) => {
//                 const barHeight = (item.hours / maxDisplayValue) * chartHeight;
                
//                 return (
//                   <View key={index} style={[styles.barColumn, { width: barWidth }]}>
//                     <View style={styles.barWrapper}>
//                       <View style={[styles.bar, { 
//                         height: Math.max(barHeight, 2),
//                         width: barWidth - 10 
//                       }]} />
//                     </View>
//                     <Text style={[styles.xAxisLabel, { fontSize: getXAxisLabelFontSize() }]} numberOfLines={2}>
//                       {item.day}
//                     </Text>
//                   </View>
//                 );
//               })}
//             </View>
//           </ScrollView>
//         </View>
//       </View>

//       {/* Legend for current vs past years */}
//       {selectedYear !== currentYear && timeRange === 'month' && (
//         <View style={styles.noteContainer}>
//           <Text style={styles.noteText}>
//             Showing all 12 months of {selectedYear}
//           </Text>
//         </View>
//       )}

//       {/* Time Range Filter Modal */}
//       <Modal
//         visible={showTimeFilterModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowTimeFilterModal(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowTimeFilterModal(false)}
//         >
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Select Time Range</Text>
//             {(['week', 'month', 'year'] as const).map((range) => (
//               <TouchableOpacity
//                 key={range}
//                 style={[
//                   styles.modalOption,
//                   timeRange === range && styles.modalOptionSelected
//                 ]}
//                 onPress={() => handleTimeRangeChange(range)}
//               >
//                 <Text style={[
//                   styles.modalOptionText,
//                   timeRange === range && styles.modalOptionTextSelected
//                 ]}>
//                   {range === 'week' 
//                     ? selectedYear === currentYear ? 'Last 4 Weeks' : `4 Weeks of ${selectedYear}`
//                     : range === 'month'
//                     ? selectedYear === currentYear ? 'This Month' : `Months of ${selectedYear}`
//                     : `Year ${selectedYear}`}
//                 </Text>
//                 {timeRange === range && (
//                   <Text style={styles.checkmark}>✓</Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Year Filter Modal */}
//       <Modal
//         visible={showYearFilterModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowYearFilterModal(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowYearFilterModal(false)}
//         >
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Select Year</Text>
//             <FlatList
//               data={availableYears}
//               keyExtractor={(item) => item.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[
//                     styles.modalOption,
//                     selectedYear === item && styles.modalOptionSelected
//                   ]}
//                   onPress={() => handleYearChange(item)}
//                 >
//                   <Text style={[
//                     styles.modalOptionText,
//                     selectedYear === item && styles.modalOptionTextSelected
//                   ]}>
//                     {item}
//                   </Text>
//                   {selectedYear === item && (
//                     <Text style={styles.checkmark}>✓</Text>
//                   )}
//                 </TouchableOpacity>
//               )}
//               style={styles.modalList}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     elevation: 3,
//     marginBottom: 16,
//   },
//   header: {
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontFamily: 'Satoshi-Bold',
//     color: '#333',
//     marginBottom: 12,
//   },
//   filterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   yearFilterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F5F5',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 8,
//   },
//   yearFilterButtonText: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#2C3E50',
//     flex: 1,
//   },
//   timeFilterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F0F8',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     flex: 1,
//     marginLeft: 8,
//   },
//   timeFilterButtonText: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//     color: '#5B5FED',
//     flex: 1,
//   },
//   filterIcon: {
//     fontSize: 12,
//     color: '#5B5FED',
//     marginLeft: 4,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   statItem: {
//     alignItems: 'center',
//     minWidth: 80,
//   },
//   statLabel: {
//     fontSize: 12,
//     fontFamily: 'Satoshi-Medium',
//     color: '#7F8C8D',
//     marginBottom: 4,
//   },
//   statValue: {
//     fontSize: 14,
//     fontFamily: 'Satoshi-Bold',
//     color: '#2C3E50',
//   },
//   chartContainer: {
//     flexDirection: 'row',
//     height: 220,
//   },
//   yAxisContainer: {
//     width: 40,
//     height: 160,
//     justifyContent: 'space-between',
//     paddingRight: 8,
//   },
//   yAxisLabelContainer: {
//     height: 20,
//     justifyContent: 'center',
//   },
//   yAxisLabel: {
//     fontSize: 11,
//     fontFamily: 'Satoshi-Medium',
//     color: '#999',
//     textAlign: 'right',
//   },
//   chartArea: {
//     flex: 1,
//     position: 'relative',
//   },
//   gridLinesContainer: {
//     position: 'absolute',
//     top: 5,
//     left: 0,
//     right: 0,
//     height: 160,
//     justifyContent: 'space-between',
//   },
//   gridLine: {
//     height: 1,
//     backgroundColor: '#F0F0F0',
//   },
//   barsContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     height: 160,
//     paddingHorizontal: 4,
//     marginTop: 40,
//   },
//   barColumn: {
//     alignItems: 'center',
//     marginHorizontal: 2,
//   },
//   barWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     height: 160,
//   },
//   bar: {
//     backgroundColor: '#5B5FED',
//     borderRadius: 3,
//     minHeight: 2,
//   },
//   xAxisLabel: {
//     fontFamily: 'Satoshi-Medium',
//     color: '#999',
//     textAlign: 'center',
//     marginTop: 6,
//     height: 24,
//   },
//   noteContainer: {
//     marginTop: 8,
//     padding: 8,
//     backgroundColor: '#FFF9E6',
//     borderRadius: 6,
//     borderLeftWidth: 4,
//     borderLeftColor: '#FFC107',
//   },
//   noteText: {
//     fontSize: 11,
//     fontFamily: 'Satoshi-Medium',
//     color: '#8B7355',
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 20,
//     width: '80%',
//     maxHeight: '60%',
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontFamily: 'Satoshi-Bold',
//     color: '#2C3E50',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   modalList: {
//     maxHeight: 300,
//   },
//   modalOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   modalOptionSelected: {
//     backgroundColor: '#F0F0F8',
//   },
//   modalOptionText: {
//     fontSize: 16,
//     fontFamily: 'Satoshi-Medium',
//     color: '#2C3E50',
//   },
//   modalOptionTextSelected: {
//     color: '#5B5FED',
//   },
//   checkmark: {
//     fontSize: 16,
//     color: '#5B5FED',
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//   },
//   errorContainer: {
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: '#FF6B6B',
//     fontSize: 14,
//     fontFamily: 'Satoshi-Medium',
//   },
//   errorSubtext: {
//     color: '#999',
//     fontSize: 12,
//     fontFamily: 'Satoshi-Regular',
//     marginTop: 4,
//     textAlign: 'center',
//   },
// });

// export default ActiveHoursChart;