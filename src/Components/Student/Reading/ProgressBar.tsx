// import { Text, View } from 'react-native';
// import readingStyles from '../ui/ReadingActivityStyles';
// const accuracyBar = ({ accuracy }) => {
//   const accuBar = parseFloat(accuracy);
//   const width = Math.min(100, Math.max(0, accuBar));
//   const getBarColor = () => {
//     if (accuBar >= 90) return '#4CAF50';
//     if (accuBar >= 80) return '#FFC107';
//     if (accuBar >= 70) return '#FF9800';
//     return '#F44336';
//   };

//   return (
//     <View style={{ marginVertical: 15 }}>
//       {/* Accuracy Level Text */}
//       <Text
//         style={{
//           textAlign: 'center',
//           fontSize: 16,
//           fontWeight: 'bold',
//           color: getBarColor(),
//           marginBottom: 5,
//         }}
//       >
//         {accuracy}%
//       </Text>

//       {/* Progress Bar */}
//       <View style={readingStyles.calculationContainer}>
//         <View
//           style={[
//             readingStyles.calculationText,
//             {
//               width: `${width}%`,
//               backgroundColor: getBarColor(),
//             },
//           ]}
//         />
//       </View>
//     </View>
//   );
// };
