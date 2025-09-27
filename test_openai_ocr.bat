@echo off
echo ========================================
echo TEST OCR AVEC OPENAI VISION
echo ========================================
echo.

REM Demander la cle API si pas deja definie
if "%OPENAI_API_KEY%"=="" (
    set /p OPENAI_API_KEY="Entrez votre cle API OpenAI (sk-...): "
)

echo Test sur l'image des BURGERS...
python ocr_openai.py "C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\CATEGORIES\BURGERS\burgers.jpg"

echo.
echo ========================================
echo Pour tester d'autres images:
echo python ocr_openai.py "chemin\vers\image.jpg"
echo ========================================

pause