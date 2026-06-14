# quantize-model.ps1 - Quantize your fine-tuned Whisper model for Android
# Run this script after ensuring cmake is in PATH (from MSI installer)

Write-Host "=== Quantizing YOUR WHISPER MODEL for Android ===" -ForegroundColor Cyan

# Step 1: Extract vocab files from your tokenizer.json
Write-Host "Step 1: Extracting vocab files from YOUR model..." -ForegroundColor Yellow
python -c "
import json
with open('assets\model\tokenizer.json', 'r', encoding='utf8') as f:
    data = json.load(f)
model = {k: v for k, v in data.get('model', {}).get('vocab', {}).items()}
with open('assets\model\vocab.json', 'w', encoding='utf8') as f:
    json.dump(model, f, ensure_ascii=False)
added = data.get('added_tokens', [])
tokens = {t['content']: t['id'] for t in added}
with open('assets\model\added_tokens.json', 'w', encoding='utf8') as f:
    json.dump(tokens, f, ensure_ascii=False)
print('Created vocab.json and added_tokens.json from YOUR model')
"

# Step 2: Convert YOUR model to GGML format
Write-Host "Step 2: Converting YOUR fine-tuned model to GGML..." -ForegroundColor Yellow
python .\whisper.cpp\models\convert-h5-to-ggml.py .\assets\model\ .\whisper .
Write-Host "Created ggml-model.bin from YOUR model.safetensors" -ForegroundColor Green

# Step 3: Build quantize tool
Write-Host "Step 3: Building quantize tool..." -ForegroundColor Yellow
cmake -B .\whisper.cpp\build -S .\whisper.cpp -DCMAKE_BUILD_TYPE=Release
cmake --build .\whisper.cpp\build --config Release

# Step 4: Quantize to q6_K (~90MB)
Write-Host "Step 4: Quantizing YOUR model to q6_K (~90MB)..." -ForegroundColor Yellow
.\whisper.cpp\build\bin\Release\quantize.exe .\ggml-model.bin .\ggml-model-small-q6_K.bin q6_K

# Step 5: Copy to Android assets
Write-Host "Step 5: Copying quantized model to Android assets..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".\android\app\src\main\assets\models" -ErrorAction SilentlyContinue
Copy-Item -LiteralPath ".\ggml-model-small-q6_K.bin" -Destination ".\android\app\src\main\assets\models\" -Force

# Step 6: Cleanup temp files
Write-Host "Step 6: Cleaning up..." -ForegroundColor Yellow
Remove-Item -LiteralPath ".\ggml-model.bin", ".\assets\model\vocab.json", ".\assets\model\added_tokens.json" -Force -ErrorAction SilentlyContinue

Write-Host "=== SUCCESS! YOUR fine-tuned model is at android\app\src\main\assets\models\ggml-model-small-q6_K.bin ===" -ForegroundColor Green