// whisper_jni.cpp - JNI wrapper for whisper.cpp local speech-to-text
#include <jni.h>
#include <string>
#include <android/log.h>
#include <whisper.h>
#include <vector>
#include <cstdint>
#include <cmath>
#include <algorithm>

#define TAG "WhisperJNI"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

extern "C" {

JNIEXPORT jlong JNICALL
Java_com_marungkoreading_whisper_WhisperModule_nativeInitContext(JNIEnv *env, jclass clazz, jstring model_path) {
    const char *path = env->GetStringUTFChars(model_path, 0);
    LOGD("Loading model from: %s", path);

    struct whisper_context *ctx = whisper_init_from_file(path);

    env->ReleaseStringUTFChars(model_path, path);

    if (ctx == nullptr) {
        LOGE("Failed to load model");
        return 0;
    }

    LOGD("Model loaded successfully");
    return (jlong)(intptr_t)ctx;
}

// WAV header structure for reading audio
#pragma pack(push, 1)
struct WAVHeader {
    char riff[4];
    int32_t fileSize;
    char wave[4];
    char fmt[4];
    int32_t fmtSize;
    int16_t audioFormat;
    int16_t numChannels;
    int32_t sampleRate;
    int32_t byteRate;
    int16_t blockAlign;
    int16_t bitsPerSample;
    char data[4];
    int32_t dataSize;
};
#pragma pack(pop)

// Read WAV file and return PCM float samples at 16kHz mono
static bool read_wav_file(const std::string& filename, std::vector<float>& pcmf32, int& sample_rate) {
    FILE* fp = fopen(filename.c_str(), "rb");
    if (!fp) {
        LOGE("Cannot open audio file: %s", filename.c_str());
        return false;
    }

    WAVHeader header;
    if (fread(&header, 1, sizeof(WAVHeader), fp) != sizeof(WAVHeader)) {
        LOGE("Failed to read WAV header");
        fclose(fp);
        return false;
    }

    if (strncmp(header.riff, "RIFF", 4) != 0 || strncmp(header.wave, "WAVE", 4) != 0) {
        LOGE("Not a valid WAV file");
        fclose(fp);
        return false;
    }

    sample_rate = header.sampleRate;
    int channels = header.numChannels;
    int bits = header.bitsPerSample;
    int dataBytes = header.dataSize;

    std::vector<int16_t> pcm16(dataBytes / (bits / 8));
    fread(pcm16.data(), 1, dataBytes, fp);
    fclose(fp);

    pcmf32.resize(pcm16.size() / channels);
    for (size_t i = 0; i < pcmf32.size(); i++) {
        float sample = 0;
        for (int c = 0; c < channels; c++) {
            sample += pcm16[i * channels + c];
        }
        sample /= channels;
        pcmf32[i] = sample / 32768.0f;
    }

    return true;
}

// Resample to target rate using simple linear interpolation
static std::vector<float> resample(const std::vector<float>& input, int input_rate, int output_rate) {
    if (input_rate == output_rate) return input;

    std::vector<float> output;
    float ratio = (float)input_rate / output_rate;
    size_t out_len = input.size() / ratio;
    output.resize(out_len);

    for (size_t i = 0; i < out_len; i++) {
        float pos = i * ratio;
        size_t idx = (size_t)pos;
        float frac = pos - idx;
        if (idx + 1 < input.size()) {
            output[i] = input[idx] * (1 - frac) + input[idx + 1] * frac;
        } else {
            output[i] = input[idx];
        }
    }
    return output;
}

JNIEXPORT jstring JNICALL
Java_com_marungkoreading_whisper_WhisperModule_nativeTranscribe(JNIEnv *env, jclass clazz,
                                                                 jlong ctx_ptr, jstring audio_path, jstring language, jstring initial_prompt) {
    struct whisper_context *ctx = (struct whisper_context *)(intptr_t)ctx_ptr;
    const char *path = env->GetStringUTFChars(audio_path, 0);
    const char *lang = env->GetStringUTFChars(language, 0);
    const char *prompt = initial_prompt ? env->GetStringUTFChars(initial_prompt, 0) : nullptr;

    // Read audio file
    std::vector<float> pcmf32;
    int sample_rate = 0;
    if (!read_wav_file(path, pcmf32, sample_rate)) {
        env->ReleaseStringUTFChars(audio_path, path);
        env->ReleaseStringUTFChars(language, lang);
        if (prompt) env->ReleaseStringUTFChars(initial_prompt, prompt);
        return env->NewStringUTF("");
    }

    // Resample to 16000 Hz if needed
    if (sample_rate != 16000) {
        pcmf32 = resample(pcmf32, sample_rate, 16000);
    }

    // Build whisper parameters
    whisper_full_params wparams = whisper_full_default_params(WHISPER_SAMPLING_GREEDY);
    wparams.print_realtime = false;
    wparams.print_progress = false;
    wparams.print_timestamps = false;
    wparams.translate = false;
    wparams.temperature = 0.0f;
    wparams.max_initial_ts = 0;
    wparams.length_penalty = -1.0f;
    wparams.temperature_inc = 0.0f;
    wparams.no_timestamps = true;

    // Set language
    if (lang && strlen(lang) > 0) {
        std::string lang_str(lang);
        if (lang_str == "fil" || lang_str == "tagalog") {
            wparams.language = "fil";
        } else {
            wparams.language = lang;
        }
    } else {
        wparams.language = "en";
    }

    // Set initial prompt for bias toward target text (Tagalog vocabulary)
    if (prompt && strlen(prompt) > 0) {
        wparams.initial_prompt = prompt;
    }

    // Run inference
    if (whisper_full(ctx, wparams, pcmf32.data(), pcmf32.size()) != 0) {
        LOGE("whisper_full failed");
        env->ReleaseStringUTFChars(audio_path, path);
        env->ReleaseStringUTFChars(language, lang);
        if (prompt) env->ReleaseStringUTFChars(initial_prompt, prompt);
        return env->NewStringUTF("");
    }

    // Get number of segments
    int n_segments = whisper_full_n_segments(ctx);
    std::string result;

    for (int i = 0; i < n_segments; i++) {
        const char* text = whisper_full_get_segment_text(ctx, i);
        if (text) {
            result += text;
            result += " ";
        }
    }

    // Trim trailing space
    if (!result.empty() && result.back() == ' ') {
        result.pop_back();
    }

    LOGD("Transcription: %s", result.c_str());

    env->ReleaseStringUTFChars(audio_path, path);
    env->ReleaseStringUTFChars(language, lang);
    if (prompt) env->ReleaseStringUTFChars(initial_prompt, prompt);

    return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_marungkoreading_whisper_WhisperModule_nativeReleaseContext(JNIEnv *env, jclass clazz, jlong ctx_ptr) {
    struct whisper_context *ctx = (struct whisper_context *)(intptr_t)ctx_ptr;
    if (ctx) {
        whisper_free(ctx);
        LOGD("Whisper context freed");
    }
}

} // extern "C"