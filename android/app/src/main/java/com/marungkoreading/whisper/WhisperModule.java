package com.marungkoreading.whisper;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class WhisperModule extends ReactContextBaseJavaModule {
    private static final String TAG = "WhisperModule";
    private long ctx = 0; // whisper_context pointer

    public WhisperModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "WhisperModule";
    }

    /**
     * Copy model from assets to app files directory and initialize
     */
    @ReactMethod
    public void initModel(String modelName, Promise promise) {
        try {
<<<<<<< HEAD
            // Copy model from assets if needed
            String modelPath = copyModelFromAssets(modelName);
            
            // Initialize whisper context
=======
            String modelPath = copyModelFromAssets(modelName);
            
>>>>>>> lugh/Marungko-Homefix-v4
            ctx = nativeInitContext(modelPath);
            
            if (ctx == 0) {
                promise.reject("INIT_ERROR", "Failed to initialize whisper context");
            } else {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                promise.resolve(result);
            }
        } catch (Exception e) {
            promise.reject("INIT_ERROR", e.getMessage());
        }
    }

    /**
     * Transcribe audio file
     */
    @ReactMethod
    public void transcribe(String audioPath, String language, String initialPrompt, Promise promise) {
        if (ctx == 0) {
            promise.reject("NOT_INITIALIZED", "Whisper model not initialized. Call initModel first.");
            return;
        }

        try {
            String result = nativeTranscribe(ctx, audioPath, language, initialPrompt);

            WritableMap map = Arguments.createMap();
            map.putString("text", result);
            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("TRANSCRIBE_ERROR", e.getMessage());
        }
    }

    /**
     * Free whisper context
     */
    @ReactMethod
    public void release(Promise promise) {
        if (ctx != 0) {
            nativeReleaseContext(ctx);
            ctx = 0;
        }
        WritableMap result = Arguments.createMap();
        result.putBoolean("success", true);
        promise.resolve(result);
    }

    /**
     * Copy model file from assets to app's files directory
     */
    private String copyModelFromAssets(String modelName) throws IOException {
        Context context = getReactApplicationContext();
        AssetManager assetManager = context.getAssets();
        
        File modelFile = new File(context.getFilesDir(), modelName);
        
        if (!modelFile.exists() || modelFile.length() == 0) {
            try (InputStream in = assetManager.open("models/" + modelName);
                 FileOutputStream out = new FileOutputStream(modelFile)) {
                
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                out.flush();
            }
            Log.d(TAG, "Model copied to: " + modelFile.getAbsolutePath());
        }
        
        return modelFile.getAbsolutePath();
    }

    // Native methods (implemented in C++)
    private static native long nativeInitContext(String modelPath);
    private static native String nativeTranscribe(long ctx, String audioPath, String language, String initialPrompt);
    private static native void nativeReleaseContext(long ctx);
}