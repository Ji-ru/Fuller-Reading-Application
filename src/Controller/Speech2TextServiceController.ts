/**
 * Speech2TextServiceController.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook for speech-to-text transcription.
 *
 * PROVIDERS:
 *   - 'local'  → uses GGML model embedded in app (no internet required)
 *   - 'custom' → your HF Space API endpoint
 *   - 'whisper' → HuggingFace Inference API (legacy)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HUGGINGFACE_API_KEY } from '@env';
import { Buffer } from 'buffer';
import { useCallback, useState } from 'react';
import { readFile } from 'react-native-fs';

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER SWITCH
// ─────────────────────────────────────────────────────────────────────────────

type Provider = 'local' | 'custom' | 'whisper';
// Set to 'custom' for CISC Kids Hugging Face Space API
const ACTIVE_PROVIDER = 'custom' as Provider;

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  whisper: 'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
  custom: 'https://cisckids2026-marungko-whisperapi.hf.space/transcribe',
} as const;

// Model path for local inference (in Android assets)
// Path relative to android/app/src/main/assets/
const LOCAL_MODEL_PATH = 'models/ggml-tiny-q5_1.bin';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ReadingType = 'alphabet' | 'word' | 'passage';

interface TranscriptionOptions {
  /** Reading type — used to pick the right post-processing */
  type: ReadingType;
  /**
   * The expected target text.
   * Passed to Whisper as `initial_prompt` so it biases recognition
   * toward vocabulary in the passage (especially Tagalog proper nouns).
   */
  targetText: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useSpeechToText = () => {
  const [isLoading, setIsLoading] = useState(false);

  // ── Internal: clean raw transcript ─────────────────────────────────────────

  /**
   * Normalise a raw transcript string:
   *  - trim whitespace
   *  - collapse multiple spaces
   *  - lowercase
   *  - strip Whisper artefacts like "[BLANK_AUDIO]", "(Music)", timestamps
   */
  const cleanTranscript = useCallback((raw: string): string => {
    return raw
      .replace(/\[.*?\]/g, '')          // [BLANK_AUDIO], [Music], etc.
      .replace(/\(.*?\)/g, '')          // (applause), (Music)
      .replace(/<\|.*?\|>/g, '')        // Whisper timestamp tokens <|0.00|>
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }, []);

  // ── PROVIDER: Whisper via HF Inference API ─────────────────────────────────

  const transcribeWithWhisper = useCallback(
    async (
      audioFilePath: string,
      options: TranscriptionOptions,
    ): Promise<string> => {
      if (!HUGGINGFACE_API_KEY) {
        throw new Error(
          'HUGGINGFACE_API_KEY is not set. Add it to your .env file.',
        );
      }

      // Read WAV as base64 then convert to binary for the request body
      const base64 = await readFile(audioFilePath, 'base64');
      const binary = Buffer.from(base64, 'base64');

      const prompt = options.targetText.slice(0, 800);

      const params = `language=fil&initial_prompt=${encodeURIComponent(prompt)}`;
      const url = `${ENDPOINTS.whisper}?${params}`;

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'audio/wav',
        },
        body: binary,
      });

      if (!response.ok) {
        const body = await response.text();

        // HF returns 503 when the model is loading (cold start ~20s)
        if (response.status === 503) {
          throw new Error(
            'Model is loading. Please wait a moment and try again.',
          );
        }

        throw new Error(`Whisper API error ${response.status}: ${body}`);
      }

      const data = await response.json();

      // HF ASR endpoint returns { text: "..." }
      const raw = data?.text ?? '';
      if (!raw.trim()) {
        throw new Error('Walang natukoy na pagbigkas!');
      }

      return cleanTranscript(raw);
    },
    [cleanTranscript],
  );

// ── PROVIDER: Local Whisper (GGML model embedded in app) ─────────────────────
// Note: This requires native whisper.cpp integration (not yet complete)
// The ggml-custom.bin model is ready in android/app/src/main/assets/models/

