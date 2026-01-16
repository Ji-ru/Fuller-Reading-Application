import { useState } from 'react';
import { Alert } from 'react-native';
import { readFile } from 'react-native-fs';
import { API_KEY } from '@env';

export const useSpeechToText = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processAudioWithGoogle = async (audioFile: string): Promise<string> => {
    try {
      setIsLoading(true);
      const audioData = await readFile(audioFile, 'base64');

      const requestBody = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'command_and_search',
        },
        audio: {
          content: audioData,
        },
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].alternatives[0].transcript;
      } else {
        return 'No speech detected';
      }
    } catch (error) {
      // Fallback to simulated response
      Alert.alert(
        'API Error',
        'Using simulated response. Check your API key and internet connection.',
      );
      throw error; // Re-throw to handle in component
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (passageText: string): string => {
    const simulatedResponses = [
      passageText,
      passageText.replace(/\.$/, ''),
      passageText.toLowerCase(),
      passageText.split(' ').slice(0, -1).join(' '),
    ];
    return simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
  };

  return {
    isLoading,
    processAudioWithGoogle,
    getSimulatedResponse,
  };
};