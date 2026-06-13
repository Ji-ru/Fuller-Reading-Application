// This file is a custom hook, named with the convention "use..." so it can use React hooks like useState, useEffect, useRef, useCallback, useMemo.
// useState: manage internal status (e.g. isLoading), useEffect: handle side effects, useRef: persistent mutable values, useCallback/useMemo: memoize event handlers or calculations.
import { useState, useCallback } from 'react';
import { readFile } from 'react-native-fs';
import { API_KEY, DEEPGRAM_API } from '@env';
import { Buffer } from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';

// ASSEMBLY API AND URL
const ASSEMBLYAI_API_KEY = API_KEY;
const BASE_URL = 'https://api.assemblyai.com/v2';

// DEEPGRAM API, URL and KEY
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen';

type Utterance = {
  transcript: string;
  confidence: number;
  start?: number;
  end?: number;
};

type DeepgramResponse = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
        confidence?: number;
        utterances?: Utterance[];
      }>;
    }>;
  };
};

const extractTranscript = (data: any): string => {
  const candidate =
    data?.text ??
    data?.transcript ??
    data?.transcription ??
    data?.result?.text ??
    data?.result?.transcript ??
    data?.results?.[0]?.text ??
    data?.results?.[0]?.transcript ??
    data?.[0]?.text ??
    data?.[0]?.transcript ??
    (typeof data === 'string' ? data : '');

  return typeof candidate === 'string' ? candidate.trim() : '';
};
// I recommend moving query params into a URLSearchParams object for readability
const getDeepgramUrl = () => {
  const params = new URLSearchParams({
    model: 'nova-3',
    smart_format: 'true',
    punctuate: 'true',
    utterances: 'true',
    language: 'en-US', // Or 'fil' for Filipino, etc.
  });
  return `${DEEPGRAM_URL}?${params.toString()}`;
};

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

  // DEEPGRAM SPEECH TO TEXT IMPLEMENTATION
  const processAudioWithDeepgram = useCallback(async (audioFile: string) => {
    try {
      setIsLoading(true);
      console.log('1. Starting Deepgram processing...');
      // Determine mime type
      const fileExt = audioFile.split('.').pop() || 'wav';
      const mimeType = fileExt === 'm4a' ? 'audio/mp4' : `audio/${fileExt}`;
      // 1. Read file natively using react-native-fs (Proven to work!)
      console.log('2. Reading file...');
      const base64Audio = await readFile(audioFile, 'base64');
      // 2. Convert Base64 to Binary Buffer
      console.log('3. Converting to buffer...');
      const binaryAudio = Buffer.from(base64Audio, 'base64');
      // 3. Send raw binary to Deepgram
      console.log('4. Sending to Deepgram API...');
      const response = await fetch(getDeepgramUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Token ${DEEPGRAM_API.trim()}`,
          // You can use the specific mimeType, or fallback to octet-stream
          'Content-Type': mimeType,
        },
        body: binaryAudio,
      });
      console.log('5. Status received:', response.status);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Deepgram API failed (${response.status}): ${errText}`);
      }
      const data: DeepgramResponse = await response.json();
      const alt = data?.results?.channels?.[0]?.alternatives?.[0];
      console.log('6. Success!');
      return {
        fulltext: alt?.transcript?.trim() || 'No speech detected',
        utterances: alt?.utterances || [],
      };
    } catch (error: any) {
      setSttErrorVisible(true);
      setSttErrorMessage(
        error?.message
          ? `Transcription failed: ${error.message}`
          : 'Failed to transcribe audio. Please check your internet connection and try again.',
      );
      console.log('STT Error Deepgram:', error.message);
      throw error;
    } finally { setIsLoading(false);}
  }, []);

  // WAV2VEC2 SPEECH TO TEXT IMPLEMENTATION
  const processAudioWithHubert = useCallback(
    async (audioFile: string): Promise<string> => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        const fileUri = audioFile.startsWith('file://')
          ? audioFile
          : `file://${audioFile}`;

        // ✅ Field name "file" matches HuggingFace Space endpoint
        formData.append('file', {
          uri: fileUri,
          name: 'audio.wav',
          type: 'audio/wav',
        } as any);

        const response = await fetch(
          'https://cisckids-hubertapi.hf.space/transcribe',
          {
            method: 'POST',
            // ✅ No Content-Type header — fetch auto-sets multipart boundary
            headers: {
              Accept: 'application/json',
            },
            body: formData,
          },
        );

        // ✅ Read raw text first so errors are always readable
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Upload failed ${response.status}: ${responseText.substring(
              0,
              200,
            )}`,
          );
        }

        let data: any = responseText;
        try {
          data = JSON.parse(responseText);
        } catch {
          // Some endpoints can return plain text; keep raw body as fallback.
        }
        const transcript = extractTranscript(data);

        if (!transcript?.trim()) {
          throw new Error(' ');
        }

        return transcript;
      } catch (error: any) {
        setSttErrorVisible(true);
        setSttErrorMessage(
          error?.message
            ? `Transcription failed: ${error.message}`
            : 'Failed to transcribe audio. Please check your internet connection and try again.',
        );
        console.log('STT Error (Wav2Vec2): ' + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // WAV2VEC2 SPEECH TO TEXT IMPLEMENTATION
  const processAudioWithWav2Vec2 = useCallback(
    async (audioFile: string): Promise<string> => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        const fileUri = audioFile.startsWith('file://')
          ? audioFile
          : `file://${audioFile}`;

        // ✅ Field name "file" matches HuggingFace Space endpoint
        formData.append('file', {
          uri: fileUri,
          name: 'audio.wav',
          type: 'audio/wav',
        } as any);

        const response = await fetch(
          'https://cisckids-wav2vec2api.hf.space/transcribe',
          {
            method: 'POST',
            // ✅ No Content-Type header — fetch auto-sets multipart boundary
            headers: {
              Accept: 'application/json',
            },
            body: formData,
          },
        );

        // ✅ Read raw text first so errors are always readable
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Upload failed ${response.status}: ${responseText.substring(
              0,
              200,
            )}`,
          );
        }

        let data: any = responseText;
        try {
          data = JSON.parse(responseText);
        } catch {
          // Some endpoints can return plain text; keep raw body as fallback.
        }
        const transcript = extractTranscript(data);

        if (!transcript?.trim()) {
          throw new Error(' ');
        }

        return transcript;
      } catch (error: any) {
        setSttErrorVisible(true);
        setSttErrorMessage(
          error?.message
            ? `Transcription failed: ${error.message}`
            : 'Failed to transcribe audio. Please check your internet connection and try again.',
        );
        console.log('STT Error (Wav2Vec2): ' + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // WHISPER SPEECH TO TEXT IMPLEMENTATION
  const processAudioWithWhisper = useCallback(
    async (audioFile: string): Promise<string> => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        const fileExt = audioFile.split('.').pop() || 'wav';
        const mimeType = fileExt === 'm4a' ? 'audio/mp4' : `audio/${fileExt}`;
        const fileUri = audioFile.startsWith('file://')
          ? audioFile
          : `file://${audioFile}`;

        // ✅ Field name "file" matches HuggingFace Space endpoint
        formData.append('file', {
          uri: fileUri,
          name: `audio.${fileExt}`,
          type: mimeType,
        } as any);

        const response = await fetch(
          'https://cisckids-whisperapi.hf.space/transcribe',
          {
            method: 'POST',
            // ✅ No Content-Type header — fetch auto-sets multipart boundary
            headers: {
              Accept: 'application/json',
            },
            body: formData,
          },
        );

        // ✅ Read raw text first so errors are always readable
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Upload failed ${response.status}: ${responseText.substring(
              0,
              200,
            )}`,
          );
        }

        let data: any = responseText;
        try {
          data = JSON.parse(responseText);
        } catch {
          // Some endpoints can return plain text; keep raw body as fallback.
        }
        const transcript = extractTranscript(data);

        if (!transcript?.trim()) {
          console.log('Whisper Unparsed API Response:', JSON.stringify(data));
          throw new Error('No Speech Detected!');
        }

        return transcript;
      } catch (error: any) {
        setSttErrorVisible(true);
        setSttErrorMessage(
          error?.message
            ? `Transcription failed: ${error.message}`
            : 'Failed to transcribe audio. Please check your internet connection and try again.',
        );
        console.log('STT Error (Whisper): ' + error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    processAudioWithAssemblyAI,
    processAudioWithDeepgram,
    processAudioWithWav2Vec2,
    processAudioWithWhisper,
    processAudioWithHubert,
    getSimulatedResponse,
    // ── STT error modal ──────────────────────────────────────────────────────
    sttErrorVisible,
    sttErrorMessage,
    clearSttError,
  };
};
