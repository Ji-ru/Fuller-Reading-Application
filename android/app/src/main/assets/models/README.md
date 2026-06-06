# Whisper Model for Android

This directory contains the GGML-converted Whisper model for on-device speech-to-text.

## Model: `ggml-model-small-q6_K.bin`

- **Size**: ~487 MB (unquantized from your fine-tuned model)
- **Model**: Your Whisper-small fine-tuned for Tagalog reading assessment
- **Source**: Converted from `assets/model/model.safetensors`

## Status

✅ **Model is ready** - Your fine-tuned model has been converted and placed here for offline inference.

## Building (for future quantization)

To reduce APK size via quantization (~90MB), install CMake and run:
```powershell
cmake -B ..\whisper.cpp\build -S ..\whisper.cpp -DCMAKE_BUILD_TYPE=Release
cmake --build ..\whisper.cpp\build --config Release
..\whisper.cpp\build\bin\Release\quantize.exe ggml-model-small-q6_K.bin ggml-model-small-q6_K.bin q6_K
```

## LFS Tracking

Model files are tracked via Git LFS (see `.gitattributes`):
```
*.bin filter=lfs diff=lfs merge=lfs -text
*.safetensors filter=lfs diff=lfs merge=lfs -text
```