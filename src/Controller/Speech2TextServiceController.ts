/**
 * Speech2TextServiceController.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook for speech-to-text transcription.
 *
 * CURRENT:  OpenAI Whisper (large-v3) via Hugging Face Inference API
 *           → handles Filipino/Tagalog natively with `language: 'fil'`
 *           → free tier available, no credit card needed to start
 *
 * LATER (when your custom model is ready):
 *   1. Host your model (Hugging Face Space / your own server)
 *   2. Change ONE constant:  ACTIVE_PROVIDER = 'custom'
 *   3. Fill in CUSTOM_MODEL_URL
 *   4. Adjust parseCustomResponse() if your response shape differs
 *   Done — everything else (recording, analysis, storage) stays the same.
 *
 * Setup (current pretrained):
 *   1. Create a free account at huggingface.co
 *   2. Generate a token at huggingface.co/settings/tokens (read-only is fine)
 *   3. Add to your .env:
 *        HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from 'react';
import { readFile } from 'react-native-fs';
import { HUGGINGFACE_API_KEY } from '@env';
import { Buffer } from 'buffer';

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER SWITCH
// Change this one constant when your custom model is ready.
// ─────────────────────────────────────────────────────────────────────────────

type Provider = 'whisper' | 'custom';
const ACTIVE_PROVIDER = 'whisper' as Provider;

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = {
  /**
   * Whisper large-v3 via HF Inference API.
   * Docs: huggingface.co/openai/whisper-large-v3
   */
  whisper: 'https://api-inference.huggingface.co/models/openai/whisper-large-v3',

  /**
   * YOUR CUSTOM MODEL — fill this in when it is deployed.
   * Could be a HF Space URL, your own FastAPI server, etc.
   * Example: 'https://your-org-cisc-asr.hf.space/run/predict'
   */
  custom: '',
} as const;

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

  /**
   * Send the WAV file to Whisper (large-v3) on Hugging Face.
   *
   * HF Inference API for ASR:
   *   - Accepts raw audio bytes in the request body
   *   - Returns { text: "transcription" }
   *
   * We pass `language` and `initial_prompt` as query parameters.
   * `initial_prompt` is the key quality lever — giving Whisper the passage text
   * primes its language model toward words it is likely to hear, reducing
   * hallucinations on Tagalog proper nouns and uncommon vocabulary.
   */
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
      const binary  = Buffer.from(base64, 'base64');

      /**
       * Build a short initial_prompt from the target text.
       * Whisper uses this as a soft prior — it doesn't force the output
       * to match, but it greatly reduces errors on domain-specific words.
       * We cap it at 224 tokens (Whisper's limit) by taking the first
       * 800 characters, which is well within limits for typical passages.
       */
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

  // ── PROVIDER: Your custom model ────────────────────────────────────────────

  /**
   * ─────────────────────────────────────────────────────────────────────────
   * CUSTOM MODEL INTEGRATION POINT
   * ─────────────────────────────────────────────────────────────────────────
   * When your Filipino ASR model is deployed, implement this function.
   *
   * Steps:
   *  1. Set CUSTOM_MODEL_URL to your endpoint.
   *  2. Adjust the request body to match your server's expected format.
   *  3. Adjust parseCustomResponse() to extract the transcript string.
   *  4. Set ACTIVE_PROVIDER = 'custom' at the top of this file.
   *
   * Everything else — recording, analysis, Firestore storage — stays the same.
   * ─────────────────────────────────────────────────────────────────────────
   */
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

      const base64 = await readFile(audioFilePath, 'base64');

      /**
       * ADJUST THIS REQUEST to match your model's expected input format.
       *
       * Common patterns:
       *  A) Gradio Space (predict endpoint):
       *       body: JSON.stringify({ data: [`data:audio/wav;base64,${base64}`] })
       *       response: result.data[0]
       *
       *  B) FastAPI / Flask server:
       *       body: JSON.stringify({ audio: base64, language: 'fil' })
       *       response: result.transcript
       *
       *  C) HF Inference Endpoint (same as Whisper above):
       *       body: binary bytes, Content-Type: audio/wav
       *       response: result.text
       */
      const response = await fetch(ENDPOINTS.custom, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64,
          language: 'fil',
          prompt: options.targetText.slice(0, 800),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Custom model error ${response.status}: ${body}`);
      }

      const result = await response.json();

      // ADJUST THIS to match your model's response shape
      const transcript = parseCustomResponse(result);

      if (!transcript.trim()) {
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

        if (ACTIVE_PROVIDER === 'custom') {
          return await transcribeWithCustomModel(audioFilePath, options);
        }

        // Default: whisper
        return await transcribeWithWhisper(audioFilePath, options);

      } finally {
        setIsLoading(false);
      }
    },
    [transcribeWithWhisper, transcribeWithCustomModel],
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
      const idx     = Math.floor(Math.random() * words.length);
      const mutated = [...words];
      mutated[idx]  = 'bagay';
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