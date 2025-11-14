export type MiscueType = 
  | 'substitution'
  | 'omission'
  | 'insertion'
  | 'repetition'
  | 'mispronunciation';

export interface Miscue {
  expected: string;
  spoken: string;
  position: number;
  timestamp: Date;
  type: MiscueType;
}

export interface RecordingState {
  isRecording: boolean;
  spokenText: string;
  miscues: Miscue[];
  hasPermission: boolean;
  isLoading: boolean;
  recordTime: number;
  audioPath: string;
  isReadingCompleted: boolean;
  currentWordIndex: number;
}