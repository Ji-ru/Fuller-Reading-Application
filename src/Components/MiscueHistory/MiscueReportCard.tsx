// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { Miscue } from '../../Types/miscue';

// interface MiscueReportCardProps {
//   passageTitle: string;
//   accuracy: string;
//   timestamp: any;
//   miscues: Miscue[];
//   substitutionCount: number;
//   omissionCount: number;
//   insertionCount: number;
//   repetitionCount: number;
// }

// const MiscueReportCard: React.FC<MiscueReportCardProps> = ({
//   passageTitle,
//   accuracy,
//   timestamp,
//   miscues,
//   substitutionCount,
//   omissionCount,
//   insertionCount,
//   repetitionCount,
// }) => {
//   return (
//     <View style={styles.cardContainer}>

//       {/* Date */}
//       <Text style={styles.dateText}>
//         {timestamp?.toDate?.().toLocaleString() || '—'}
//       </Text>

//       {/* Accuracy */}
//       <Text style={styles.rowText}>
//         Accuracy: <Text style={styles.rowValue}>{accuracy}%</Text>
//       </Text>

//       {/* Total Miscues */}
//       <Text style={styles.rowText}>
//         Total Miscues:{' '}
//         <Text style={styles.totalValue}>{miscues.length}</Text>
//       </Text>

//       {/* Divider */}
//       <View style={styles.divider} />

//       {/* Substitution */}
//       <View style={styles.miscueBlock}>
//         <Text style={styles.miscueLabel}>
//           Substitution ({substitutionCount}):
//         </Text>
//         <Text style={styles.miscueValue}>
//           {miscues
//             .filter(m => m.type === 'substitution')
//             .map(m => `"${m.expected}"`)
//             .join(', ') || 'None'}
//         </Text>
//       </View>

//       {/* Omission */}
//       <View style={styles.miscueBlock}>
//         <Text style={styles.miscueLabel}>
//           Omission ({omissionCount}):
//         </Text>
//         <Text style={styles.miscueValue}>
//           {miscues
//             .filter(m => m.type === 'omission')
//             .map(m => `"${m.expected}"`)
//             .join(', ') || 'None'}
//         </Text>
//       </View>

//       {/* Insertion */}
//       <View style={styles.miscueBlock}>
//         <Text style={styles.miscueLabel}>
//           Insertion ({insertionCount}):
//         </Text>
//         <Text style={styles.miscueValue}>
//           {miscues
//             .filter(m => m.type === 'insertion')
//             .map(m => `"${m.spoken}"`)
//             .join(', ') || 'None'}
//         </Text>
//       </View>

//       {/* Repetition */}
//       <View style={styles.miscueBlock}>
//         <Text style={styles.miscueLabel}>
//           Repetition ({repetitionCount}):
//         </Text>
//         <Text style={styles.miscueValue}>
//           {miscues
//             .filter(m => m.type === 'repetition')
//             .map(m => `"${m.spoken}"`)
//             .join(', ') || 'None'}
//         </Text>
//       </View>

//     </View>
//   );
// };

// export default MiscueReportCard;

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: '#FFFFFF',
//     padding: 18,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#E6E6EE',

//     // Better shadow
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 3,

//     marginBottom: 16,
//     marginHorizontal: 16,
//   },

//   dateText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#2E2E3A',
//     marginBottom: 10,
//   },

//   rowText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 6,
//   },

//   rowValue: {
//     fontWeight: '700',
//     color: '#4CAF50',
//   },

//   totalValue: {
//     fontWeight: '700',
//     color: '#E53935',
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#EAEAF0',
//     marginVertical: 12,
//   },

//   miscueBlock: {
//     marginBottom: 10,
//   },

//   miscueLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },

//   miscueValue: {
//     fontSize: 14,
//     color: '#777',
//     marginLeft: 10,
//     marginTop: 2,
//   },
// });
