// This file is a custom hook, named with the convention "use..." so it can use React hooks like useState, useEffect, useRef, useCallback, useMemo.
// useState: manage internal status (e.g. isLoading), useEffect: handle side effects, useRef: persistent mutable values, useCallback/useMemo: memoize event handlers or calculations.
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { readFile } from 'react-native-fs';
import { API_KEY } from '@env';
import { Buffer } from 'buffer';

const ASSEMBLYAI_API_KEY = API_KEY;
const BASE_URL = 'https://api.assemblyai.com/v2';
const SPACE_URL = '';
export const useSpeechToText = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const processAudioWithHuggingFace = async (audioFile: string): Promise<string> => {
  //   try {
  //     setIsLoading(true);

  //     // Read WAV as base64
  //     const base64Audio = await readFile(audioFile, 'base64');

  //     // Gradio expects a specific data format
  //     const response = await fetch(SPACE_URL, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         data: [
  //           `data:audio/wav;base64,${base64Audio}` // Gradio Audio format
  //         ]
  //       }),
  //     });

  //     const result = await response.json();

  //     // Gradio returns results in a 'data' array
  //     if (result?.data && result.data.length > 0) {
  //       return result.data[0]; 
  //     }
  //     return 'No transcription found';
  //   } catch (error: any) {
  //     console.error('Space API Error:', error);
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  // DO NOT REMOVE
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


  // ASSEMBLY AI STT IMPLEMENTATION

  /**
 * Upload audio file to AssemblyAI
 */
  const uploadAudio = async (audioFile: string): Promise<string> => {
    // Read file as base64
    const base64Audio = await readFile(audioFile, 'base64');

    // Convert base64 → binary
    const binaryAudio = Buffer.from(base64Audio, 'base64');

    const uploadResponse = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/octet-stream',
      },
      body: binaryAudio,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      throw new Error(`Upload failed: ${errText}`);
    }

    const data = await uploadResponse.json();
    return data.upload_url;
  };


/**
* Request transcription
*/
  const requestTranscription = async (audioUrl: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        punctuate: true,
        format_text: true,
        language_detection: true,
      }),
    });

    const data = await response.json();
    return data.id;
  };

  /**
   * Poll transcription result
   */
  const pollTranscription = async (id: string): Promise<string> => {
    while (true) {
      const response = await fetch(`${BASE_URL}/transcript/${id}`, {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      });

      const data = await response.json();

      if (data.status === 'completed') {
        return data.text;
      }

      if (data.status === 'error') {
        throw new Error(data.error);
      }

      await new Promise<void>(resolve => setTimeout(resolve, 2500));
    }
  };

  /**
 * MAIN FUNCTION — DROP-IN REPLACEMENT
 */
  const processAudioWithAssemblyAI = useCallback(
    async (audioFile: string): Promise<string> => {
      try {
        setIsLoading(true);

        const uploadUrl = await uploadAudio(audioFile);
        const transcriptId = await requestTranscription(uploadUrl);
        const transcriptText = await pollTranscription(transcriptId);

        return transcriptText || 'No speech detected';
      } catch (error: any) {
        Alert.alert(
          'Transcription Error',
          'Failed to transcribe audio using AssemblyAI.',
        );
        console.log('Error: ' + error.message)
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getSimulatedResponse = (targetText: string) => {
    return targetText; // your existing fallback logic
  };

  /**
   * 
   * @param passageText 
   * @returns 
   */
  // const getSimulatedResponse = (passageText: string): string => {
  //   const simulatedResponses = [
  //     passageText,
  //     passageText.replace(/\.$/, ''),
  //     passageText.toLowerCase(),
  //     passageText.split(' ').slice(0, -1).join(' '),
  //   ];
  //   return simulatedResponses[
  //     Math.floor(Math.random() * simulatedResponses.length)
  //   ];
  // };

  return {
    isLoading,
    // processAudioWithHuggingFace,
    // processAudioWithGoogle,
    processAudioWithAssemblyAI,
    getSimulatedResponse,
  };
};
