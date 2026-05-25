/**
 * WhisperModule - TypeScript wrapper for native whisper.cpp
 */
import { NativeModules } from 'react-native';

const { WhisperModule } = NativeModules;

export interface WhisperResult {
  text: string;
}

/**
 * Initialize the Whisper model
 * @param modelName - Name of the model file in assets/models/
 * @returns Promise resolving to success boolean
 */
export const initWhisper = async (modelName: string = 'ggml-custom.bin'): Promise<boolean> => {
  if (!WhisperModule) {
    throw new Error('WhisperModule not available. Check native linking.');
  }
  
  try {
    const result = await WhisperModule.initModel(modelName);
    return result?.success ?? false;
  } catch (error: any) {
    throw new Error(`Failed to init whisper: ${error.message}`);
  }
};

/**
 * Transcribe an audio file
 * @param audioPath - Path to the .wav file
 * @param language - Language code (e.g., 'fil' for Filipino, 'en' for English)
 * @returns Promise resolving to transcription text
 */
export const transcribeAudio = async (
  audioPath: string,
  language: string = 'fil'
): Promise<string> => {
  if (!WhisperModule) {
    throw new Error('WhisperModule not available. Check native linking.');
  }

  try {
    const result = await WhisperModule.transcribe(audioPath, language);
    return result?.text ?? '';
  } catch (error: any) {
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

/**
 * Release model resources
 */
export const releaseWhisper = async (): Promise<boolean> => {
  if (!WhisperModule) {
    return false;
  }

  try {
    const result = await WhisperModule.release();
    return result?.success ?? false;
  } catch (error) {
    return false;
  }
};