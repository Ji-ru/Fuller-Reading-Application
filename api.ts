// api.ts
// This file handles communication with your custom Hugging Face AI backend.

const API_URL = "https://jayac0r30-marungko.hf.space/transcribe";

/**
 * Sends an audio file to the custom HuBERT API for transcription.
 * @param audioUri - The local file URI of the recorded audio (from expo-av)
 * @returns The transcribed Tagalog text, or an error message.
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  try {
    console.log("Preparing to send audio to:", API_URL);

    const formData = new FormData();
    
    // Ensure the URI has the file:// prefix required by React Native fetch
    const fileUri = audioUri.startsWith("file://") ? audioUri : "file://" + audioUri;

    // To send a file object with uri/name/type, we cast it to `any` 
    // to stop TypeScript from throwing a type error.
    formData.append("file", {
      uri: fileUri,
      name: "recording.wav", 
      type: "audio/wav",     
    } as any);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("Raw Server Response:", responseText);

    if (!response.ok) {
        console.error(`HTTP Error ${response.status}: ${responseText}`);
        return `Server Error ${response.status}: ${responseText.substring(0, 50)}...`;
    }

    // Parse the JSON response
    const result = JSON.parse(responseText);
    
    if (result.status === "success" || result.transcript || result.text) {
        const text = (result.transcript || result.text || "").trim();
        console.log("Transcription result:", text);
        return text;
    } else {
        console.error("Server returned an error:", result.detail);
        return "Error transcribing audio. Please try again.";
    }

  } catch (error: any) {
    console.error("Network or Fetch Error:", error);
    return `Error: ${error.message || "Could not connect to the AI server."}`;
  }
}