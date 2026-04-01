// This file is a custom hook, named with the convention "use..." so it can use React hooks like useState, useEffect, useRef, useCallback, useMemo.
// useState: manage internal status (e.g. isLoading), useEffect: handle side effects, useRef: persistent mutable values, useCallback/useMemo: memoize event handlers or calculations.
import { useState, useCallback } from 'react';
import { readFile } from 'react-native-fs';
import { API_KEY } from '@env';
import { Buffer } from 'buffer';

const ASSEMBLYAI_API_KEY = API_KEY;
const BASE_URL = 'https://api.assemblyai.com/v2';

export const useSpeechToText = () => {
  const [isLoading, setIsLoading] = useState(false);

  // ── STT error modal state ──────────────────────────────────────────────────
  // Exposed to the calling screen so it can render a proper modal instead of
  // an Alert.alert() which has no styling control.
  const [sttErrorVisible, setSttErrorVisible] = useState(false);
  const [sttErrorMessage, setSttErrorMessage] = useState('');

  /** Call this when the user dismisses or retries from the error modal. */
  const clearSttError = useCallback(() => {
    setSttErrorVisible(false);
    setSttErrorMessage('');
  }, []);

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
   *
   * On failure, instead of showing an Alert, the error state (sttErrorVisible /
   * sttErrorMessage) is set so the calling screen can render a proper modal.
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
        // Surface the error through state instead of Alert so the calling
        // screen can show a styled, dismissible modal with retry support.
        setSttErrorVisible(true);
        setSttErrorMessage(
          error?.message
            ? `Transcription failed: ${error.message}`
            : 'Failed to transcribe audio. Please check your internet connection and try again.',
        );
        console.log('STT Error: ' + error.message);
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

  return {
    isLoading,
    processAudioWithAssemblyAI,
    getSimulatedResponse,
    // ── STT error modal ──────────────────────────────────────────────────────
    sttErrorVisible,
    sttErrorMessage,
    clearSttError,
  };
};
