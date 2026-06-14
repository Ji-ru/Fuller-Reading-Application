// api.ts
// This file handles communication with your custom Hugging Face AI backend.
// For offline capability, it uses the local Whisper module.

// Import the native Whisper module directly for offline transcription
const { WhisperModule } = require('react-native').NativeModules;

const LOCAL_MODEL_PATH = 'ggml-model-small-q6_K.bin';

/**
 * Transcribes audio using the local Whisper model (offline capability).
 * @param audioUri - The local file URI of the recorded audio (wav file)
 * @returns The transcribed Tagalog text, or an error message.
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  console.log('[api.ts] transcribeAudio called with:', audioUri);
  
  if (!WhisperModule) {
    console.error('[api.ts] WhisperModule not available');
    throw new Error('WhisperModule not available. Check native linking.');
  }

  try {
    // Normalize path: strip file:// prefix if present (JNI needs filesystem path)
    const normalizedPath = audioUri.startsWith('file://')
      ? audioUri.substring(7)
      : audioUri;

    console.log('[api.ts] initModel with:', LOCAL_MODEL_PATH);
    
    // Initialize model (loads from assets if not already loaded)
    const initResult = await WhisperModule.initModel(LOCAL_MODEL_PATH);
    console.log('[api.ts] initModel result:', initResult);
    
    if (!initResult?.success) {
      throw new Error('Model initialization failed: ' + JSON.stringify(initResult));
    }

    console.log('[api.ts] transcribe with path:', normalizedPath);
    // Transcribe with Tagalog language
    const result = await WhisperModule.transcribe(normalizedPath, 'fil', '');
    console.log('[api.ts] transcribe result:', result);
    
    const text = (result?.text || result || '').trim();
    
    if (!text) {
      throw new Error('Walang natukoy na pagbigkas! (Empty result)');
    }
    
    return text;
    
  } catch (error: any) {
    console.error('[api.ts] Local Whisper error:', error.message || error);
    throw new Error(error.message || 'Mali, Hindi Maiproseso ang iyong boses, Pakisubukan muli.');
  }
}