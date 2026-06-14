/**
 * WhisperModule - TypeScript declarations for native whisper.cpp module
 */
declare module 'react-native' {
  interface NativeModulesStatic {
    WhisperModule: {
      initModel(modelName: string): Promise<{ success: boolean }>;
      transcribe(
        audioPath: string,
        language: string,
        initialPrompt?: string
      ): Promise<{ text: string }>;
      release(): Promise<{ success: boolean }>;
    };
  }
}