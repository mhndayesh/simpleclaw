@echo off
echo [START] SimpleClaw Sequential Launch...

:: 1. Build Check
if not exist "dist\index.js" (
    echo [START] First-time build required...
    call npm run setup
)

:: 2. Background Browser Opener
echo [START] Opening Browser at http://localhost:3001 in 3 seconds...
start /b cmd /c "timeout /t 3 /nobreak >NUL && start http://localhost:3001"

:: 3. Launch Backend in Foreground
echo [START] Launching SimpleClaw in this terminal...
node dist/index.js
