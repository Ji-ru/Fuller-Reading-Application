// This file is a custom hook, named with the convention "use..." so it can use React hooks like useState, useEffect, useRef, useCallback, useMemo.
// useState: manage internal status (e.g. isLoading), useEffect: handle side effects, useRef: persistent mutable values, useCallback/useMemo: memoize event handlers or calculations.
import { useState } from 'react';
import { Alert } from 'react-native';
import { readFile } from 'react-native-fs';
import { API_KEY } from '@env';
import { Buffer } from 'buffer';

// const MODEL_URL = 'https://api-inference.huggingface.co/models/jayarizco101/fuller-finetuned-Wav2vec2';
const SPACE_URL = 'https://jayarizco101-wav2vec2-transcriber.hf.space/run/predict';

export const useSpeechToText = () => {
  const [isLoading, setIsLoading] = useState(false);
  const processAudioWithHuggingFace = async (audioFile: string): Promise<string> => {
    try {
      setIsLoading(true);
  
      // Read WAV as base64
      const base64Audio = await readFile(audioFile, 'base64');
      
      // Gradio expects a specific data format
      const response = await fetch(SPACE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your Space is private, you need the Bearer token here
          // 'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          data: [
            `data:audio/wav;base64,${base64Audio}` // Gradio Audio format
          ]
        }),
      });
  
      const result = await response.json();
      
      // Gradio returns results in a 'data' array
      if (result?.data && result.data.length > 0) {
        return result.data[0]; 
      }
      console.log('THE MODEL IS RUNNING AS EXPECTED');
      return 'No transcription found';
    } catch (error: any) {
      console.error('Space API Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // const processAudioWithHuggingFace = async (
  //   audioFile: string,
  // ): Promise<string> => {
  //   try {
  //     setIsLoading(true);
  //     const audioData = await readFile(audioFile, 'base64');

  //     const modelEndpoint =
  //       'https://router.huggingface.co/models/jayarizco101/fuller-finetuned-Wav2vec2';

  //     const response = await fetch(modelEndpoint, {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${API_KEY}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         inputs: audioData, // Send base64 encoded audio
  //         // Some models might need additional parameters
  //         parameters: {
  //           return_timestamps: false, // Adjust based on your needs
  //           // Add other model-specific parameters here
  //         },
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(
  //         `Hugging Face API error: ${response.status} - ${errorText}`,
  //       );
  //     }

  //     const data = await response.json();
  //     // The response structure depends on your model
  //     // For Wav2Vec2, it typically returns {text: "transcribed text"}
  //     // You might need to adjust this based on your actual model response
  //     if (data.text) {
  //       return data.text;
  //     } else if (Array.isArray(data) && data[0]?.text) {
  //       // Some Hugging Face models return an array
  //       return data[0].text;
  //     } else {
  //       console.warn('Unexpected response format:', data);
  //       return 'No transcription found';
  //     }
  //   } catch (error: any) {
  //     // Fallback to simulated response
  //     Alert.alert(
  //       'API Error',
  //       'Failed to process audio with Hugging Face. Using simulated response.',
  //     );
  //     console.log('HuggingFace API Error: ' + error.message);
  //     throw new Error('HuggingFace API Error: ' + error.message);

  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const processAudioWithGoogle = async (audioFile: string): Promise<string> => {
  //   try {
  //     setIsLoading(true);
  //     const audioData = await readFile(audioFile, 'base64');

  //     const requestBody = {
  //       config: {
  //         encoding: 'LINEAR16',
  //         sampleRateHertz: 16000,
  //         languageCode: 'en-US',
  //         enableAutomaticPunctuation: true,
  //         model: 'command_and_search',
  //       },
  //       audio: {
  //         content: audioData,
  //       },
  //     };

  //     const response = await fetch(
  //       `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(requestBody),
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Google API error: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     if (data.results && data.results.length > 0) {
  //       return data.results[0].alternatives[0].transcript;
  //     } else {
  //       return 'No speech detected';
  //     }
  //   } catch (error) {
  //     // Fallback to simulated response
  //     Alert.alert(
  //       'API Error',
  //       'Using simulated response. Check your API key and internet connection.',
  //     );
  //     throw error; // Re-throw to handle in component
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getSimulatedResponse = (passageText: string): string => {
    const simulatedResponses = [
      passageText,
      passageText.replace(/\.$/, ''),
      passageText.toLowerCase(),
      passageText.split(' ').slice(0, -1).join(' '),
    ];
    return simulatedResponses[
      Math.floor(Math.random() * simulatedResponses.length)
    ];
  };

  return {
    isLoading,
    // processAudioWithGoogle,
    getSimulatedResponse,
    processAudioWithHuggingFace
  };
};
