// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import RNFS from 'react-native-fs';
// import { API_KEY } from '@env';

// const READING_PASSAGE = `The quick brown fox jumps over the lazy dog. This sentence contains every letter in the English alphabet.`;

// const ReadingTestScreen = () => {
//   const [recording, setRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [score, setScore] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);

//   const startRecording = async () => {
//     try {
//       setTranscript('');
//       setScore(null);
//       setRecording(true);
//       await NitroRecorder.startRecorder();
//     } catch (err) {
//       console.error('Recording error:', err);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       setRecording(false);
//       const filePath = await NitroRecorder.stopRecorder(); // returns a string
//       if (filePath) {
//         await sendToGoogle(filePath);
//       }
//     } catch (err) {
//       console.error('Stop recording error:', err);
//     }
//   };

//   const sendToGoogle = async (audioFilePath: string) => {
//     try {
//       setLoading(true);
//       const audioData = await RNFS.readFile(audioFilePath, 'base64');

//       const response = await axios.post(
//         `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
//         {
//           config: {
//             encoding: 'LINEAR16',
//             languageCode: 'en-US',
//           },
//           audio: { content: audioData },
//         },
//       );

//       const transcription =
//         response.data.results
//           ?.map((r: any) => r.alternatives[0].transcript)
//           .join(' ') || '';

//       setTranscript(transcription);
//       calculateScore(transcription);
//     } catch (err) {
//       console.error('Speech-to-text error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateScore = (spoken: string) => {
//     const targetWords = READING_PASSAGE.toLowerCase().split(/\s+/);
//     const spokenWords = spoken.toLowerCase().split(/\s+/);

//     const matched = spokenWords.filter((w, i) => w === targetWords[i]).length;
//     const scorePercent = Math.round((matched / targetWords.length) * 100);

//     setScore(scorePercent);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Reading Test</Text>

//       <ScrollView style={styles.passageBox}>
//         <Text style={styles.passage}>{READING_PASSAGE}</Text>
//       </ScrollView>

//       {loading ? (
//         <ActivityIndicator size="large" color="#007AFF" />
//       ) : (
//         <TouchableOpacity
//           style={[styles.button, recording && { backgroundColor: '#E74C3C' }]}
//           onPress={recording ? stopRecording : startRecording}
//         >
//           <Text style={styles.buttonText}>
//             {recording ? 'Stop' : 'Start Reading'}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {transcript ? (
//         <>
//           <Text style={styles.sectionTitle}>Recognized Speech:</Text>
//           <ScrollView style={styles.transcriptBox}>
//             <Text style={styles.transcript}>{transcript}</Text>
//           </ScrollView>
//         </>
//       ) : null}

//       {score !== null && (
//         <Text style={styles.score}>Reading Accuracy: {score}%</Text>
//       )}
//     </View>
//   );
// };

// export default ReadingTestScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FAFAFA',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#333',
//   },
//   passageBox: {
//     backgroundColor: '#FFF',
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 2,
//   },
//   passage: {
//     fontSize: 16,
//     color: '#555',
//     lineHeight: 24,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   buttonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   transcriptBox: {
//     backgroundColor: '#F0F0F0',
//     padding: 10,
//     borderRadius: 10,
//     marginTop: 10,
//     maxHeight: 120,
//   },
//   transcript: {
//     fontSize: 15,
//     color: '#333',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 10,
//   },
//   score: {
//     fontSize: 20,
//     fontWeight: '700',
//     textAlign: 'center',
//     color: '#2ECC71',
//     marginTop: 15,
//   },
// });