const transcribeWithLocalWhisper = useCallback(
    async (
      audioFilePath: string,
      options: TranscriptionOptions,
    ): Promise<string> => {
      try {
        const { WhisperModule } = require('react-native').NativeModules;

        // Initialize model if not already initialized (using smaller model)
        await WhisperModule.initModel('ggml-tiny-q5_1.bin');

        // Transcribe with Tagalog/Filipino language and target text as prompt
        const result = await WhisperModule.transcribe(
          audioFilePath,
          'fil',
          options.targetText.slice(0, 800),
        );
        return cleanTranscript(result.text || result);
      } catch (error) {
        throw new Error(
          'Local Whisper failed: ' +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    },
    [cleanTranscript],
  );

  // ── PROVIDER: Your custom model ────────────────────────────────────────────

  const transcribeWithCustomModel = useCallback(
    async (
      audioFilePath: string,
      options: TranscriptionOptions,
    ): Promise<string> => {
      if (!ENDPOINTS.custom) {
        throw new Error(
          'Custom model URL is not set. Fill in ENDPOINTS.custom in Speech2TextServiceController.ts',
        );
      }

      const formData = new FormData();

      const fileUri = audioFilePath.startsWith("file://") ? audioFilePath : "file://" + audioFilePath;

      formData.append("file", {
        uri: fileUri,
        name: "recording.wav",
        type: "audio/wav",
      } as any);

      const response = await fetch(ENDPOINTS.custom, {
        method: 'POST',
        body: formData,
        headers: {
          "Accept": "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Custom model error ${response.status}: ${responseText.substring(0, 50)}...`);
      }

      // We expect JSON back from your HF Space FastAPI endpoint.
      const result = JSON.parse(responseText);

      // ADJUST THIS to match your model's response shape
      const transcript = parseCustomResponse(result) || result.transcript || result.text || responseText;

      if (!transcript || !transcript.trim()) {
        throw new Error('Walang natukoy na pagbigkas!');
      }

      return cleanTranscript(transcript);
    },
    [cleanTranscript],
  );

  /**
   * Extract the transcript string from your custom model's response.
   * Change this to match your API's actual response format.
   */
  const parseCustomResponse = (result: any): string => {
    // Gradio:      return result?.data?.[0] ?? '';
    // FastAPI:     return result?.transcript ?? '';
    // HF Endpoint: return result?.text ?? '';
    return result?.text ?? result?.transcript ?? result?.data?.[0] ?? '';
  };

  // ── Public transcription function ──────────────────────────────────────────

  /**
   * Main entry point — called by Student_Reading_Activity after recording stops.
   *
   * Routes to the active provider (whisper | custom).
   * Type and targetText are passed through so each provider can optimise
   * its request (model config, prompts, etc.) per reading mode.
   *
   * @param audioFilePath - Absolute path to the .wav file
   * @param type          - 'alphabet' | 'word' | 'passage'
   * @param targetText    - The expected reading text (used as recognition hint)
   * @returns             - Cleaned, lowercased transcript string
   * @throws              - If the API call fails or returns empty audio
   */
  const transcribeAudio = useCallback(
    async (
      audioFilePath: string,
      type: ReadingType,
      targetText: string,
    ): Promise<string> => {
      setIsLoading(true);
      try {
        const options: TranscriptionOptions = { type, targetText };

        if (ACTIVE_PROVIDER === 'local') {
          return await transcribeWithLocalWhisper(audioFilePath, options);
        }

        if (ACTIVE_PROVIDER === 'custom') {
          return await transcribeWithCustomModel(audioFilePath, options);
        }

        // Default: whisper
        return await transcribeWithWhisper(audioFilePath, options);
      } finally {
        setIsLoading(false);
      }
    },
    [transcribeWithWhisper, transcribeWithCustomModel, transcribeWithLocalWhisper],
  );

  // ── Development fallback ───────────────────────────────────────────────────

  /**
   * Simulates a slightly-imperfect STT response for local development
   * when no API key is available.
   *
   * Randomly applies one of three mutations so miscue detection
   * produces non-trivial results during testing:
   *   - perfect match       (33%)
   *   - one word omitted    (33%)
   *   - one word substituted(33%)
   */
  const getSimulatedResponse = useCallback((passageText: string): string => {
    const words = passageText.toLowerCase().trim().split(/\s+/);

    if (words.length <= 2) return words.join(' ');

    const roll = Math.random();

    if (roll < 0.33) {
      // Perfect
      return words.join(' ');
    } else if (roll < 0.66) {
      // Omit a random middle word
      const idx = 1 + Math.floor(Math.random() * (words.length - 2));
      return words.filter((_, i) => i !== idx).join(' ');
    } else {
      // Substitute a random word
      const idx = Math.floor(Math.random() * words.length);
      const mutated = [...words];
      mutated[idx] = 'bagay';
      return mutated.join(' ');
    }
  }, []);

  // ── Expose ─────────────────────────────────────────────────────────────────

  return {
    isLoading,
    transcribeAudio,       // use this in Student_Reading_Activity
    getSimulatedResponse,  // fallback for dev/offline
  };
};
