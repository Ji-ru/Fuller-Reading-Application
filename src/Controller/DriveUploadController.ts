import RNFS from 'react-native-fs';
import { APPS_SCRIPT_URL, UPLOAD_SECRET } from '@env';

type WordUploadMetadata = {
  kind: 'word';
  chapterId: number;
  lessonId: number;
  targetWord: string;
  miscueCount: number;
  accuracyRate: number;
};

type PassageUploadMetadata = {
  kind: 'passage';
  passageTitle: string;
  miscueCount: number;
  accuracyRate: number;
};

export type UploadMetadata = (WordUploadMetadata | PassageUploadMetadata) & { spokenText?: string };

type UploadResult =
  | { ok: true; fileId: string; finalName: string }
  | { ok: false; error: string };

export async function uploadRecording(
  localPath: string,
  metadata: UploadMetadata,
): Promise<UploadResult> {
  try {
    if (!metadata.spokenText || metadata.spokenText.trim() === '' || metadata.spokenText.trim() === 'No Speech Detected!') {

      return { ok: false, error: 'no_speech_detected' };
    }

    if (!APPS_SCRIPT_URL || !UPLOAD_SECRET) {
      return { ok: false, error: 'env_not_configured' };
    }
    if (!localPath) {
      return { ok: false, error: 'no_local_path' };
    }

    const exists = await RNFS.exists(localPath);
    if (!exists) {
      return { ok: false, error: 'file_missing' };
    }

    const audioBase64 = await RNFS.readFile(localPath, 'base64');

    const body = JSON.stringify({
      secret: UPLOAD_SECRET,
      audioBase64,
      ...metadata,
    });

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const json = (await res.json()) as UploadResult & { version?: string };
    if (json.ok) {

    } else {
      console.warn('[DriveUpload] server rejected:', json.error);
    }
    return json;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[DriveUpload] failed:', msg);
    return { ok: false, error: msg };
  }
}
